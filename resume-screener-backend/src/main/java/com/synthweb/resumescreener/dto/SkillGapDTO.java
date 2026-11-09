package com.synthweb.resumescreener.dto;

/**
 * Skill gap contract returned in REST responses.
 */
public record SkillGapDTO(String skill, String reason, String requirement, String gapType) {
}
