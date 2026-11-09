package com.synthweb.resumescreener.repository;

import com.synthweb.resumescreener.entity.Analysis;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRepository
        extends JpaRepository<Analysis, Long>, JpaSpecificationExecutor<Analysis> {

    // --- retrieval -------------------------------------------------------

    List<Analysis> findAllByOrderByCreatedAtDesc();

    /** Most recent analyses; pass e.g. PageRequest.of(0, 5). */
    List<Analysis> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // --- search / filter (simple derived queries) --------------------------

    List<Analysis> findByCandidateNameContainingIgnoreCaseOrderByCreatedAtDesc(String name);

    List<Analysis> findByMatchScoreBetweenOrderByCreatedAtDesc(int minScore, int maxScore);

    // Combined, optional filters use AnalysisSpecifications + findAll(spec, sort)

    // --- dashboard statistics ----------------------------------------------

    @Query("""
            select count(a) as total,
                   avg(a.matchScore) as average,
                   max(a.matchScore) as max,
                   min(a.matchScore) as min
            from Analysis a
            """)
    ScoreAggregate aggregateScores();

    long countByMatchScoreGreaterThanEqual(int score);

    long countByMatchScoreBetween(int minScore, int maxScore);

    long countByMatchScoreLessThan(int score);

    /** Interface projection for {@link #aggregateScores()}. Null values when the table is empty. */
    interface ScoreAggregate {
        Long getTotal();

        Double getAverage();

        Integer getMax();

        Integer getMin();
    }
}
