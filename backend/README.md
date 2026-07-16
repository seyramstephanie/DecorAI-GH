# DecorAI GH Spring API

The Expo TypeScript app talks only to this **Java / Spring Boot** API on port `4000`.
There is **no Node backend**. Persistence is **Neon Postgres** via Flyway + JDBC.

## Prerequisites

- Java 17+
- Maven 3.9+ (or use a packaged `target/*.jar`)
- Root `.env` with at least `DATABASE_URL`

## Run

From the repository root:

```powershell
npm run server
```

On first boot:

1. Flyway applies `V1__schema.sql` and `V2__auth_plans_admin.sql`
2. `DatabaseSeeder` inserts demo shops, decorators, users, bookings (idempotent)

### Demo accounts (password `1234`)

| Email | Role | Notes |
|-------|------|--------|
| `seyram@decorai.gh` | client | Pro (AI unlocked) |
| `akosua@royaltouch.gh` | decorator | Linked to Royal Touch Decor |
| `kwame@adumblooms.gh` | shop | Linked to Adum Blooms |
| `admin@decorai.gh` | admin | Approve new decorators |

## Env you only paste

See root `.env.example`.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Neon connection string |
| `EXPO_PUBLIC_GOOGLE_*` | Google OAuth client IDs (app) |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | Gmail + **App Password** for forgot-password codes |
| `PAYSTACK_SECRET_KEY` | Pro plan checkout; omit for local mock unlock |
| `PRO_PLAN_AMOUNT_PESWAS` | Default `5000` (GH₵50) |

## Product rules encoded in the API

- **Role locked** at `/register` — `/users/{id}` cannot change `role`
- **Decorator signup** creates an unverified directory row; **admin** approves
- **Free** clients browse + message; **Pro** (`plan=pro`) unlocks AI (client-gated + `/billing/*`)
- **Forgot password** emails a 6-digit code (or returns `devCode` if mail env is empty)

## Endpoint map (high level)

- `POST /register` `POST /login`
- `POST /auth/forgot-password` `POST /auth/reset-password`
- `GET|PATCH /users/{id}`
- `GET /me/decorator` `PATCH /decorators/{id}/profile`
- `GET /admin/decorators/pending` `POST .../approve|reject`
- `POST /billing/initialize` `POST /billing/verify` `GET /billing/status`
- Shops, decorators, bookings, messages, notifications (unchanged paths)
