package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

public class AIUnexpectedResponseException extends AIServiceException {

    public AIUnexpectedResponseException() {
        this(null);
    }

    public AIUnexpectedResponseException(Throwable cause) {
        super("The AI provider returned an unexpected response.", HttpStatus.BAD_GATEWAY, false, cause);
    }
}

