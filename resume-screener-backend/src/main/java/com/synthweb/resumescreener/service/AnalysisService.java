package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.dto.AnalysisSummaryDTO;
import com.synthweb.resumescreener.dto.DashboardStatsDTO;
import com.synthweb.resumescreener.dto.StatusHistoryDTO;
import com.synthweb.resumescreener.dto.StatusUpdateRequest;
import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.entity.RecruitmentStatus;
import com.synthweb.resumescreener.entity.StatusHistory;
import com.synthweb.resumescreener.exception.InvalidRequestException;
import com.synthweb.resumescreener.exception.ResourceNotFoundException;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import com.synthweb.resumescreener.repository.AnalysisSpecifications;
import com.synthweb.resumescreener.repository.StatusHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
public class AnalysisService {

    static final int STRONG_THRESHOLD = 70;
    static final int MODERATE_THRESHOLD = 40;
    private static final int RECENT_LIMIT = 5;

    private final AnalysisRepository repository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final ResumeAnalyzer resumeAnalyzer;
    private final AnalysisMapper mapper;

    public AnalysisService(AnalysisRepository repository,
                           StatusHistoryRepository statusHistoryRepository,
                           ResumeAnalyzer resumeAnalyzer,
                           AnalysisMapper mapper) {
        this.repository = repository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.resumeAnalyzer = resumeAnalyzer;
        this.mapper = mapper;
    }

    /**
     * Service flow: (validated request) -> analyzer -> map -> persist -> response.
     * Not @Transactional on purpose: the analyzer will make a slow network call
     * and must not hold a database connection while it waits. repository.save()
     * opens its own short transaction.
     */
    public AnalysisResponse createAnalysis(AnalysisRequest request) {
        AnalysisResult result = resumeAnalyzer.analyze(request);
        Analysis saved = repository.save(mapper.toEntity(request, result));
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public AnalysisResponse getAnalysis(Long id) {
        return repository.findById(id)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found with id " + id));
    }

    @Transactional(readOnly = true)
    public List<AnalysisSummaryDTO> search(String name, Integer minScore, Integer maxScore) {
        validateScore("minScore", minScore);
        validateScore("maxScore", maxScore);
        if (minScore != null && maxScore != null && minScore > maxScore) {
            throw new InvalidRequestException("minScore cannot be greater than maxScore");
        }

        Specification<Analysis> spec = null;
        if (StringUtils.hasText(name)) {
            spec = and(spec, AnalysisSpecifications.candidateNameContains(name.trim()));
        }
        if (minScore != null) {
            spec = and(spec, AnalysisSpecifications.scoreAtLeast(minScore));
        }
        if (maxScore != null) {
            spec = and(spec, AnalysisSpecifications.scoreAtMost(maxScore));
        }

        List<Analysis> found = (spec == null)
                ? repository.findAllByOrderByCreatedAtDesc()
                : repository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt"));
        return found.stream().map(mapper::toSummary).toList();
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        AnalysisRepository.ScoreAggregate agg = repository.aggregateScores();

        long total = agg.getTotal() == null ? 0L : agg.getTotal();
        double average = agg.getAverage() == null ? 0.0 : Math.round(agg.getAverage() * 10.0) / 10.0;
        int highest = agg.getMax() == null ? 0 : agg.getMax();
        int lowest = agg.getMin() == null ? 0 : agg.getMin();

        List<AnalysisSummaryDTO> recent = repository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(0, RECENT_LIMIT))
                .stream().map(mapper::toSummary).toList();

        return new DashboardStatsDTO(
                total,
                average,
                highest,
                lowest,
                repository.countByMatchScoreGreaterThanEqual(STRONG_THRESHOLD),
                repository.countByMatchScoreBetween(MODERATE_THRESHOLD, STRONG_THRESHOLD - 1),
                repository.countByMatchScoreLessThan(MODERATE_THRESHOLD),
                recent);
    }

    /**
     * Updates the recruitment status of an analysis and records it in the audit trail.
     * Rejects transitions to the same status (no-op status changes are not recorded).
     */
    @Transactional
    public AnalysisResponse updateStatus(Long id, StatusUpdateRequest request) {
        // Validate the status value early — before touching the database
        RecruitmentStatus newStatus;
        try {
            newStatus = RecruitmentStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidRequestException(
                    "Invalid status '" + request.status() + "'. Valid values: NEW, SHORTLISTED, UNDER_REVIEW, NOT_SUITABLE");
        }

        Analysis analysis = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Analysis not found with id " + id));

        RecruitmentStatus previousStatus = analysis.getRecruitmentStatus() != null
                ? analysis.getRecruitmentStatus()
                : RecruitmentStatus.NEW;

        if (previousStatus == newStatus) {
            // No actual change — return current state without writing a history record
            return mapper.toResponse(analysis);
        }

        // Write audit record first, then update entity
        StatusHistory historyEntry = StatusHistory.builder()
                .analysisId(id)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .reason(StringUtils.hasText(request.reason()) ? request.reason().trim() : null)
                .changedBy(null)  // null until authentication is implemented
                .build();
        statusHistoryRepository.save(historyEntry);

        // Update the analysis entity
        analysis.setRecruitmentStatus(newStatus);
        analysis.setStatusUpdatedAt(Instant.now());
        // Update hrRemarks only when a reason is provided
        if (StringUtils.hasText(request.reason())) {
            analysis.setHrRemarks(request.reason().trim());
        }
        Analysis saved = repository.save(analysis);
        return mapper.toResponse(saved);
    }

    /**
     * Returns the full status change history for one analysis, newest first.
     */
    @Transactional(readOnly = true)
    public List<StatusHistoryDTO> getStatusHistory(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Analysis not found with id " + id);
        }
        return statusHistoryRepository.findByAnalysisIdOrderByChangedAtDesc(id)
                .stream()
                .map(mapper::toStatusHistoryDTO)
                .toList();
    }

    /**
     * Permanently deletes a candidate analysis and its associated audit history.
     */
    @Transactional
    public void deleteAnalysis(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Analysis not found with id " + id);
        }
        // Remove audit history entries first, then delete analysis record
        statusHistoryRepository.deleteAll(statusHistoryRepository.findByAnalysisIdOrderByChangedAtDesc(id));
        repository.deleteById(id);
    }

    private static void validateScore(String field, Integer value) {
        if (value != null && (value < 0 || value > 100)) {
            throw new InvalidRequestException(field + " must be between 0 and 100");
        }
    }

    private static Specification<Analysis> and(Specification<Analysis> current, Specification<Analysis> next) {
        return current == null ? next : current.and(next);
    }
}
