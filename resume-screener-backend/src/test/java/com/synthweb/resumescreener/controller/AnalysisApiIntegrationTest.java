package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.synthweb.resumescreener.ai.GroqAIService;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Full stack: HTTP -> controller -> service -> real PostgreSQL. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalysisApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnalysisRepository repository;

    @MockitoBean
    private GroqAIService groqAIService;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    private void seed(String name, int score) {
        repository.save(Analysis.builder()
                .candidateName(name).jobDescription("JD").resumeText("CV")
                .matchScore(score).overallAssessment("ok").build());
    }

    @Test
    void healthReportsDatabaseUp() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.database").value("UP"));
    }

    @Test
    void emptyDatabaseGivesEmptyListAndZeroStats() throws Exception {
        mockMvc.perform(get("/api/analyses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAnalyses").value(0))
                .andExpect(jsonPath("$.averageScore").value(0.0))
                .andExpect(jsonPath("$.recentAnalyses.length()").value(0));
    }

    @Test
    void statsAndHistoryReflectRealRecords() throws Exception {
        seed("Alice", 90);
        seed("Bob", 50);
        seed("Carol", 20);

        mockMvc.perform(get("/api/dashboard/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalAnalyses").value(3))
                .andExpect(jsonPath("$.averageScore").value(53.3))
                .andExpect(jsonPath("$.highestScore").value(90))
                .andExpect(jsonPath("$.lowestScore").value(20))
                .andExpect(jsonPath("$.strongMatches").value(1))
                .andExpect(jsonPath("$.moderateMatches").value(1))
                .andExpect(jsonPath("$.weakMatches").value(1))
                .andExpect(jsonPath("$.recentAnalyses.length()").value(3));

        mockMvc.perform(get("/api/analyses").param("name", "ali"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].candidateName").value("Alice"));

        mockMvc.perform(get("/api/analyses").param("minScore", "40").param("maxScore", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].candidateName").value("Bob"));
    }

    @Test
    void getByIdReturnsStoredAnalysis() throws Exception {
        Analysis saved = repository.save(Analysis.builder()
                .candidateName("Dana").jobDescription("JD text").resumeText("CV text")
                .matchScore(75).overallAssessment("Solid").build());

        mockMvc.perform(get("/api/analyses/" + saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.candidateName").value("Dana"))
                .andExpect(jsonPath("$.jobDescription").value("JD text"))
                .andExpect(jsonPath("$.matchingSkills.length()").value(0));
    }

    @Test
    void unknownIdReturns404InStandardErrorFormat() throws Exception {
        mockMvc.perform(get("/api/analyses/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.path").value("/api/analyses/999999"));
    }

    @Test
    void nonNumericIdReturns400() throws Exception {
        mockMvc.perform(get("/api/analyses/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void invalidScoreFilterReturns400() throws Exception {
        mockMvc.perform(get("/api/analyses").param("minScore", "150"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("minScore must be between 0 and 100"));
    }

    @Test
    void invalidPostReturns400AndSavesNothing() throws Exception {
        mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateName\":\"\",\"jobDescription\":\"\",\"resumeText\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.length()").value(3));
        assertThat(repository.count()).isZero();
    }

    @Test
    void validPostCreatesAnalysisAndPersistsData() throws Exception {
        when(groqAIService.complete(anyList())).thenReturn("""
            {"candidateName":"Jane","matchScore":85,"overallAssessment":"Good fit.",
             "matchingSkills":[{"skill":"Java","reason":"Core.","evidence":"5 years."}],
             "skillGaps":[{"skill":"Docker","reason":"No evidence.","requirement":"Docker required.","gapType":"missing_evidence"}],
             "interviewQuestions":[
               {"question":"Q1?","purpose":"P1","relatedSkill":"Java"},
               {"question":"Q2?","purpose":"P2","relatedSkill":"Docker"},
               {"question":"Q3?","purpose":"P3","relatedSkill":"Java"}]}""");

        mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"candidateName\":\"Jane\",\"jobDescription\":\"Java dev\",\"resumeText\":\"Java CV\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.matchScore").value(85))
                .andExpect(jsonPath("$.candidateName").value("Jane"));
        assertThat(repository.count()).isEqualTo(1);
    }

    @Test
    void unknownRouteAndWrongMethodUseStandardErrorFormat() throws Exception {
        mockMvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));

        // PUT is not supported on /api/analyses and will return 405 Method Not Allowed
        mockMvc.perform(put("/api/analyses"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.status").value(405));
    }
}
