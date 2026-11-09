package com.synthweb.resumescreener.repository;

import com.synthweb.resumescreener.entity.Analysis;
import org.springframework.data.jpa.domain.Specification;

/**
 * Composable filters. Specifications are used instead of a JPQL
 * "(:param is null or ...)" query because PostgreSQL cannot infer the type of
 * a null-bound parameter in that pattern.
 */
public final class AnalysisSpecifications {

    private AnalysisSpecifications() {
    }

    public static Specification<Analysis> candidateNameContains(String name) {
        return (root, query, cb) -> cb.like(
                cb.lower(root.get("candidateName")),
                "%" + escapeLike(name.toLowerCase()) + "%",
                '\\');
    }

    public static Specification<Analysis> scoreAtLeast(int min) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.<Integer>get("matchScore"), min);
    }

    public static Specification<Analysis> scoreAtMost(int max) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.<Integer>get("matchScore"), max);
    }

    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
