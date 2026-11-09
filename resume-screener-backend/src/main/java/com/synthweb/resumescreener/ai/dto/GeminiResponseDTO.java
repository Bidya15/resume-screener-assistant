package com.synthweb.resumescreener.ai.dto;

import java.util.List;
import java.util.Optional;

/**
 * Response payload from Google Gemini REST API:
 * candidates[0].content.parts[0].text
 */
public record GeminiResponseDTO(
        List<Candidate> candidates
) {
    public record Candidate(Content content, String finishReason) {}
    public record Content(List<Part> parts, String role) {}
    public record Part(String text) {}

    public Optional<String> firstContent() {
        if (candidates == null || candidates.isEmpty()) {
            return Optional.empty();
        }
        Candidate firstCandidate = candidates.get(0);
        if (firstCandidate.content() == null || firstCandidate.content().parts() == null || firstCandidate.content().parts().isEmpty()) {
            return Optional.empty();
        }
        String text = firstCandidate.content().parts().get(0).text();
        return (text == null || text.isBlank()) ? Optional.empty() : Optional.of(text);
    }
}

