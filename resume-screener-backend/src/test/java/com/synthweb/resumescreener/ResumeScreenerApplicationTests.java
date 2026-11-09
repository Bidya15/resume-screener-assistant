package com.synthweb.resumescreener;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/** Fails if the Spring context (including the PostgreSQL connection) cannot start. */
@SpringBootTest
@ActiveProfiles("test")
class ResumeScreenerApplicationTests {

    @Test
    void contextLoads() {
    }
}
