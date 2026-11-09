package com.synthweb.resumescreener.dto;

/**
 * Matching skill contract returned in REST responses.
 */
public record MatchingSkillDTO(String skill, String reason, String evidence) {
}
