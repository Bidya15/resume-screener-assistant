package com.synthweb.resumescreener.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class AnalysisRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private static Set<String> invalidFields(AnalysisRequest request) {
        return validator.validate(request).stream()
                .map(v -> v.getPropertyPath().toString())
                .collect(Collectors.toSet());
    }

    @Test
    void validRequestHasNoViolations() {
        AnalysisRequest request = new AnalysisRequest("Jane Doe", "Senior Java developer", "10 years of Java");
        assertThat(validator.validate(request)).isEmpty();
    }

    @Test
    void blankAndNullFieldsAreRejected() {
        assertThat(invalidFields(new AnalysisRequest("  ", "", null)))
                .containsExactlyInAnyOrder("candidateName", "jobDescription", "resumeText");
    }

    @Test
    void overlongFieldsAreRejected() {
        AnalysisRequest request = new AnalysisRequest("x".repeat(256), "y".repeat(20001), "z".repeat(50001));
        assertThat(invalidFields(request))
                .containsExactlyInAnyOrder("candidateName", "jobDescription", "resumeText");
    }

    @Test
    void nullCharactersAreRejected() {
        AnalysisRequest request = new AnalysisRequest("Jane", "JD text", "bad\u0000resume");
        Set<ConstraintViolation<AnalysisRequest>> violations = validator.validate(request);
        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getPropertyPath().toString()).isEqualTo("resumeText");
    }
}
