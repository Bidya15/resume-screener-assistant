package com.synthweb.resumescreener.dto;

import java.time.Instant;

public record HealthResponse(String status, String database, Instant timestamp) {
}
