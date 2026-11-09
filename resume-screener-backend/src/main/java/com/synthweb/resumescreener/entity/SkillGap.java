package com.synthweb.resumescreener.entity;

/**
 * Represents a skill gap or missing qualification.
 * Persisted as an element within the {@code skill_gaps} JSONB array.
 */
public record SkillGap(String skill, String reason, String requirement, String gapType) {
}
