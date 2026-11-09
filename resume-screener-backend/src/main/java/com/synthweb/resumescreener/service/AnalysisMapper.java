package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.dto.AnalysisSummaryDTO;
import com.synthweb.resumescreener.dto.InterviewQuestionDTO;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.dto.SkillGapDTO;
import com.synthweb.resumescreener.dto.StatusHistoryDTO;
import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.entity.InterviewQuestion;
import com.synthweb.resumescreener.entity.MatchingSkill;
import com.synthweb.resumescreener.entity.RecruitmentStatus;
import com.synthweb.resumescreener.entity.SkillGap;
import com.synthweb.resumescreener.entity.StatusHistory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Maps cleanly between Analysis domain entities and REST API DTOs.
 * Keeping mapping logic centralized ensures database entities never leak into HTTP contracts.
 */
@Component
public class AnalysisMapper {

    public Analysis toEntity(AnalysisRequest request, AnalysisResult result) {
        String resolvedCandidateName = resolveCandidateName(request.candidateName(), result.candidateName());

        List<MatchingSkill> matchingSkills = result.matchingSkills() == null ? List.of() :
                result.matchingSkills().stream()
                        .map(dto -> new MatchingSkill(dto.skill(), dto.reason(), dto.evidence()))
                        .toList();

        List<SkillGap> skillGaps = result.skillGaps() == null ? List.of() :
                result.skillGaps().stream()
                        .map(dto -> new SkillGap(dto.skill(), dto.reason(), dto.requirement(), dto.gapType()))
                        .toList();

        List<InterviewQuestion> questions = result.interviewQuestions() == null ? List.of() :
                result.interviewQuestions().stream()
                        .map(dto -> new InterviewQuestion(dto.question(), dto.purpose(), dto.relatedSkill()))
                        .toList();

        return Analysis.builder()
                .candidateName(resolvedCandidateName)
                // Store AI-extracted contact info (null if not found in resume)
                .candidateEmail(result.candidateEmail())
                .candidatePhone(result.candidatePhone())
                .candidateLocation(result.candidateLocation())
                .candidateLinkedin(result.candidateLinkedin())
                .candidateGithub(result.candidateGithub())
                // Default recruitment status is NEW
                .recruitmentStatus(RecruitmentStatus.NEW)
                .jobDescription(request.jobDescription().trim())
                .resumeText(request.resumeText().trim())
                .matchScore(result.matchScore())
                .overallAssessment(result.overallAssessment())
                .matchingSkills(matchingSkills)
                .skillGaps(skillGaps)
                .interviewQuestions(questions)
                .build();
    }

    public AnalysisResponse toResponse(Analysis analysis) {
        List<MatchingSkillDTO> matchingSkillDTOs = analysis.getMatchingSkills() == null ? List.of() :
                analysis.getMatchingSkills().stream()
                        .map(skill -> new MatchingSkillDTO(skill.skill(), skill.reason(), skill.evidence()))
                        .toList();

        List<SkillGapDTO> skillGapDTOs = analysis.getSkillGaps() == null ? List.of() :
                analysis.getSkillGaps().stream()
                        .map(gap -> new SkillGapDTO(gap.skill(), gap.reason(), gap.requirement(), gap.gapType()))
                        .toList();

        List<InterviewQuestionDTO> questionDTOs = analysis.getInterviewQuestions() == null ? List.of() :
                analysis.getInterviewQuestions().stream()
                        .map(q -> new InterviewQuestionDTO(q.question(), q.purpose(), q.relatedSkill()))
                        .toList();

        return new AnalysisResponse(
                analysis.getId(),
                analysis.getCandidateName(),
                analysis.getCandidateEmail(),
                analysis.getCandidatePhone(),
                analysis.getCandidateLocation(),
                analysis.getCandidateLinkedin(),
                analysis.getCandidateGithub(),
                analysis.getRecruitmentStatus() != null ? analysis.getRecruitmentStatus().name() : RecruitmentStatus.NEW.name(),
                analysis.getHrRemarks(),
                analysis.getStatusUpdatedAt(),
                analysis.getJobDescription(),
                analysis.getResumeText(),
                analysis.getMatchScore(),
                analysis.getOverallAssessment(),
                matchingSkillDTOs,
                skillGapDTOs,
                questionDTOs,
                analysis.getCreatedAt()
        );
    }

    public AnalysisSummaryDTO toSummary(Analysis analysis) {
        return new AnalysisSummaryDTO(
                analysis.getId(),
                analysis.getCandidateName(),
                analysis.getMatchScore(),
                analysis.getRecruitmentStatus() != null ? analysis.getRecruitmentStatus().name() : RecruitmentStatus.NEW.name(),
                analysis.getCreatedAt()
        );
    }

    public StatusHistoryDTO toStatusHistoryDTO(StatusHistory history) {
        return new StatusHistoryDTO(
                history.getId(),
                history.getPreviousStatus() != null ? history.getPreviousStatus().name() : null,
                history.getNewStatus() != null ? history.getNewStatus().name() : null,
                history.getReason(),
                history.getChangedBy(),
                history.getChangedAt()
        );
    }

    private String resolveCandidateName(String requestName, String aiDetectedName) {
        if (StringUtils.hasText(requestName)) {
            return requestName.trim();
        }
        if (StringUtils.hasText(aiDetectedName) && !"Unknown".equalsIgnoreCase(aiDetectedName.trim())) {
            return aiDetectedName.trim();
        }
        return "Unknown Candidate";
    }
}
