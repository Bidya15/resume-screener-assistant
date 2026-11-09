package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIConfigurationException extends AIServiceException {

    public AIConfigurationException() {
        this(null);
    }

    public AIConfigurationException(Throwable cause) {
        super("AI analysis is not configured on the server.", HttpStatus.SERVICE_UNAVAILABLE, false, cause);
    }
}

