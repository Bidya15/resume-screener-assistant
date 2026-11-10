package com.synthweb.resumescreener.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * A single resume-vs-job-description analysis.
 * <p>
 * Plain text inputs are stored as {@code text}; the structured AI output
 * (skills, gaps, questions) is stored as PostgreSQL {@code jsonb}.
 * Contact fields are extracted by the AI from the resume content and stored in DB.
 */
@Entity
@Table(name = "analyses", indexes = {
        @Index(name = "idx_analyses_candidate_name", columnList = "candidate_name"),
        @Index(name = "idx_analyses_match_score", columnList = "match_score"),
        @Index(name = "idx_analyses_created_at", columnList = "created_at"),
        @Index(name = "idx_analyses_recruitment_status", columnList = "recruitment_status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Analysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_name", nullable = false, length = 255)
    private String candidateName;

    // ---- AI-extracted candidate contact fields (nullable — may not be in resume) ----

    @Column(name = "candidate_email", length = 255)
    private String candidateEmail;

    @Column(name = "candidate_phone", length = 50)
    private String candidatePhone;

    @Column(name = "candidate_location", length = 255)
    private String candidateLocation;

    @Column(name = "candidate_linkedin", length = 500)
    private String candidateLinkedin;

    @Column(name = "candidate_github", length = 500)
    private String candidateGithub;

    // ---- Recruitment workflow fields ----

    /**
     * HR recruitment status for this candidate.
     * Defaults to NEW on creation; updated via PATCH /api/analyses/{id}/status.
     * Nullable at DB column level so existing rows with null can be safely migrated.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "recruitment_status", length = 50)
    @Builder.Default
    private RecruitmentStatus recruitmentStatus = RecruitmentStatus.NEW;

    /** Optional HR notes about this candidate. */
    @Column(name = "hr_remarks", columnDefinition = "text")
    private String hrRemarks;

    /** When the status was last changed. Null if never changed from NEW. */
    @Column(name = "status_updated_at")
    private Instant statusUpdatedAt;

    // ---- Core analysis fields ----

    @Column(name = "job_description", nullable = false, columnDefinition = "text")
    private String jobDescription;

    @Column(name = "resume_text", nullable = false, columnDefinition = "text")
    private String resumeText;

    /** Base64 data URL of the original resume file (PDF/DOCX), if uploaded. */
    @Column(name = "resume_file_data", columnDefinition = "text")
    private String resumeFileData;

    @Column(name = "resume_file_name")
    private String resumeFileName;

    /** Base64 data URL of the original job description file, if uploaded. */
    @Column(name = "job_description_file_data", columnDefinition = "text")
    private String jobDescriptionFileData;

    @Column(name = "job_description_file_name")
    private String jobDescriptionFileName;

    /** 0-100. Nullable only until the AI result is attached. */
    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "overall_assessment", columnDefinition = "text")
    private String overallAssessment;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "matching_skills", columnDefinition = "jsonb")
    @Builder.Default
    private List<MatchingSkill> matchingSkills = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skill_gaps", columnDefinition = "jsonb")
    @Builder.Default
    private List<SkillGap> skillGaps = new ArrayList<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interview_questions", columnDefinition = "jsonb")
    @Builder.Default
    private List<InterviewQuestion> interviewQuestions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
