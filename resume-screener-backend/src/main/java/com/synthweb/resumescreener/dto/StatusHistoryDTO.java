package com.synthweb.resumescreener.dto;

import java.time.Instant;

/**
 * One entry in a candidate's status audit trail.
 * Returned by GET /api/analyses/{id}/status-history.
 */
public record StatusHistoryDTO(
        Long id,
        String previousStatus,
        String newStatus,
        String reason,
        String changedBy,
        Instant changedAt
) {
}

