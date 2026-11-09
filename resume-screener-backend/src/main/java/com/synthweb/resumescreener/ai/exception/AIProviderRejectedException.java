package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIProviderRejectedException extends AIServiceException {

    public AIProviderRejectedException() {
        this(null);
    }

    public AIProviderRejectedException(Throwable cause) {
        super("The AI provider rejected the request.", HttpStatus.BAD_GATEWAY, false, cause);
    }
}

