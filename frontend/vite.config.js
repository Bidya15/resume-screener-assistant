import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server on 5173. The backend URL is configured via VITE_API_BASE_URL (see .env.example),
// so no proxy is needed as long as the Spring Boot app allows CORS from http://localhost:5173.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
