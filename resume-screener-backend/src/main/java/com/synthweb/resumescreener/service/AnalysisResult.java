package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.InterviewQuestionDTO;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.dto.SkillGapDTO;

import java.util.List;

/**
 * Structured, validated output produced by the AI evaluation pipeline.
 * Contact fields are nullable — the AI extracts them when present in the resume.
 */
public record AnalysisResult(
        String candidateName,
        // Contact info extracted from resume by AI (nullable if not found in resume)
        String candidateEmail,
        String candidatePhone,
        String candidateLocation,
        String candidateLinkedin,
        String candidateGithub,
        // Evaluation results
        Integer matchScore,
        String overallAssessment,
        List<MatchingSkillDTO> matchingSkills,
        List<SkillGapDTO> skillGaps,
        List<InterviewQuestionDTO> interviewQuestions
) {
}
