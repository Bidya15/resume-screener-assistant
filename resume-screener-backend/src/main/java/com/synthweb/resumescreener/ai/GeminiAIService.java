package com.synthweb.resumescreener.ai;

import com.synthweb.resumescreener.ai.dto.GeminiProperties;
import com.synthweb.resumescreener.ai.dto.GeminiRequestDTO;
import com.synthweb.resumescreener.ai.dto.GeminiResponseDTO;
import com.synthweb.resumescreener.ai.dto.GroqRequestDTO;
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
import java.util.stream.Collectors;

/**
 * Service for communicating with the Google Gemini API.
 */
@Service
public class GeminiAIService {

    private static final Logger log = LoggerFactory.getLogger(GeminiAIService.class);

    private final WebClient webClient;
    private final GeminiProperties props;

    public GeminiAIService(@Qualifier("geminiWebClient") WebClient webClient, GeminiProperties props) {
        this.webClient = webClient;
        this.props = props;
    }

    public String complete(List<GroqRequestDTO.Message> messages) {
        if (!props.isConfigured()) {
            throw new AIConfigurationException();
        }

        // Combine system and user messages into a unified prompt context for Gemini
        String combinedPrompt = messages.stream()
                .map(m -> "[" + m.role().toUpperCase() + "]\n" + m.content())
                .collect(Collectors.joining("\n\n"));

        GeminiRequestDTO body = new GeminiRequestDTO(
                List.of(GeminiRequestDTO.Content.user(combinedPrompt)),
                GeminiRequestDTO.GenerationConfig.json(props.temperature())
        );

        String endpoint = String.format("%s/%s:generateContent", props.apiUrl(), props.model());

        GeminiResponseDTO response = Mono.defer(() -> callOnce(endpoint, body))
                .retryWhen(retryPolicy())
                .block();

        return response == null
                ? failEmpty()
                : response.firstContent().orElseGet(this::failEmpty);
    }

    private String failEmpty() {
        throw new AIUnexpectedResponseException();
    }

    private Mono<GeminiResponseDTO> callOnce(String endpoint, GeminiRequestDTO body) {
        return webClient.post()
                .uri(endpoint)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .header("x-goog-api-key", props.apiKey())
                .bodyValue(body)
                .exchangeToMono(this::handleResponse)
                .timeout(props.responseTimeout())
                .onErrorMap(GeminiAIService::translate);
    }

    private Mono<GeminiResponseDTO> handleResponse(ClientResponse response) {
        HttpStatusCode status = response.statusCode();
        if (status.is2xxSuccessful()) {
            return response.bodyToMono(GeminiResponseDTO.class);
        }
        return response.bodyToMono(String.class)
                .defaultIfEmpty("<empty body>")
                .flatMap(bodyText -> {
                    log.warn("Gemini API returned HTTP {}: {}", status.value(), bodyText);
                    return Mono.error(fromStatus(status.value()));
                });
    }

    static AIServiceException fromStatus(int status) {
        if (status == 400 || status == 403) {
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
            return new AIProviderUnavailableException(t);
        }
        return new AIUnexpectedResponseException(t);
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

    private Retry retryPolicy() {
        return Retry.backoff(props.maxRetries(), props.initialBackoff())
                .maxBackoff(props.maxBackoff())
                .jitter(0.25)
                .filter(t -> t instanceof AIServiceException e && e.isRetryable())
                .doBeforeRetry(s -> log.warn("Gemini call failed ({}). Retry {} of {}.",
                        s.failure().getClass().getSimpleName(), s.totalRetries() + 1, props.maxRetries()))
                .onRetryExhaustedThrow((spec, signal) -> signal.failure());
    }
}

