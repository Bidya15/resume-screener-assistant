package com.synthweb.resumescreener.ai;

import com.synthweb.resumescreener.ai.dto.GeminiProperties;
import com.synthweb.resumescreener.ai.dto.GroqProperties;
import io.netty.channel.ChannelOption;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

@Configuration
@EnableConfigurationProperties({GroqProperties.class, GeminiProperties.class})
public class AIConfig {

    /**
     * WebClient used only for Groq.
     */
    @Bean
    public WebClient groqWebClient(WebClient.Builder builder, GroqProperties props) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) props.connectTimeout().toMillis())
                .responseTimeout(props.responseTimeout());
        return builder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    /**
     * WebClient used for Google Gemini API.
     */
    @Bean
    public WebClient geminiWebClient(WebClient.Builder builder, GeminiProperties props) {
        HttpClient httpClient = HttpClient.create()
                .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, (int) props.connectTimeout().toMillis())
                .responseTimeout(props.responseTimeout());
        return builder
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(c -> c.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }
}

