package com.synthweb.resumescreener.ai.dto;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

/**
 * Gemini settings, bound from the {@code gemini.*} keys in application.yml.
 */
@ConfigurationProperties(prefix = "gemini")
public record GeminiProperties(
        String apiKey,
        String model,
        String apiUrl,
        @DefaultValue("5s")
        Duration connectTimeout,
        @DefaultValue("60s")
        Duration responseTimeout,
        @DefaultValue("2")
        int maxRetries,
        @DefaultValue("500ms")
        Duration initialBackoff,
        @DefaultValue("8s")
        Duration maxBackoff,
        @DefaultValue("0.2")
        double temperature
) {
    public boolean isConfigured() {
        return notBlank(apiKey) && notBlank(model) && notBlank(apiUrl);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }
}

