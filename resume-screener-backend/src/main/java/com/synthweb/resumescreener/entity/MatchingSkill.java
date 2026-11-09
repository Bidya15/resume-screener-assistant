package com.synthweb.resumescreener.entity;

/**
 * Represents a matching skill identified between the resume and job description.
 * Persisted as an element within the {@code matching_skills} JSONB array.
 */
public record MatchingSkill(String skill, String reason, String evidence) {
}
