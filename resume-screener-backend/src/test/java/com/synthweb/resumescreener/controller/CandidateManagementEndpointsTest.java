package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.dto.StatusUpdateRequest;
import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.entity.RecruitmentStatus;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import com.synthweb.resumescreener.repository.StatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CandidateManagementEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnalysisRepository analysisRepository;

    @Autowired
    private StatusHistoryRepository statusHistoryRepository;

    private Analysis testAnalysis;

    @BeforeEach
    void setUp() {
        statusHistoryRepository.deleteAll();
        analysisRepository.deleteAll();

        testAnalysis = analysisRepository.save(Analysis.builder()
                .candidateName("John Doe")
                .candidateEmail("john@example.com")
                .candidatePhone("+1234567890")
                .candidateLocation("San Francisco, CA")
                .candidateLinkedin("https://linkedin.com/in/johndoe")
                .candidateGithub("https://github.com/johndoe")
                .recruitmentStatus(RecruitmentStatus.NEW)
                .jobDescription("Senior Full Stack Developer\nRequired: Java, Spring Boot, React")
                .resumeText("John Doe\nSummary: 8+ years software engineering in Java and React.")
                .matchScore(85)
                .overallAssessment("Strong technical match with verified experience.")
                .build());
    }

    @Test
    void testPatchStatusUpdatesDatabaseAndRecordsHistory() throws Exception {
        String requestJson = """
                {
                    "status": "SHORTLISTED",
                    "reason": "Exemplary Java depth and high match score."
                }
                """;

        mockMvc.perform(patch("/api/analyses/" + testAnalysis.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.recruitmentStatus").value("SHORTLISTED"))
                .andExpect(jsonPath("$.hrRemarks").value("Exemplary Java depth and high match score."))
                .andExpect(jsonPath("$.statusUpdatedAt").isNotEmpty());

        Analysis updated = analysisRepository.findById(testAnalysis.getId()).orElseThrow();
        assertThat(updated.getRecruitmentStatus()).isEqualTo(RecruitmentStatus.SHORTLISTED);
        assertThat(updated.getHrRemarks()).isEqualTo("Exemplary Java depth and high match score.");

        mockMvc.perform(get("/api/analyses/" + testAnalysis.getId() + "/status-history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].previousStatus").value("NEW"))
                .andExpect(jsonPath("$[0].newStatus").value("SHORTLISTED"))
                .andExpect(jsonPath("$[0].reason").value("Exemplary Java depth and high match score."));
    }

    @Test
    void testPatchInvalidStatusReturnsBadRequest() throws Exception {
        String requestJson = """
                {
                    "status": "NON_EXISTENT_STATUS"
                }
                """;

        mockMvc.perform(patch("/api/analyses/" + testAnalysis.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetResumeAndJobDescriptionPlainEndpoints() throws Exception {
        mockMvc.perform(get("/api/analyses/" + testAnalysis.getId() + "/resume"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("8+ years software engineering")));

        mockMvc.perform(get("/api/analyses/" + testAnalysis.getId() + "/job-description"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("Senior Full Stack Developer")));
    }

    @Test
    void testExportPdfReportReturnsValidPdfStream() throws Exception {
        mockMvc.perform(get("/api/analyses/" + testAnalysis.getId() + "/export/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("evaluation-report-John_Doe-#" + testAnalysis.getId() + ".pdf")))
                .andExpect(result -> {
                    byte[] bytes = result.getResponse().getContentAsByteArray();
                    assertThat(bytes).isNotEmpty();
                    // Check PDF file magic header (%PDF)
                    assertThat(new String(bytes, 0, 4)).isEqualTo("%PDF");
                });
    }
}

