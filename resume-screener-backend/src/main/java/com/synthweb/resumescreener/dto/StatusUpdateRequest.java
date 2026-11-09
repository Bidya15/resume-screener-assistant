package com.synthweb.resumescreener.dto;

/**
 * Request body for PATCH /api/analyses/{id}/status
 * Both fields are validated in the service layer.
 */
public record StatusUpdateRequest(
        String status,  // Must match a RecruitmentStatus enum value
        String reason   // Optional HR notes about the status change
) {
}

