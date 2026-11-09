package com.synthweb.resumescreener.dto;

import com.synthweb.resumescreener.validation.NoNullCharacters;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of POST /api/analyses. */
public record AnalysisRequest(

        @NotBlank(message = "candidateName is required")
        @Size(max = 255, message = "candidateName must be at most 255 characters")
        @NoNullCharacters
        String candidateName,

        @NotBlank(message = "jobDescription is required")
        @Size(max = 20000, message = "jobDescription must be at most 20000 characters")
        @NoNullCharacters
        String jobDescription,

        @NotBlank(message = "resumeText is required")
        @Size(max = 50000, message = "resumeText must be at most 50000 characters")
        @NoNullCharacters
        String resumeText
) {
}
