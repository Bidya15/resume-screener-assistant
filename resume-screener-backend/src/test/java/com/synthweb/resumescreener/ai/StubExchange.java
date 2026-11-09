package com.synthweb.resumescreener.ai;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.ExchangeFunction;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Supplier;

/**
 * Fake HTTP layer for WebClient: no sockets, no real Groq. Replies are consumed in order; the last one repeats.
 */
final class StubExchange implements ExchangeFunction {

    private final List<Supplier<Mono<ClientResponse>>> replies;
    private final AtomicInteger calls = new AtomicInteger();
    final List<ClientRequest> requests = new ArrayList<>();

    @SafeVarargs
    StubExchange(Supplier<Mono<ClientResponse>>... replies) {
        this.replies = Arrays.asList(replies);
    }

    @Override
    public Mono<ClientResponse> exchange(ClientRequest request) {
        requests.add(request);
        int i = Math.min(calls.getAndIncrement(), replies.size() - 1);
        return replies.get(i).get();
    }

    int calls() {
        return calls.get();
    }

    // ---- reply factories ----------------------------------------------------------------------------------

    static Supplier<Mono<ClientResponse>> ok(String modelContent) {
        String envelope;
        try {
            envelope = AiTestData.MAPPER.writeValueAsString(java.util.Map.of(
                    "id", "chatcmpl-1",
                    "choices", List.of(java.util.Map.of(
                            "index", 0,
                            "finish_reason", "stop",
                            "message", java.util.Map.of("role", "assistant", "content", modelContent)))));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
        return () -> Mono.just(json(HttpStatus.OK, envelope));
    }

    static Supplier<Mono<ClientResponse>> rawJson(String body) {
        return () -> Mono.just(json(HttpStatus.OK, body));
    }

    static Supplier<Mono<ClientResponse>> status(int code) {
        return () -> Mono.just(json(HttpStatusCode.valueOf(code), "{\"error\":{\"message\":\"provider text that must never be surfaced\"}}"));
    }

    static Supplier<Mono<ClientResponse>> error(Throwable t) {
        return () -> Mono.error(t);
    }

    static Supplier<Mono<ClientResponse>> slow(java.time.Duration delay) {
        return () -> Mono.delay(delay).then(Mono.just(json(HttpStatus.OK, "{}")));
    }

    private static ClientResponse json(HttpStatusCode status, String body) {
        return ClientResponse.create(status)
                .header("Content-Type", "application/json")
                .body(body)
                .build();
    }
}
