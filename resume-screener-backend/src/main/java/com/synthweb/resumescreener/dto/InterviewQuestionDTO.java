package com.synthweb.resumescreener.dto;

/**
 * Interview question contract returned in REST responses.
 */
public record InterviewQuestionDTO(String question, String purpose, String relatedSkill) {
}
