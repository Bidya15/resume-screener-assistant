package com.synthweb.resumescreener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class ResumeScreenerApplication {

    private static final Logger log = LoggerFactory.getLogger(ResumeScreenerApplication.class);

    public static void main(String[] args) {
        loadDotEnvIfPresent();
        SpringApplication.run(ResumeScreenerApplication.class, args);
    }

    /**
     * Automatically loads .env file properties into System properties if not already set.
     * This ensures local development in IDEs (IntelliJ, VS Code, Eclipse) and terminal
     * picks up GROQ_API_KEY, DB credentials, etc. without requiring manual IDE config.
     */
    private static void loadDotEnvIfPresent() {
        Path[] candidatePaths = new Path[]{
                Path.of(".env"),
                Path.of("resume-screener-backend", ".env"),
                Path.of("..", ".env"),
                Path.of("..", "resume-screener-backend", ".env")
        };

        for (Path path : candidatePaths) {
            if (Files.isRegularFile(path)) {
                try {
                    log.info("Loading environment variables from: {}", path.toAbsolutePath().normalize());
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String val = line.substring(eqIdx + 1).trim();
                            // Strip surrounding single or double quotes if present
                            if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                                if (val.length() >= 2) {
                                    val = val.substring(1, val.length() - 1);
                                }
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    break;
                } catch (IOException e) {
                    log.warn("Failed to read .env file from {}: {}", path, e.getMessage());
                }
            }
        }
    }
}
