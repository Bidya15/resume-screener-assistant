package com.synthweb.resumescreener.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class NoNullCharactersValidator implements ConstraintValidator<NoNullCharacters, String> {

    private static final char NUL = (char) 0;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        // null is handled by @NotBlank/@NotNull, not here
        return value == null || value.indexOf(NUL) < 0;
    }
}
