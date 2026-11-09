package com.synthweb.resumescreener.repository;

import com.synthweb.resumescreener.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Data access for the status_history audit table.
 * Records are immutable after creation; this repository only reads and inserts.
 */
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {

    /**
     * Returns all status history entries for one analysis, newest-first.
     * Used by GET /api/analyses/{id}/status-history.
     */
    List<StatusHistory> findByAnalysisIdOrderByChangedAtDesc(Long analysisId);
}

