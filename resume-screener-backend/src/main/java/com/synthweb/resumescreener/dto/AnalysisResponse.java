package com.synthweb.resumescreener.dto;

import java.time.Instant;
import java.util.List;

/**
 * Full analysis response returned by POST /api/analyses and GET
 * /api/analyses/{id}.
 * Contact fields are nullable — only populated when the AI extracted them from
 * the resume.
 */
public record AnalysisResponse(
                Long id,
                String candidateName,
                // AI-extracted contact information (nullable)
                String candidateEmail,
                String candidatePhone,
                String candidateLocation,
                String candidateLinkedin,
                String candidateGithub,
                // Recruitment workflow
                String recruitmentStatus,
                String hrRemarks,
                Instant statusUpdatedAt,
                // Core analysis data
                String jobDescription,
                String resumeText,
                Integer matchScore,
                String overallAssessment,
                List<MatchingSkillDTO> matchingSkills,
                List<SkillGapDTO> skillGaps,
                List<InterviewQuestionDTO> interviewQuestions,
                Instant createdAt) {
}
