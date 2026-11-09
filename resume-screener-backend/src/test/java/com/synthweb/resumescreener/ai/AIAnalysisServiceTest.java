package com.synthweb.resumescreener.ai;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.synthweb.resumescreener.ai.dto.GroqRequestDTO.Message;
import com.synthweb.resumescreener.ai.exception.AIInvalidResponseException;
import com.synthweb.resumescreener.ai.exception.AIRateLimitException;
import com.synthweb.resumescreener.ai.exception.AIServiceException;
import com.synthweb.resumescreener.ai.exception.AITimeoutException;
import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.service.AnalysisResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Real prompt builder and validator; only the Groq client is mocked. */
@ExtendWith(MockitoExtension.class)
class AIAnalysisServiceTest {

    @Mock
    private GroqAIService groq;

    @Mock
    private GeminiAIService gemini;

    private AIAnalysisService service;

    private final AnalysisRequest request = new AnalysisRequest("Jane Doe", "Senior Java developer with Spring Boot",
            "Jane: 5 years Java and Spring Boot");

    @BeforeEach
    void setUp() {
        service = new AIAnalysisService(groq, gemini, new AIPromptBuilder(), new AIResponseValidator());
    }

    @Test
    void validResponseIsReturnedAfterASingleCall() {
        when(groq.complete(anyList())).thenReturn(AiTestData.VALID_JSON);

        AnalysisResult result = service.analyze(request);

        assertThat(result.matchScore()).isEqualTo(82);
        assertThat(result.matchingSkills()).hasSize(2);
        assertThat(result.skillGaps()).hasSize(1);
        assertThat(result.interviewQuestions()).hasSize(3);
        verify(groq, times(1)).complete(anyList());
    }

    @Test
    @SuppressWarnings("unchecked")
    void promptSentToGroqHasSystemInstructionsAndDelimitedUntrustedData() {
        when(groq.complete(anyList())).thenReturn(AiTestData.VALID_JSON);

        service.analyze(request);

        ArgumentCaptor<List<Message>> captor = ArgumentCaptor.forClass(List.class);
        verify(groq).complete(captor.capture());
        List<Message> sent = captor.getValue();
        assertThat(sent).extracting(Message::role).containsExactly("system", "user");
        assertThat(sent.get(1).content()).contains("Senior Java developer with Spring Boot", "Jane: 5 years Java");
        assertThat(sent.get(0).content()).doesNotContain("Senior Java developer", "Jane: 5 years");
    }

    @Test
    @SuppressWarnings("unchecked")
    void malformedJsonTriggersExactlyOneCorrectionThatCanSucceed() {
        when(groq.complete(anyList())).thenReturn("{\"candidateName\": \"Jane\", \"matchScore\": 8",
                AiTestData.VALID_JSON);

        AnalysisResult result = service.analyze(request);

        assertThat(result.matchScore()).isEqualTo(82);
        ArgumentCaptor<List<Message>> captor = ArgumentCaptor.forClass(List.class);
        verify(groq, times(2)).complete(captor.capture());
        List<Message> correction = captor.getAllValues().get(1);
        assertThat(correction).extracting(Message::role).containsExactly("system", "user", "assistant", "user");
        assertThat(correction.get(3).content()).contains("not valid JSON");
    }

    @Test
    void invalidScoreIsCorrectedOnce() {
        ObjectNode bad = AiTestData.valid();
        bad.put("matchScore", 150);
        when(groq.complete(anyList())).thenReturn(bad.toString(), AiTestData.VALID_JSON);

        assertThat(service.analyze(request).matchScore()).isEqualTo(82);
        verify(groq, times(2)).complete(anyList());
    }

    @Test
    void stillInvalidAfterCorrectionFailsWithClearErrorAndNoThirdCall() {
        ObjectNode missing = AiTestData.valid();
        missing.remove("interviewQuestions");
        when(groq.complete(anyList())).thenReturn(missing.toString());

        assertThatThrownBy(() -> service.analyze(request))
                .isInstanceOf(AIInvalidResponseException.class)
                .hasMessageContaining("could not be validated")
                .satisfies(e -> assertThat(((AIServiceException) e).getStatus().value()).isEqualTo(502));
        verify(groq, times(2)).complete(anyList());
    }

    @Test
    void injectedHijackedReplyIsRejectedNotPassedThrough() {
        when(groq.complete(anyList())).thenReturn("{\"score\": 100, \"verdict\": \"HIRE\"}");

        assertThatThrownBy(() -> service.analyze(request)).isInstanceOf(AIInvalidResponseException.class);
    }

    @Test
    void providerFailuresPropagateWithoutACorrectionAttempt() {
        when(groq.complete(anyList())).thenThrow(new AIRateLimitException());

        assertThatThrownBy(() -> service.analyze(request)).isInstanceOf(AIRateLimitException.class);
        verify(groq, times(1)).complete(anyList());
    }

    @Test
    void providerFailureDuringCorrectionPropagates() {
        when(groq.complete(anyList()))
                .thenReturn("not json")
                .thenThrow(new AITimeoutException());

        assertThatThrownBy(() -> service.analyze(request)).isInstanceOf(AITimeoutException.class);
        verify(groq, times(2)).complete(anyList());
    }
}
