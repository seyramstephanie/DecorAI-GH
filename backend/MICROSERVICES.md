# DecorAI GH — modular microservices architecture

The Spring Boot process is an **API gateway + local microservices** (modular monolith).
Each domain is isolated in packages so they can later run as separate processes.

```
┌─────────────────────────────────────────────────────────┐
│  gateway  (:4000)  GET /health  GET /services           │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ auth     │ catalog  │ billing  │ bookings │ notifications│
│ /login   │ /shops   │ /billing │ /bookings│ /notifications│
│ /register│ /decorators│        │ /threads │              │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│  ai-decorate-service                                    │
│  POST /ai/decorate   GET /ai/status                     │
│  Gemini: analyse → generate → verify → identify items   │
├─────────────────────────────────────────────────────────┤
│  Neon Postgres (pooler)  ·  Gmail SMTP (mail)           │
└─────────────────────────────────────────────────────────┘
```

## AI decorate pipeline (space → finished design)

| Step | Service role | Model |
|------|----------------|-------|
| 1 Analyse | Structure + placement zones | gemini-2.5-flash |
| 2 Generate | Photoreal finished design (same camera) | gemini-2.5-flash-image |
| 3 Verify | Structure preservation QC | gemini-2.5-flash |
| 4 Identify | Ghana shop items | gemini-2.5-flash |

System prompts live in `gh.decorai.ai.SystemPrompts`.

## Keys (root `.env`)

```env
# Required for AI decorate
GEMINI_API_KEY=your_google_ai_studio_key
# or legacy client name still accepted:
# EXPO_PUBLIC_GEMINI_API_KEY=...

DATABASE_URL=postgresql://...@ep-xxx-pooler....neon.tech/neondb?sslmode=require
MAIL_USERNAME=...
MAIL_PASSWORD=...   # Gmail App Password
PAYSTACK_SECRET_KEY=...
```

## Health

```http
GET http://127.0.0.1:4000/health
GET http://127.0.0.1:4000/ai/status
POST http://127.0.0.1:4000/ai/decorate
```

When `GEMINI_API_KEY` is missing, `/ai/decorate` returns `mock: true` with a clear message (no fake design image).
