package com.synthweb.resumescreener.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.Instant;
import java.util.List;

/**
 * Central error handling. Extending {@link ResponseEntityExceptionHandler}
 * covers all standard Spring MVC failures (malformed JSON, wrong HTTP method,
 * type mismatch such as /api/analyses/abc, unknown route, ...); the overrides
 * below make those use our {@link ApiError} shape instead of ProblemDetail.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ---- our own exceptions -------------------------------------------------

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage(), request, null);
    }

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiError> handleInvalidRequest(InvalidRequestException ex, WebRequest request) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage(), request, null);
    }

    // ---- AI Service Failures ------------------------------------------------

    @ExceptionHandler(com.synthweb.resumescreener.ai.exception.AIServiceException.class)
    public ResponseEntity<ApiError> handleAiServiceFailure(
            com.synthweb.resumescreener.ai.exception.AIServiceException ex, WebRequest request) {
        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.SERVICE_UNAVAILABLE;
        if (status.is5xxServerError()) {
            log.error("AI service error: {}", ex.getMessage());
        } else {
            log.warn("AI service failure: {}", ex.getMessage());
        }
        return respond(status, ex.getMessage(), request, null);
    }

    // ---- database failures --------------------------------------------------

    /**
     * Covers connection failures / pool exhaustion
     * (CannotGetJdbcConnectionException is a subclass).
     */
    @ExceptionHandler(DataAccessResourceFailureException.class)
    public ResponseEntity<ApiError> handleDatabaseUnavailable(DataAccessResourceFailureException ex,
            WebRequest request) {
        log.error("Database unavailable", ex);
        return respond(HttpStatus.SERVICE_UNAVAILABLE,
                "The database is currently unavailable. Please try again later.", request, null);
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiError> handleDataAccess(DataAccessException ex, WebRequest request) {
        log.error("Database error", ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR,
                "A database error occurred while processing the request.", request, null);
    }

    // ---- catch-all ----------------------------------------------------------

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred.", request, null);
    }

    // ---- overrides of Spring MVC defaults ------------------------------------

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        List<ApiError.FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return ResponseEntity.status(status).headers(headers)
                .body(buildError(status, "Validation failed", request, violations));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex,
            @Nullable Object body,
            HttpHeaders headers,
            HttpStatusCode statusCode,
            WebRequest request) {
        String message;
        if (body instanceof ProblemDetail pd && pd.getDetail() != null) {
            message = pd.getDetail();
        } else {
            message = reasonPhrase(statusCode);
        }
        return ResponseEntity.status(statusCode).headers(headers)
                .body(buildError(statusCode, message, request, null));
    }

    // ---- helpers ---------------------------------------------------------------

    private ResponseEntity<ApiError> respond(HttpStatus status, String message, WebRequest request,
            List<ApiError.FieldViolation> violations) {
        return ResponseEntity.status(status).body(buildError(status, message, request, violations));
    }

    private ApiError buildError(HttpStatusCode status, String message, WebRequest request,
            List<ApiError.FieldViolation> violations) {
        String path = request.getDescription(false).replaceFirst("^uri=", "");
        return new ApiError(Instant.now(), status.value(), reasonPhrase(status), message, path, violations);
    }

    private String reasonPhrase(HttpStatusCode status) {
        HttpStatus resolved = HttpStatus.resolve(status.value());
        return resolved != null ? resolved.getReasonPhrase() : "Error";
    }
}
