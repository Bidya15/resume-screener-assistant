package com.synthweb.resumescreener.ai.exception;

import java.util.List;

/**
 * Internal signal: the model output is unusable. The violation texts are written by the validator and
 * deliberately contain field names only, never model-supplied values, so they can safely be sent back to the model.
 */
public class AIResponseValidationException extends RuntimeException {

    private final List<String> violations;

    public AIResponseValidationException(List<String> violations) {
        super("AI response failed validation (" + violations.size() + " problem(s))");
        this.violations = List.copyOf(violations);
    }

    public List<String> violations() {
        return violations;
    }
}

