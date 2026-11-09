# Synthweb Resume Screener: Frontend

React + Vite + Tailwind CSS. Separate app; does not touch the Spring Boot backend.

## Run
```bash
cp .env.example .env     # set VITE_API_BASE_URL (default http://localhost:8080)
npm install
npm run dev              # http://localhost:5173
```
The backend must allow CORS from `http://localhost:5173`.

## Assumed API contract (confirm before integration)
| Function | Request |
|---|---|
| `createAnalysis` | `POST /api/analyses` body `{ jobDescription, resume }` |
| `getAnalyses` | `GET /api/analyses` (array or Spring page `{content: []}`) |
| `getAnalysisById` | `GET /api/analyses/{id}` |
| `getDashboardStats` | `GET /api/dashboard/stats` |

Endpoints live in `src/services/analysisService.js`; JSON field names live in `src/services/normalizers.js`.
These are the only two files to change if the backend differs.

## Structure
`src/pages` routes · `src/components` reusable UI · `src/services` Axios + API · `src/hooks` · `src/utils`
