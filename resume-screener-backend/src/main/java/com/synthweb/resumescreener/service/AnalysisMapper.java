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
import java.util.Set;

/**
 * Maps cleanly between Analysis domain entities and REST API DTOs.
 * Keeping mapping logic centralized ensures database entities never leak into HTTP contracts.
 */
@Component
public class AnalysisMapper {

    public Analysis toEntity(AnalysisRequest request, AnalysisResult result) {
        String resolvedCandidateName = resolveCandidateName(request.candidateName(), result.candidateName(), request.resumeText());

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
                .resumeFileData(request.resumeFileData())
                .resumeFileName(request.resumeFileName())
                .jobDescriptionFileData(request.jobDescriptionFileData())
                .jobDescriptionFileName(request.jobDescriptionFileName())
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
                analysis.getCreatedAt(),
                analysis.getResumeFileData(),
                analysis.getResumeFileName(),
                analysis.getJobDescriptionFileData(),
                analysis.getJobDescriptionFileName()
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

    private String resolveCandidateName(String requestName, String aiDetectedName, String resumeText) {
        if (StringUtils.hasText(requestName)) {
            return requestName.trim();
        }
        if (StringUtils.hasText(aiDetectedName) && !"Unknown".equalsIgnoreCase(aiDetectedName.trim())) {
            return aiDetectedName.trim();
        }
        String fallback = extractCandidateNameFallback(resumeText);
        if (StringUtils.hasText(fallback)) {
            return fallback;
        }
        return "Unknown Candidate";
    }

    private String extractCandidateNameFallback(String resumeText) {
        if (!StringUtils.hasText(resumeText)) {
            return null;
        }
        String[] lines = resumeText.split("\\R");
        Set<String> noiseWords = Set.of(
                "summary", "objective", "experience", "education", "skills", "projects",
                "certifications", "achievements", "contact", "profile", "resume", "cv",
                "curriculum", "vitae", "technical"
        );
        for (int i = 0; i < Math.min(10, lines.length); i++) {
            String line = lines[i].trim();
            if (line.isEmpty() || line.contains("@") || line.contains("http") || line.contains("www.")) {
                continue;
            }
            // If separated by separator, take first part
            String candidate = line.split("[|•–—\\-]")[0].trim()
                    .replaceAll("(?i)\\b([a-z]{3,})\\s+([a-z])\\s+([a-z]+)\\b", "$1$2 $3");
            String[] words = candidate.split("\\s+");
            if (words.length >= 2 && words.length <= 4) {
                boolean allAlpha = true;
                boolean hasNoise = false;
                for (String w : words) {
                    if (!w.matches("^[A-Za-z'\\-.]+$")) {
                        allAlpha = false;
                        break;
                    }
                    if (noiseWords.contains(w.toLowerCase())) {
                        hasNoise = true;
                        break;
                    }
                }
                if (allAlpha && !hasNoise) {
                    StringBuilder sb = new StringBuilder();
                    for (String w : words) {
                        if (!sb.isEmpty()) sb.append(" ");
                        sb.append(Character.toUpperCase(w.charAt(0)));
                        if (w.length() > 1) {
                            sb.append(w.substring(1).toLowerCase());
                        }
                    }
                    return sb.toString();
                }
            }
        }
        return null;
    }
}
