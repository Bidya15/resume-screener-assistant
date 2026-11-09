package com.synthweb.resumescreener.entity;

/**
 * Represents a tailored technical interview question.
 * Persisted as an element within the {@code interview_questions} JSONB array.
 */
public record InterviewQuestion(String question, String purpose, String relatedSkill) {
}
