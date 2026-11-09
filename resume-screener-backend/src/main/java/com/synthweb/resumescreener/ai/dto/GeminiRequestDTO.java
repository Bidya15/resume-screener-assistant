package com.synthweb.resumescreener.ai.dto;

import java.util.List;

/**
 * Request payload for Google Gemini REST API:
 * POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent
 */
public record GeminiRequestDTO(
        List<Content> contents,
        GenerationConfig generationConfig
) {
    public record Content(String role, List<Part> parts) {
        public static Content user(String text) {
            return new Content("user", List.of(new Part(text)));
        }
    }

    public record Part(String text) {}

    public record GenerationConfig(
            double temperature,
            String responseMimeType
    ) {
        public static GenerationConfig json(double temperature) {
            return new GenerationConfig(temperature, "application/json");
        }
    }
}

