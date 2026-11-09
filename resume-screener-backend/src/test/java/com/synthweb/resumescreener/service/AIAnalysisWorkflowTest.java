package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.ai.AIAnalysisService;
import com.synthweb.resumescreener.ai.AIPromptBuilder;
import com.synthweb.resumescreener.ai.AIResponseValidator;
import com.synthweb.resumescreener.ai.GeminiAIService;
import com.synthweb.resumescreener.ai.GroqAIService;
import com.synthweb.resumescreener.ai.exception.AIInvalidResponseException;
import com.synthweb.resumescreener.ai.exception.AIRateLimitException;
import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import com.synthweb.resumescreener.repository.StatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * AnalysisService -> AIAnalysisService (real) -> mocked Groq client, with a mocked repository.
 * Proves the persistence rule: only validated AI output is ever saved.
 */
@ExtendWith(MockitoExtension.class)
class AIAnalysisWorkflowTest {

    private static final String VALID = """
            {"candidateName":"Jane Doe","matchScore":82,"overallAssessment":"Strong Java evidence.",
             "matchingSkills":[{"skill":"Java","reason":"Core language.","evidence":"5 years at ACME."}],
             "skillGaps":[{"skill":"Docker","reason":"No evidence.","requirement":"Docker required.","gapType":"missing_evidence"}],
             "interviewQuestions":[
               {"question":"Q1?","purpose":"P1","relatedSkill":"Java"},
               {"question":"Q2?","purpose":"P2","relatedSkill":"Docker"},
               {"question":"Q3?","purpose":"P3","relatedSkill":"Java"}]}""";

    @Mock
    private GroqAIService groq;
    @Mock
    private GeminiAIService gemini;
    @Mock
    private AnalysisRepository repository;
    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    private AnalysisService service;

    private final AnalysisRequest request = new AnalysisRequest(" Jane Doe ", "Java role", "Java resume");

    @BeforeEach
    void setUp() {
        ResumeAnalyzer analyzer = new AIAnalysisService(groq, gemini, new AIPromptBuilder(), new AIResponseValidator());
        service = new AnalysisService(repository, statusHistoryRepository, analyzer, new AnalysisMapper());
    }

    @Test
    void validAiResponseIsPersistedAndReturned() {
        when(groq.complete(anyList())).thenReturn(VALID);
        when(repository.save(any(Analysis.class))).thenAnswer(inv -> {
            Analysis a = inv.getArgument(0);
            a.setId(7L);
            return a;
        });

        AnalysisResponse response = service.createAnalysis(request);

        ArgumentCaptor<Analysis> saved = ArgumentCaptor.forClass(Analysis.class);
        verify(repository).save(saved.capture());
        Analysis entity = saved.getValue();
        assertThat(entity.getCandidateName()).isEqualTo("Jane Doe");
        assertThat(entity.getMatchScore()).isEqualTo(82);
        assertThat(entity.getOverallAssessment()).isEqualTo("Strong Java evidence.");
        assertThat(entity.getMatchingSkills()).hasSize(1);
        assertThat(entity.getSkillGaps().get(0).gapType()).isEqualTo("missing_evidence");
        assertThat(entity.getInterviewQuestions()).hasSize(3);
        assertThat(response.id()).isEqualTo(7L);
        assertThat(response.skillGaps().get(0).requirement()).isEqualTo("Docker required.");
        assertThat(response.interviewQuestions()).extracting("relatedSkill").containsExactly("Java", "Docker", "Java");
    }

    @Test
    void nothingIsSavedWhenTheModelAnswerStaysInvalid() {
        when(groq.complete(anyList())).thenReturn("{\"matchScore\": 999}");

        assertThatThrownBy(() -> service.createAnalysis(request)).isInstanceOf(AIInvalidResponseException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void nothingIsSavedWhenTheProviderFails() {
        when(groq.complete(anyList())).thenThrow(new AIRateLimitException());

        assertThatThrownBy(() -> service.createAnalysis(request)).isInstanceOf(AIRateLimitException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void correctedAnswerIsWhatGetsSaved() {
        when(groq.complete(anyList())).thenReturn("oops not json", VALID);
        when(repository.save(any(Analysis.class))).thenAnswer(inv -> inv.getArgument(0));

        service.createAnalysis(request);

        ArgumentCaptor<Analysis> saved = ArgumentCaptor.forClass(Analysis.class);
        verify(repository).save(saved.capture());
        assertThat(saved.getValue().getMatchScore()).isEqualTo(82);
    }
}
