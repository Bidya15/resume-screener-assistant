package com.synthweb.resumescreener.dto;

import java.time.Instant;

/** Lightweight row for history lists (omits the large text fields). */
public record AnalysisSummaryDTO(
        Long id,
        String candidateName,
        Integer matchScore,
        String recruitmentStatus,
        Instant createdAt
) {
}
