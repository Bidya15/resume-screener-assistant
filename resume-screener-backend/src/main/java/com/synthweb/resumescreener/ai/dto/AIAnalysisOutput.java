package com.synthweb.resumescreener.ai.dto;

import com.synthweb.resumescreener.dto.InterviewQuestionDTO;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.dto.SkillGapDTO;
import com.synthweb.resumescreener.service.AnalysisResult;

import java.util.List;

/**
 * A fully validated model answer, including candidate contact info extracted from the resume.
 * Contact fields are nullable — the AI returns null when not found in the resume.
 */
public record AIAnalysisOutput(
        String candidateName,
        // AI-extracted contact info (nullable — null if not in resume)
        String candidateEmail,
        String candidatePhone,
        String candidateLocation,
        String candidateLinkedin,
        String candidateGithub,
        // Evaluation output
        int matchScore,
        String overallAssessment,
        List<MatchingSkillDTO> matchingSkills,
        List<SkillGapDTO> skillGaps,
        List<InterviewQuestionDTO> interviewQuestions
) {
    public AnalysisResult toAnalysisResult() {
        return new AnalysisResult(
                candidateName,
                candidateEmail,
                candidatePhone,
                candidateLocation,
                candidateLinkedin,
                candidateGithub,
                matchScore,
                overallAssessment,
                matchingSkills,
                skillGaps,
                interviewQuestions
        );
    }
}

