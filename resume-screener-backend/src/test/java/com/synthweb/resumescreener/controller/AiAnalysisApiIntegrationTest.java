package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.ai.GroqAIService;
import com.synthweb.resumescreener.ai.exception.AIRateLimitException;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full stack against real PostgreSQL (same setup as
 * AnalysisApiIntegrationTest), with only the Groq HTTP client
 * replaced by a mock, so no API key or network is needed.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AiAnalysisApiIntegrationTest {

        private static final String VALID = """
                        {"candidateName":"Jane Doe","matchScore":88,"overallAssessment":"Strong fit.",
                         "matchingSkills":[{"skill":"Java","reason":"Core.","evidence":"5 years."}],
                         "skillGaps":[{"skill":"Docker","reason":"No evidence.","requirement":"Docker required.","gapType":"missing_evidence"}],
                         "interviewQuestions":[
                           {"question":"Q1?","purpose":"P1","relatedSkill":"Java"},
                           {"question":"Q2?","purpose":"P2","relatedSkill":"Docker"},
                           {"question":"Q3?","purpose":"P3","relatedSkill":"Java"}]}""";

        private static final String BODY = """
                        {"candidateName":"Jane Doe","jobDescription":"Senior Java developer","resumeText":"Java engineer, 5 years"}""";

        @Autowired
        private MockMvc mockMvc;
        @Autowired
        private AnalysisRepository repository;
        @MockitoBean
        private GroqAIService groq;

        @BeforeEach
        void clean() {
                repository.deleteAll();
        }

        @Test
        void validAiResultIsReturnedAndPersistedInPostgres() throws Exception {
                when(groq.complete(anyList())).thenReturn(VALID);

                mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content(BODY))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").isNumber())
                                .andExpect(jsonPath("$.matchScore").value(88))
                                .andExpect(jsonPath("$.skillGaps[0].gapType").value("missing_evidence"))
                                .andExpect(jsonPath("$.interviewQuestions.length()").value(3));

                assertThat(repository.findAll()).hasSize(1);
                var saved = repository.findAll().get(0);
                assertThat(saved.getMatchScore()).isEqualTo(88);
                assertThat(saved.getSkillGaps().get(0).requirement()).isEqualTo("Docker required.");

                mockMvc.perform(get("/api/analyses/" + saved.getId()))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.interviewQuestions[1].relatedSkill").value("Docker"));
        }

        @Test
        void invalidAiOutputGivesBadGatewayAndSavesNothing() throws Exception {
                when(groq.complete(anyList())).thenReturn("{\"matchScore\": 100}");

                mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content(BODY))
                                .andExpect(status().isBadGateway())
                                .andExpect(jsonPath("$.message")
                                                .value(org.hamcrest.Matchers.containsString("could not be validated")));

                assertThat(repository.count()).isZero();
        }

        @Test
        void rateLimitMapsTo429AndSavesNothing() throws Exception {
                when(groq.complete(anyList())).thenThrow(new AIRateLimitException());

                mockMvc.perform(post("/api/analyses").contentType(MediaType.APPLICATION_JSON).content(BODY))
                                .andExpect(status().isTooManyRequests());

                assertThat(repository.count()).isZero();
        }
}
