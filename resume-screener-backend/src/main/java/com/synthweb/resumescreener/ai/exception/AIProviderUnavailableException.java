package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIProviderUnavailableException extends AIServiceException {

    public AIProviderUnavailableException() {
        this(null);
    }

    public AIProviderUnavailableException(Throwable cause) {
        super("The AI provider is currently unavailable. Please try again later.", HttpStatus.SERVICE_UNAVAILABLE, true, cause);
    }
}

