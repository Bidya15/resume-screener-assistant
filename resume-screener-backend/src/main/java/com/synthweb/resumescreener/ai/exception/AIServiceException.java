package com.synthweb.resumescreener.ai.exception;

import org.springframework.http.HttpStatus;

/**
 * Base type for every AI failure. Messages are written for API clients: they never contain the API key,
 * resume text, job description or model output. {@link #isRetryable()} drives the retry policy.
 */
public abstract class AIServiceException extends RuntimeException {

    private final HttpStatus status;
    private final boolean retryable;

    protected AIServiceException(String message, HttpStatus status, boolean retryable, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.retryable = retryable;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public boolean isRetryable() {
        return retryable;
    }
}

