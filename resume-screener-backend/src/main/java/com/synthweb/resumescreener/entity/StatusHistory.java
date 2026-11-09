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

import java.time.Instant;

/**
 * Audit trail for every recruitment status change on an analysis.
 * <p>
 * Each row records who changed the status, from what, to what, when, and why.
 * Records are immutable after creation; never delete them.
 */
@Entity
@Table(name = "status_history", indexes = {
        @Index(name = "idx_status_history_analysis_id", columnList = "analysis_id"),
        @Index(name = "idx_status_history_changed_at", columnList = "changed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Foreign key to the analyses table (not a JPA relationship to keep queries simple). */
    @Column(name = "analysis_id", nullable = false)
    private Long analysisId;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", nullable = false, length = 50)
    private RecruitmentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 50)
    private RecruitmentStatus newStatus;

    /** Optional reason provided by HR for the status change. */
    @Column(name = "reason", columnDefinition = "text")
    private String reason;

    /** Who made the change. Nullable until authentication is implemented. */
    @Column(name = "changed_by", length = 255)
    private String changedBy;

    /** Auto-set to the moment the record is inserted. */
    @CreationTimestamp
    @Column(name = "changed_at", nullable = false, updatable = false)
    private Instant changedAt;
}

