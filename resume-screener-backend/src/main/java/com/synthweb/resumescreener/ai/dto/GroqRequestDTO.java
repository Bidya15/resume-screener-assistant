package com.synthweb.resumescreener.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/** Body of POST {GROQ_API_URL}: Groq's OpenAI-compatible chat-completions request. */
public record GroqRequestDTO(
        String model,
        List<Message> messages,
        double temperature,
        @JsonProperty("max_completion_tokens") int maxCompletionTokens,
        @JsonProperty("response_format") ResponseFormat responseFormat
) {

    /** role is "system", "user" or "assistant". */
    public record Message(String role, String content) {
        public static Message system(String content) {
            return new Message("system", content);
        }

        public static Message user(String content) {
            return new Message("user", content);
        }

        public static Message assistant(String content) {
            return new Message("assistant", content);
        }
    }

    /** {"type":"json_object"} makes Groq return syntactically valid JSON; we still validate the structure ourselves. */
    public record ResponseFormat(String type) {
        public static ResponseFormat jsonObject() {
            return new ResponseFormat("json_object");
        }
    }
}

