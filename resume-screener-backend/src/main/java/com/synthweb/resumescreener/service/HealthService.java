package com.synthweb.resumescreener.service;

import com.synthweb.resumescreener.dto.HealthResponse;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;

@Service
public class HealthService {

    private final DataSource dataSource;

    public HealthService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public HealthResponse check() {
        boolean dbUp;
        try (Connection connection = dataSource.getConnection()) {
            dbUp = connection.isValid(2);
        } catch (Exception e) {
            dbUp = false;
        }
        return new HealthResponse(dbUp ? "UP" : "DEGRADED", dbUp ? "UP" : "DOWN", Instant.now());
    }
}
