package com.synthweb.resumescreener.dto;

import java.util.List;

/**
 * Aggregate statistics. Score bands: strong &gt;= 70, moderate 40-69, weak &lt; 40.
 */
public record DashboardStatsDTO(
        long totalAnalyses,
        double averageScore,
        int highestScore,
        int lowestScore,
        long strongMatches,
        long moderateMatches,
        long weakMatches,
        List<AnalysisSummaryDTO> recentAnalyses
) {
}
