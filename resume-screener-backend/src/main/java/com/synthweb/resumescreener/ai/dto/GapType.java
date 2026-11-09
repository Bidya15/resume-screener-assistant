package com.synthweb.resumescreener.ai.dto;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

/** Allowed values of {@code skillGaps[].gapType}. */
public enum GapType {
    MISSING_SKILL("missing_skill"),
    MISSING_EVIDENCE("missing_evidence"),
    INSUFFICIENT_DEPTH("insufficient_depth"),
    MISSING_QUALIFICATION("missing_qualification");

    private final String value;

    GapType(String value) {
        this.value = value;
    }

    public String value() {
        return value;
    }

    public static List<String> allValues() {
        return Arrays.stream(values()).map(GapType::value).toList();
    }

    /** Case/space/hyphen-insensitive; returns empty for anything that is not a known type. */
    public static Optional<GapType> parse(String raw) {
        if (raw == null) {
            return Optional.empty();
        }
        String normalized = raw.trim().toLowerCase(Locale.ROOT).replace('-', '_').replace(' ', '_');
        return Arrays.stream(values()).filter(t -> t.value.equals(normalized)).findFirst();
    }
}

