package com.synthweb.resumescreener.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Optional;

/** Only the parts of Groq's response we use; everything else is ignored. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record GroqResponseDTO(List<Choice> choices) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(Message message, @JsonProperty("finish_reason") String finishReason) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(String role, String content) {
    }

    /** The text of the first choice, if the response has the expected shape. */
    public Optional<String> firstContent() {
        if (choices == null || choices.isEmpty() || choices.get(0) == null || choices.get(0).message() == null) {
            return Optional.empty();
        }
        String content = choices.get(0).message().content();
        return content == null || content.isBlank() ? Optional.empty() : Optional.of(content);
    }
}

