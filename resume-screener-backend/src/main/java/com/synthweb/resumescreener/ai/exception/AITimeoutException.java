package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AITimeoutException extends AIServiceException {

    public AITimeoutException() {
        this(null);
    }

    public AITimeoutException(Throwable cause) {
        super("The AI provider did not respond in time. Please try again.", HttpStatus.GATEWAY_TIMEOUT, true, cause);
    }
}

