package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.dto.AnalysisResponse;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.entity.Analysis;
import com.synthweb.resumescreener.exception.InvalidRequestException;
import com.synthweb.resumescreener.exception.ResourceNotFoundException;
import com.synthweb.resumescreener.repository.AnalysisRepository;
import com.synthweb.resumescreener.repository.StatusHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private AnalysisRepository repository;

    @Mock
    private StatusHistoryRepository statusHistoryRepository;

    @Mock
    private ResumeAnalyzer resumeAnalyzer;

    private AnalysisService service;

    private final AnalysisRequest request = new AnalysisRequest("  Jane Doe ", "Java role", "Java resume");

    @BeforeEach
    void setUp() {
        service = new AnalysisService(repository, statusHistoryRepository, resumeAnalyzer, new AnalysisMapper());
    }

    @Test
    void getAnalysisThrowsWhenMissing() {
        when(repository.findById(42L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getAnalysis(42L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("42");
    }

    @Test
    void createAnalysisPersistsAndReturnsResponseWhenAiSucceeds() {
        // Contact fields are null since the test JSON doesn't include them
        AnalysisResult aiResult = new AnalysisResult(
                "Jane Doe",
                null, null, null, null, null, // contact fields
                85,
                "Strong fit",
                List.of(new MatchingSkillDTO("Java", "Solid background", "5 yrs")),
                List.of(),
                List.of()
        );
        when(resumeAnalyzer.analyze(request)).thenReturn(aiResult);
        when(repository.save(any(Analysis.class))).thenAnswer(invocation -> {
            Analysis a = invocation.getArgument(0);
            a.setId(101L);
            return a;
        });

        AnalysisResponse response = service.createAnalysis(request);

        assertThat(response).isNotNull();
        assertThat(response.id()).isEqualTo(101L);
        assertThat(response.candidateName()).isEqualTo("Jane Doe");
        assertThat(response.matchScore()).isEqualTo(85);
        verify(repository).save(any(Analysis.class));
    }

    @Test
    void createAnalysisSavesNothingWhenAiThrowsException() {
        when(resumeAnalyzer.analyze(request)).thenThrow(new RuntimeException("API error"));

        assertThatThrownBy(() -> service.createAnalysis(request))
                .isInstanceOf(RuntimeException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void searchRejectsInvertedRange() {
        assertThatThrownBy(() -> service.search(null, 80, 20))
                .isInstanceOf(InvalidRequestException.class);
    }

    @Test
    void searchRejectsOutOfBoundsScores() {
        assertThatThrownBy(() -> service.search(null, -1, null)).isInstanceOf(InvalidRequestException.class);
        assertThatThrownBy(() -> service.search(null, null, 101)).isInstanceOf(InvalidRequestException.class);
    }
}

