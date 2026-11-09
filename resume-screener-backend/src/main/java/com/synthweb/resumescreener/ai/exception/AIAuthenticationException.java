package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIAuthenticationException extends AIServiceException {

    public AIAuthenticationException() {
        this(null);
    }

    public AIAuthenticationException(Throwable cause) {
        super("The AI provider rejected the server credentials. Contact the administrator.", HttpStatus.SERVICE_UNAVAILABLE, false, cause);
    }
}

