package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIRateLimitException extends AIServiceException {

    public AIRateLimitException() {
        this(null);
    }

    public AIRateLimitException(Throwable cause) {
        super("The AI provider is rate limiting requests. Please try again shortly.", HttpStatus.TOO_MANY_REQUESTS, true, cause);
    }
}

