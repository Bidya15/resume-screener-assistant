package com.synthweb.resumescreener.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Rejects text containing the NUL character. PostgreSQL cannot store NUL in
 * text columns, so such input (common in badly extracted PDFs) would otherwise
 * surface as a confusing database error instead of a clean 400.
 */
@Documented
@Constraint(validatedBy = NoNullCharactersValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface NoNullCharacters {

    String message() default "must not contain null (\\0) characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
