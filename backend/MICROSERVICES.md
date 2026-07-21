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

**This is an image product, not a chatbot.** The paid image model does the decoration.

| Step | Service role | Model (via OpenRouter) | Billing |
|------|----------------|-------|---------|
| 1 Analyse (optional) | Structure + placement zones | google/gemini-2.5-flash | OpenRouter credits (soft-fail) |
| 2 **Generate (core)** | Photoreal finished design (same camera) | **google/gemini-2.5-flash-image** | **~$0.039 / image via OpenRouter** |
| 3 Verify (optional) | Structure preservation QC | google/gemini-2.5-flash | soft-fail |
| 4 Identify (optional) | Ghana shop items | google/gemini-2.5-flash | soft-fail |

All AI traffic goes through **OpenRouter** (`OPENROUTER_API_KEY`). No direct Gemini API key.  
System prompts + guardrails: `gh.decorai.ai.SystemPrompts`.

### Image prompt style (Gemini 2.5 Flash Image)

Generation uses Google’s recommended **narrative** edit template (full sentences, not keywords):

> “Using the provided image of [space], redesign and decorate… Keep architecture… photorealistic…”

See: [How to prompt Gemini 2.5 Flash Image](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/).

## Keys (root `.env`)

```env
# Required — OpenRouter credits (Gemini models still used under the hood)
OPENROUTER_API_KEY=sk-or-v1-...
# Default decorate model on OpenRouter (~$0.039 / design)
GEMINI_IMAGE_MODEL=google/gemini-2.5-flash-image
# Optional vision helper:
# GEMINI_VISION_MODEL=google/gemini-2.5-flash

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

When `OPENROUTER_API_KEY` is missing, `/ai/decorate` returns `mock: true` with a clear message (no fake design image).
