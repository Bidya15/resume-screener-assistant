package com.synthweb.resumescreener.controller;

import com.synthweb.resumescreener.dto.HealthResponse;
import com.synthweb.resumescreener.service.HealthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthService healthService;

    public HealthController(HealthService healthService) {
        this.healthService = healthService;
    }

    /** 200 when the database is reachable, 503 otherwise. */
    @GetMapping
    public ResponseEntity<HealthResponse> health() {
        HealthResponse response = healthService.check();
        HttpStatus status = "UP".equals(response.status()) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return ResponseEntity.status(status).body(response);
    }
}
