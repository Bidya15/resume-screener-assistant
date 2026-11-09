package com.synthweb.resumescreener.exception;

import java.time.Instant;
import java.util.List;

/** Consistent JSON error body returned for every failure. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        List<FieldViolation> fieldErrors
) {
    public record FieldViolation(String field, String message) {
    }
}
