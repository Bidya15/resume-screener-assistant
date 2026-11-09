package com.synthweb.resumescreener.ai.dto;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.time.Duration;

/**
 * Groq settings, bound from the {@code groq.*} keys in application.yml.
 */
@ConfigurationProperties(prefix = "groq")
public record GroqProperties(
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
        double temperature,
        @DefaultValue("4096")
        int maxCompletionTokens
) {

    public boolean isConfigured() {
        return notBlank(apiKey) && notBlank(model) && notBlank(apiUrl);
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    @Override
    public String toString() {
        return "GroqProperties[model=" + model + ", apiUrl=" + apiUrl + ", apiKey=" + (notBlank(apiKey) ? "****" : "<unset>")
                + ", responseTimeout=" + responseTimeout + ", maxRetries=" + maxRetries + "]";
    }
}

