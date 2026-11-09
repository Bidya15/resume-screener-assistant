package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.dto.AnalysisSummaryDTO;
import com.synthweb.resumescreener.dto.StatusHistoryDTO;
import com.synthweb.resumescreener.dto.StatusUpdateRequest;
import com.synthweb.resumescreener.service.AnalysisService;
import com.synthweb.resumescreener.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

/**
 * REST controller exposing endpoints for submitting and managing candidate analyses.
 */
@RestController
@RequestMapping("/api/analyses")
public class AnalysisController {

    private final AnalysisService analysisService;
    private final ReportService reportService;

    public AnalysisController(AnalysisService analysisService, ReportService reportService) {
        this.analysisService = analysisService;
        this.reportService = reportService;
    }

    /**
     * Submit a resume and job description for screening.
     * Validates input fields and triggers the analysis pipeline.
     */
    @PostMapping
    public ResponseEntity<AnalysisResponse> createAnalysis(@Valid @RequestBody AnalysisRequest request) {
        AnalysisResponse response = analysisService.createAnalysis(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Fetch analysis history ordered newest first.
     * Supports optional query filtering by candidate name and match score range.
     */
    @GetMapping
    public ResponseEntity<List<AnalysisSummaryDTO>> getAnalysesHistory(
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "minScore", required = false) Integer minScore,
            @RequestParam(name = "maxScore", required = false) Integer maxScore) {
        List<AnalysisSummaryDTO> results = analysisService.search(name, minScore, maxScore);
        return ResponseEntity.ok(results);
    }

    /**
     * Retrieve full details of a specific analysis by its database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponse> getAnalysisById(@PathVariable("id") Long id) {
        AnalysisResponse response = analysisService.getAnalysis(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a candidate analysis record permanently.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalysis(@PathVariable("id") Long id) {
        analysisService.deleteAnalysis(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update the recruitment workflow status for a candidate (supports both PATCH and PUT).
     * Records an entry in the status_history audit log.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AnalysisResponse> updateStatus(
            @PathVariable("id") Long id,
            @RequestBody StatusUpdateRequest request) {
        AnalysisResponse response = analysisService.updateStatus(id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AnalysisResponse> updateStatusPut(
            @PathVariable("id") Long id,
            @RequestBody StatusUpdateRequest request) {
        return updateStatus(id, request);
    }

    /**
     * Retrieve the audit history of recruitment status changes for a candidate.
     */
    @GetMapping("/{id}/status-history")
    public ResponseEntity<List<StatusHistoryDTO>> getStatusHistory(@PathVariable("id") Long id) {
        List<StatusHistoryDTO> history = analysisService.getStatusHistory(id);
        return ResponseEntity.ok(history);
    }

    /**
     * Retrieve the original resume text for this analysis as plain text.
     */
    @GetMapping(value = "/{id}/resume", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getResumeText(@PathVariable("id") Long id) {
        AnalysisResponse response = analysisService.getAnalysis(id);
        return ResponseEntity.ok(response.resumeText());
    }

    /**
     * Retrieve the original job description text for this analysis as plain text.
     */
    @GetMapping(value = "/{id}/job-description", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> getJobDescriptionText(@PathVariable("id") Long id) {
        AnalysisResponse response = analysisService.getAnalysis(id);
        return ResponseEntity.ok(response.jobDescription());
    }

    /**
     * Generate and download a professional candidate evaluation report in PDF format.
     */
    @GetMapping(value = "/{id}/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdfReport(@PathVariable("id") Long id) throws IOException {
        AnalysisResponse analysis = analysisService.getAnalysis(id);
        byte[] pdfBytes = reportService.generatePdfReport(analysis);

        String safeCandidateName = analysis.candidateName()
                .replaceAll("[^a-zA-Z0-9_-]", "_");
        String filename = "evaluation-report-" + safeCandidateName + "-#" + id + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}

