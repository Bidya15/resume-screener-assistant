package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

/** The model's answer still failed validation after the single allowed correction attempt. */
public class AIInvalidResponseException extends AIServiceException {

    public AIInvalidResponseException(Throwable cause) {
        super("The AI returned a response that could not be validated. Please try again.",
                HttpStatus.BAD_GATEWAY, false, cause);
    }
}

