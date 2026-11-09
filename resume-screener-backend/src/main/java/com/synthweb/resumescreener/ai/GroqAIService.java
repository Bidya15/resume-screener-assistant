package com.synthweb.resumescreener.ai;

import com.synthweb.resumescreener.ai.dto.GroqProperties;
import com.synthweb.resumescreener.ai.dto.GroqRequestDTO;
import com.synthweb.resumescreener.ai.dto.GroqResponseDTO;
import com.synthweb.resumescreener.ai.exception.AIAuthenticationException;
import com.synthweb.resumescreener.ai.exception.AIConfigurationException;
import com.synthweb.resumescreener.ai.exception.AIProviderRejectedException;
import com.synthweb.resumescreener.ai.exception.AIProviderUnavailableException;
import com.synthweb.resumescreener.ai.exception.AIRateLimitException;
import com.synthweb.resumescreener.ai.exception.AIServiceException;
import com.synthweb.resumescreener.ai.exception.AITimeoutException;
import com.synthweb.resumescreener.ai.exception.AIUnexpectedResponseException;
import io.netty.channel.ConnectTimeoutException;
import io.netty.handler.timeout.TimeoutException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import java.util.List;

/**
 * The only class that talks to Groq. It sends the chat messages, maps HTTP failures to typed
 * {@link AIServiceException}s and retries the transient ones with exponential backoff.
 * <p>
 * It returns the model's raw text; parsing and validation live in {@link AIResponseValidator}.
 * It never logs the API key, the prompts or the model output.
 */
@Service
public class GroqAIService {

    private static final Logger log = LoggerFactory.getLogger(GroqAIService.class);

    private final WebClient webClient;
    private final GroqProperties props;

    public GroqAIService(@Qualifier("groqWebClient") WebClient webClient, GroqProperties props) {
        this.webClient = webClient;
        this.props = props;
    }

    /**
     * Blocks the calling (servlet) thread until Groq answers or the retry budget is spent. Blocking is fine
     * here: Spring MVC gives every request its own thread and WebClient is used only for its timeout/retry tooling.
     *
     * @return the assistant message content (never blank)
     */
    public String complete(List<GroqRequestDTO.Message> messages) {
        if (!props.isConfigured()) {
            throw new AIConfigurationException();
        }
        GroqRequestDTO body = new GroqRequestDTO(
                props.model(), messages, props.temperature(), props.maxCompletionTokens(),
                GroqRequestDTO.ResponseFormat.jsonObject());

        GroqResponseDTO response = Mono.defer(() -> callOnce(body))
                .retryWhen(retryPolicy())
                .block();

        return response == null
                ? failEmpty()
                : response.firstContent().orElseGet(this::failEmpty);
    }

    private String failEmpty() {
        throw new AIUnexpectedResponseException();
    }

    /** One HTTP attempt. Failures are translated here so the retry filter only sees AIServiceExceptions. */
    private Mono<GroqResponseDTO> callOnce(GroqRequestDTO body) {
        return webClient.post()
                .uri(props.apiUrl())
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .headers(h -> h.setBearerAuth(props.apiKey()))
                .bodyValue(body)
                .exchangeToMono(this::handleResponse)
                .timeout(props.responseTimeout())
                .onErrorMap(GroqAIService::translate);
    }

    private Mono<GroqResponseDTO> handleResponse(ClientResponse response) {
        HttpStatusCode status = response.statusCode();
        if (status.is2xxSuccessful()) {
            return response.bodyToMono(GroqResponseDTO.class);
        }
        return response.bodyToMono(String.class)
                .defaultIfEmpty("<empty body>")
                .flatMap(bodyText -> {
                    log.warn("Groq API returned HTTP {}: {}", status.value(), bodyText);
                    return Mono.error(fromStatus(status.value()));
                });
    }

    static AIServiceException fromStatus(int status) {
        if (status == 401 || status == 403) {
            return new AIAuthenticationException();
        }
        if (status == 429) {
            return new AIRateLimitException();
        }
        if (status == 408 || status >= 500) {
            return new AIProviderUnavailableException();
        }
        if (status >= 400) {
            return new AIProviderRejectedException();
        }
        return new AIUnexpectedResponseException();
    }

    static Throwable translate(Throwable t) {
        if (t instanceof AIServiceException) {
            return t;
        }
        if (hasCause(t, java.util.concurrent.TimeoutException.class, TimeoutException.class, ConnectTimeoutException.class)) {
            return new AITimeoutException(t);
        }
        if (t instanceof WebClientRequestException) {
            return new AIProviderUnavailableException(t);   // connection refused / reset / DNS failure
        }
        return new AIUnexpectedResponseException(t);   // includes JSON decoding problems in the response envelope
    }

    @SafeVarargs
    private static boolean hasCause(Throwable t, Class<? extends Throwable>... types) {
        for (Throwable c = t; c != null; c = c.getCause() == c ? null : c.getCause()) {
            for (Class<? extends Throwable> type : types) {
                if (type.isInstance(c)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Exponential backoff: wait roughly initialBackoff, 2x, 4x... (capped by maxBackoff, with jitter), at most
     * maxRetries times, and only for failures flagged retryable (429, 5xx, timeouts, network errors).
     * Authentication errors and other 4xx are permanent and fail immediately.
     */
    private Retry retryPolicy() {
        return Retry.backoff(props.maxRetries(), props.initialBackoff())
                .maxBackoff(props.maxBackoff())
                .jitter(0.25)
                .filter(t -> t instanceof AIServiceException e && e.isRetryable())
                .doBeforeRetry(s -> log.warn("Groq call failed ({}). Retry {} of {}.",
                        s.failure().getClass().getSimpleName(), s.totalRetries() + 1, props.maxRetries()))
                .onRetryExhaustedThrow((spec, signal) -> signal.failure());
    }
}
