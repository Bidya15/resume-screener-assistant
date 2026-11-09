package com.synthweb.resumescreener.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.dto.InterviewQuestionDTO;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.exception.InvalidRequestException;
import com.synthweb.resumescreener.exception.ResourceNotFoundException;
import com.synthweb.resumescreener.service.AnalysisService;
import com.synthweb.resumescreener.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Web-layer slice: controller + exception handler, service mocked. */
@WebMvcTest(AnalysisController.class)
class AnalysisControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AnalysisService analysisService;

    @MockitoBean
    private ReportService reportService;

    private String validBody() throws Exception {
        return objectMapper.writeValueAsString(new AnalysisRequest("Jane Doe", "Java role", "Java resume"));
    }

    // Helper to build an AnalysisResponse with all required fields (contact fields null for older tests)
    private static AnalysisResponse buildResponse(Long id, String name, String jd, String cv,
                                                   Integer score, String assessment,
                                                   List<MatchingSkillDTO> skills,
                                                   List<Object> gaps,
                                                   List<InterviewQuestionDTO> questions,
                                                   Instant createdAt) {
        return new AnalysisResponse(id, name, null, null, null, null, null,
                "NEW", null, null, jd, cv, score, assessment, skills, List.of(), questions, createdAt);
    }

    @Test
    void postWithEmptyBodyReturns400WithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors.length()").value(3));
    }

    @Test
    void postWithMalformedJsonReturns400() throws Exception {
        mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void validPostReturns201CreatedWithAnalysisResponse() throws Exception {
        AnalysisResponse mockResponse = new AnalysisResponse(
                1L, "Jane Doe",
                null, null, null, null, null, // contact fields
                "NEW", null, null,            // status fields
                "Java role", "Java resume",
                85, "Strong candidate with solid skills.",
                List.of(new MatchingSkillDTO("Java", "Extensive experience", "8 yrs")),
                List.of(),
                List.of(new InterviewQuestionDTO("What is DI?", "Test core knowledge", "Spring")),
                Instant.now()
        );
        when(analysisService.createAnalysis(new AnalysisRequest("Jane Doe", "Java role", "Java resume")))
                .thenReturn(mockResponse);

        mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content(validBody()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.candidateName").value("Jane Doe"))
                .andExpect(jsonPath("$.matchScore").value(85))
                .andExpect(jsonPath("$.overallAssessment").value("Strong candidate with solid skills."));
    }

    @Test
    void getUnknownIdReturns404() throws Exception {
        when(analysisService.getAnalysis(999L)).thenThrow(new ResourceNotFoundException("Analysis not found with id 999"));

        mockMvc.perform(get("/api/analyses/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Analysis not found with id 999"))
                .andExpect(jsonPath("$.path").value("/api/analyses/999"));
    }

    @Test
    void getNonNumericIdReturns400() throws Exception {
        mockMvc.perform(get("/api/analyses/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void invalidScoreRangeReturns400() throws Exception {
        when(analysisService.search(null, 90, 10)).thenThrow(new InvalidRequestException("minScore cannot be greater than maxScore"));

        mockMvc.perform(get("/api/analyses").param("minScore", "90").param("maxScore", "10"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minScore cannot be greater than maxScore"));
    }

    @Test
    void getExistingIdReturnsAnalysis() throws Exception {
        AnalysisResponse response = new AnalysisResponse(
                1L, "Jane Doe",
                null, null, null, null, null,
                "NEW", null, null,
                "JD", "CV", 80, "Good",
                List.of(), List.of(), List.of(),
                Instant.parse("2026-01-01T00:00:00Z"));
        when(analysisService.getAnalysis(1L)).thenReturn(response);

        mockMvc.perform(get("/api/analyses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.candidateName").value("Jane Doe"))
                .andExpect(jsonPath("$.matchScore").value(80));
    }
}

