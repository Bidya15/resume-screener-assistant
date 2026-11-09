package com.synthweb.resumescreener.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

/** Shared fixtures. The JSON is a well-formed model answer; tests mutate copies of it. */
final class AiTestData {

    static final ObjectMapper MAPPER = new ObjectMapper();

    static final String VALID_JSON = """
            {
              "candidateName": "Jane Doe",
              "matchScore": 82,
              "overallAssessment": "Strong Java and Spring Boot experience shown in two production roles; no evidence of container tooling.",
              "matchingSkills": [
                { "skill": "Java", "reason": "Primary language of the role.", "evidence": "5 years building Java services at ACME." },
                { "skill": "Spring Boot", "reason": "Core framework of the role.", "evidence": "Led migration to Spring Boot 3." }
              ],
              "skillGaps": [
                { "skill": "Docker", "reason": "No evidence of Docker use.", "requirement": "Docker knowledge required.", "gapType": "missing_evidence" }
              ],
              "interviewQuestions": [
                { "question": "Explain dependency injection in Spring Boot.", "purpose": "Check practical Spring knowledge.", "relatedSkill": "Spring Boot" },
                { "question": "How would you containerise a Spring service?", "purpose": "Probe the Docker gap.", "relatedSkill": "Docker" },
                { "question": "Describe a performance issue you diagnosed.", "purpose": "Assess problem solving.", "relatedSkill": "Java" }
              ]
            }
            """;

    private AiTestData() {
    }

    static ObjectNode valid() {
        try {
            return (ObjectNode) MAPPER.readTree(VALID_JSON);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}
