package com.synthweb.resumescreener.ai;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.synthweb.resumescreener.ai.dto.AIAnalysisOutput;
import com.synthweb.resumescreener.ai.dto.GapType;
import com.synthweb.resumescreener.ai.exception.AIResponseValidationException;
import com.synthweb.resumescreener.dto.InterviewQuestionDTO;
import com.synthweb.resumescreener.dto.MatchingSkillDTO;
import com.synthweb.resumescreener.dto.SkillGapDTO;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.function.BiFunction;

/**
 * Parses and validates the model's text. Nothing is repaired or defaulted: a response is either fully valid
 * and returned as typed data, or rejected with a list of value-free problem descriptions.
 * Unknown extra properties are ignored and never copied, so a hijacked model cannot smuggle data through.
 */
@Component
public class AIResponseValidator {

    public static final int MAX_MATCHING_SKILLS = 5;
    public static final int MAX_SKILL_GAPS = 3;
    public static final int REQUIRED_QUESTIONS = 3;

    static final int MAX_NAME = 255;
    static final int MAX_SKILL = 200;
    static final int MAX_SENTENCE = 1000;
    static final int MAX_QUESTION = 600;
    static final int MAX_ASSESSMENT = 4000;
    private static final int MAX_REPORTED = 20;

    /** Strict reading: reject duplicate keys and any text after the JSON value. */
    private final ObjectMapper mapper = JsonMapper.builder()
            .enable(JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
            .build();

    public AIAnalysisOutput validate(String raw) {
        JsonNode root = parse(raw);
        List<String> problems = new ArrayList<>();

        String name = text(root, "candidateName", "", MAX_NAME, problems);
        Integer score = score(root, problems);
        String assessment = text(root, "overallAssessment", "", MAX_ASSESSMENT, problems);

        // Contact fields are optional — null means the AI did not find them in the resume.
        // We never fail validation for missing contact info; we do fail for malformed values.
        String candidateEmail = optionalText(root, "candidateEmail", MAX_NAME, problems);
        String candidatePhone = optionalText(root, "candidatePhone", 50, problems);
        String candidateLocation = optionalText(root, "candidateLocation", MAX_NAME, problems);
        String candidateLinkedin = optionalText(root, "candidateLinkedin", 500, problems);
        String candidateGithub = optionalText(root, "candidateGithub", 500, problems);

        List<MatchingSkillDTO> skills = array(root, "matchingSkills", 0, MAX_MATCHING_SKILLS, problems,
                (el, path) -> {
                    String skill = text(el, "skill", path, MAX_SKILL, problems);
                    String reason = text(el, "reason", path, MAX_SENTENCE, problems);
                    String evidence = text(el, "evidence", path, MAX_SENTENCE, problems);
                    return new MatchingSkillDTO(skill, reason, evidence);
                });

        List<SkillGapDTO> gaps = array(root, "skillGaps", 0, MAX_SKILL_GAPS, problems,
                (el, path) -> {
                    String skill = text(el, "skill", path, MAX_SKILL, problems);
                    String reason = text(el, "reason", path, MAX_SENTENCE, problems);
                    String requirement = text(el, "requirement", path, MAX_SENTENCE, problems);
                    String gapType = gapType(el, path, problems);
                    return new SkillGapDTO(skill, reason, requirement, gapType);
                });

        List<InterviewQuestionDTO> questions = array(root, "interviewQuestions", REQUIRED_QUESTIONS, REQUIRED_QUESTIONS, problems,
                (el, path) -> {
                    String question = text(el, "question", path, MAX_QUESTION, problems);
                    String purpose = text(el, "purpose", path, MAX_SENTENCE, problems);
                    String related = text(el, "relatedSkill", path, MAX_SKILL, problems);
                    return new InterviewQuestionDTO(question, purpose, related);
                });

        if (!problems.isEmpty()) {
            throw new AIResponseValidationException(problems.size() > MAX_REPORTED ? problems.subList(0, MAX_REPORTED) : problems);
        }
        return new AIAnalysisOutput(name, candidateEmail, candidatePhone, candidateLocation,
                candidateLinkedin, candidateGithub, score, assessment, skills, gaps, questions);
    }

    // ---- parsing ------------------------------------------------------------------------------------------

    private JsonNode parse(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new AIResponseValidationException(List.of("The response was empty."));
        }
        JsonNode root;
        try {
            root = mapper.readTree(stripCodeFence(raw.trim()));
        } catch (JsonProcessingException e) {
            // e.getMessage() quotes the offending text, so it is intentionally not propagated
            throw new AIResponseValidationException(List.of("The response was not valid JSON."));
        }
        if (root == null || !root.isObject()) {
            throw new AIResponseValidationException(List.of("The response must be a single JSON object."));
        }
        return root;
    }

    /** Models sometimes wrap JSON in ```json fences despite instructions; unwrapping is lossless. */
    private static String stripCodeFence(String text) {
        if (text.startsWith("```")) {
            int firstNewline = text.indexOf('\n');
            int closing = text.lastIndexOf("```");
            if (firstNewline > 0 && closing > firstNewline) {
                return text.substring(firstNewline + 1, closing).trim();
            }
        }
        return text;
    }

    // ---- field rules --------------------------------------------------------------------------------------

    private static String path(String parent, String field) {
        return parent.isEmpty() ? field : parent + "." + field;
    }

    /**
     * Reads an optional string field. Returns null if the field is absent or JSON null.
     * Fails validation only if the value is present but malformed (too long, blank, contains NUL).
     * Never fails for missing/null contact info — that is expected when resume does not include it.
     */
    private static String optionalText(JsonNode obj, String field, int max, List<String> problems) {
        JsonNode node = obj.get(field);
        if (node == null || node.isNull()) {
            return null; // acceptable — contact info not found in resume
        }
        if (!node.isTextual()) {
            problems.add(field + " must be a string or null.");
            return null;
        }
        String value = node.asText().trim();
        if (value.isEmpty()) {
            return null; // treat empty string the same as null
        }
        if (value.indexOf('\u0000') >= 0) {
            problems.add(field + " contains an illegal character.");
            return null;
        }
        if (value.length() > max) {
            problems.add(field + " must be at most " + max + " characters.");
            return null;
        }
        return value;
    }

    private static String text(JsonNode obj, String field, String parent, int max, List<String> problems) {
        String p = path(parent, field);
        JsonNode node = obj.get(field);
        if (node == null || node.isNull()) {
            problems.add(p + " is required.");
            return null;
        }
        if (!node.isTextual()) {
            problems.add(p + " must be a string.");
            return null;
        }
        String value = node.asText().trim();
        if (value.isEmpty()) {
            problems.add(p + " must not be blank.");
            return null;
        }
        if (value.indexOf('\u0000') >= 0) {
            problems.add(p + " contains an illegal character.");   // PostgreSQL text cannot store NUL
            return null;
        }
        if (value.length() > max) {
            problems.add(p + " must be at most " + max + " characters.");
            return null;
        }
        return value;
    }

    private static Integer score(JsonNode root, List<String> problems) {
        JsonNode node = root.get("matchScore");
        if (node == null || node.isNull()) {
            problems.add("matchScore is required.");
            return null;
        }
        if (!node.isNumber()) {
            problems.add("matchScore must be a number, not text.");
            return null;
        }
        BigDecimal value = node.decimalValue();
        if (value.stripTrailingZeros().scale() > 0) {
            problems.add("matchScore must be a whole number.");
            return null;
        }
        if (value.compareTo(BigDecimal.ZERO) < 0 || value.compareTo(BigDecimal.valueOf(100)) > 0) {
            problems.add("matchScore must be between 0 and 100.");
            return null;
        }
        return value.intValueExact();
    }

    private static String gapType(JsonNode el, String parent, List<String> problems) {
        String p = path(parent, "gapType");
        JsonNode node = el.get("gapType");
        if (node == null || node.isNull()) {
            return GapType.MISSING_SKILL.value();
        }
        if (!node.isTextual()) {
            return GapType.MISSING_SKILL.value();
        }
        return GapType.parse(node.asText())
                .map(GapType::value)
                .orElse(GapType.MISSING_SKILL.value());
    }

    private static <T> List<T> array(JsonNode root, String field, int min, int max, List<String> problems,
                                     BiFunction<JsonNode, String, T> elementReader) {
        JsonNode node = root.get(field);
        if (node == null || node.isNull()) {
            problems.add(field + " is required.");
            return List.of();
        }
        if (!node.isArray()) {
            problems.add(field + " must be an array.");
            return List.of();
        }
        if (node.size() < min) {
            problems.add(min == max
                    ? field + " must contain at least " + min + " items."
                    : field + " must contain at least " + min + " items.");
            return List.of();
        }
        int effectiveCount = Math.min(node.size(), max);
        List<T> out = new ArrayList<>(effectiveCount);
        for (int i = 0; i < effectiveCount; i++) {
            JsonNode element = node.get(i);
            String elementPath = field + "[" + i + "]";
            if (!element.isObject()) {
                problems.add(elementPath + " must be an object.");
                continue;
            }
            out.add(elementReader.apply(element, elementPath));
        }
        return out;
    }
}
