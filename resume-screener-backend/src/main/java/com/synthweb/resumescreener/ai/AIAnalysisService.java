package com.synthweb.resumescreener.ai;

import com.synthweb.resumescreener.ai.dto.GroqRequestDTO.Message;
import com.synthweb.resumescreener.ai.exception.AIInvalidResponseException;
import com.synthweb.resumescreener.ai.exception.AIResponseValidationException;
import com.synthweb.resumescreener.dto.AnalysisRequest;
import com.synthweb.resumescreener.service.AnalysisResult;
import com.synthweb.resumescreener.service.ResumeAnalyzer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Orchestrates AI resume analysis.
 * <p>
 * Workflow:
 * 1. Constructs system and user prompts using AIPromptBuilder.
 * 2. Invokes the configured AI provider (Groq or Google Gemini).
 * 3. Validates the structured JSON response using AIResponseValidator.
 * 4. Automatically retries once with feedback if validation issues occur.
 */
@Service
public class AIAnalysisService implements ResumeAnalyzer {

    private static final Logger log = LoggerFactory.getLogger(AIAnalysisService.class);

    private final GroqAIService groq;
    private final GeminiAIService gemini;
    private final AIPromptBuilder promptBuilder;
    private final AIResponseValidator validator;

    @Value("${ai.provider:GROQ}")
    private String aiProvider;

    public AIAnalysisService(GroqAIService groq,
                             GeminiAIService gemini,
                             AIPromptBuilder promptBuilder,
                             AIResponseValidator validator) {
        this.groq = groq;
        this.gemini = gemini;
        this.promptBuilder = promptBuilder;
        this.validator = validator;
    }

    @Override
    public AnalysisResult analyze(AnalysisRequest request) {
        List<Message> conversation = promptBuilder.buildMessages(
                request.jobDescription(),
                request.resumeText()
        );

        String firstAnswer = callProvider(conversation);

        try {
            return validator.validate(firstAnswer).toAnalysisResult();
        } catch (AIResponseValidationException firstError) {
            log.warn("AI response validation failed ({} issues). Attempting automated correction.",
                    firstError.violations().size());

            List<Message> correctionPrompt = promptBuilder.buildCorrectionMessages(
                    conversation,
                    firstAnswer,
                    firstError.violations()
            );

            String secondAnswer = callProvider(correctionPrompt);

            try {
                return validator.validate(secondAnswer).toAnalysisResult();
            } catch (AIResponseValidationException secondError) {
                log.error("AI correction attempt also failed ({} issues). Aborting.",
                        secondError.violations().size());
                throw new AIInvalidResponseException(secondError);
            }
        }
    }

    private String callProvider(List<Message> messages) {
        if ("GEMINI".equalsIgnoreCase(aiProvider)) {
            log.info("Dispatching prompt to Google Gemini AI service");
            return gemini.complete(messages);
        } else {
            log.info("Dispatching prompt to Groq AI service");
            return groq.complete(messages);
        }
    }
}
