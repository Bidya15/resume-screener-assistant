package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.AnalysisRequest;

/**
 * Seam for the AI integration. The next phase supplies a Groq-backed
 * implementation; until then {@link PendingResumeAnalyzer} is used.
 */
public interface ResumeAnalyzer {

    AnalysisResult analyze(AnalysisRequest request);
}
