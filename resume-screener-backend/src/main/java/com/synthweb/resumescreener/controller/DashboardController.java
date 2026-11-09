package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.dto.DashboardStatsDTO;
import com.synthweb.resumescreener.service.AnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller providing aggregate analytics and dashboard metrics.
 */
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AnalysisService analysisService;

    public DashboardController(AnalysisService analysisService) {
        this.analysisService = analysisService;
    }

    /**
     * Compute and return dashboard metrics:
     * - Total analysis count
     * - Average, min, and max match scores
     * - Score tier breakdowns (strong, moderate, weak)
     * - The 5 most recent analyses
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = analysisService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
