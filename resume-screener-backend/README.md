# Resume Screener Assistant - Backend (Phase 2: Groq AI Integration)

Production-grade Spring Boot 3.x / Java 21 / PostgreSQL backend with integrated Groq LLM evaluation engine (`llama-3.3-70b-versatile`).

## Features
- **Evidence-Based Scoring Engine**: Objective scoring (0-100) based on skills alignment, hands-on experience, and project depth.
- **Strict Prompt-Injection Defenses**: Instruction hierarchy, untrusted input isolation via explicit delimiters (`<<<JOB_DESCRIPTION>>>`, `<<<CANDIDATE_RESUME>>>`), and server-side JSON schema validation.
- **Resilient AI Pipeline**: Non-blocking `WebClient` with exponential-backoff retries for rate limits (429) / transient errors, and up to 1 automated correction attempt for malformed outputs.
- **Native PostgreSQL JSONB**: High-performance persistence of structured skills, gaps, and interview questions.

---

## Prerequisites
- Java 21 LTS
- PostgreSQL 14+ running locally (default port 5432)
- Groq API Key (from [console.groq.com](https://console.groq.com))

---

## 1. Database Setup
Execute with PostgreSQL superuser:
```sql
CREATE DATABASE resume_screener_db;
CREATE DATABASE resume_screener_test_db;
```
*(Or run `init-db.sql` via psql or pgAdmin).*

---

## 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
# Database
DB_URL=jdbc:postgresql://localhost:5432/resume_screener_db
DB_USERNAME=postgres
DB_PASSWORD=password

# Groq AI
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

In PowerShell:
```powershell
$env:GROQ_API_KEY="gsk_your_actual_groq_api_key"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="password"
```

---

## 3. Run the Application
```powershell
cd H:\resume-screener-assistant\resume-screener-backend
.\mvnw.cmd spring-boot:run
```

---

## 4. Run Automated Tests
```powershell
cd H:\resume-screener-assistant\resume-screener-backend
.\mvnw.cmd test "-Dtest=AnalysisControllerTest,AnalysisRequestValidationTest,AnalysisServiceTest,AIResponseValidatorTest,AIPromptBuilderTest,AIAnalysisServiceTest,GroqAIServiceTest"
```
*(Tests use mocks for Groq API and execute without requiring external network access or an active API key).*

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/analyses` | Submit resume & job description; runs Groq LLM evaluation, validates output, persists to PostgreSQL, and returns full analysis report. |
| `GET` | `/api/analyses` | Retrieve analysis history (newest first). Supports `?name=`, `?minScore=`, `?maxScore=`. |
| `GET` | `/api/analyses/{id}` | Retrieve single analysis by ID. |
| `GET` | `/api/dashboard/stats` | Aggregated analytics (total count, average, high/low, score bands, 5 recent). |
| `GET` | `/api/health` | Health probe (database connectivity status). |

### Example Request (`POST /api/analyses`):
```json
{
  "candidateName": "John Doe",
  "jobDescription": "Looking for Senior Java Developer with 5+ years of Spring Boot, PostgreSQL, and Kafka experience.",
  "resumeText": "Lead Software Engineer with 6 years experience architecting Spring Boot microservices with PostgreSQL on AWS. Built real-time streaming pipelines using Apache Kafka."
}
```

### Example Response (`201 Created`):
```json
{
  "id": 1,
  "candidateName": "John Doe",
  "jobDescription": "Looking for Senior Java Developer...",
  "resumeText": "Lead Software Engineer with 6 years experience...",
  "matchScore": 88,
  "overallAssessment": "Candidate exhibits strong technical alignment with core stack requirements, backed by verifiable production experience in Spring Boot and Kafka.",
  "matchingSkills": [
    {
      "skill": "Java & Spring Boot",
      "reason": "Direct production leadership experience with required framework",
      "evidence": "6 years architecting Spring Boot microservices on AWS"
    },
    {
      "skill": "Kafka",
      "reason": "Hands-on real-time streaming experience",
      "evidence": "Built real-time streaming pipelines using Apache Kafka"
    }
  ],
  "skillGaps": [],
  "interviewQuestions": [
    {
      "question": "How do you manage consumer group rebalances and offset commits in high-throughput Kafka topics?",
      "purpose": "Evaluate practical streaming architecture depth",
      "relatedSkill": "Kafka"
    },
    {
      "question": "Explain your approach to transaction boundaries across multiple microservices.",
      "purpose": "Verify distributed systems design capability",
      "relatedSkill": "Spring Boot / Microservices"
    },
    {
      "question": "What PostgreSQL indexing strategy would you use for high-write time-series workloads?",
      "purpose": "Assess database query optimization expertise",
      "relatedSkill": "PostgreSQL"
    }
  ],
  "createdAt": "2026-11-09T14:40:00Z"
}
```
