package com.synthweb.resumescreener.exception;

/** Thrown for semantically invalid input that bean validation cannot express (HTTP 400). */
public class InvalidRequestException extends RuntimeException {

    public InvalidRequestException(String message) {
        super(message);
    }
}
