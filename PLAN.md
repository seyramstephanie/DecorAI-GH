# DecorAI GH — Implementation Plan

Terracotta design language everywhere (per UI reference screenshot). Minimal dev-grade build:
no tests, no debug infra, no boilerplate. Gemini (existing key) powers the AI pipeline.
Backend = valid microservice architecture in plain Node (zero deps), mocked persistence (JSON files).

## Architecture

```
app (Expo Router, RN 0.81, TS)
 ├─ lib/api.ts ──────────► server/gateway.js :4000   (single entry, routes by path)
 │                           ├─ auth-service    :4001  users, social sign-in, profiles
 │                           ├─ shop-service    :4002  shop directory, stock, radius match
 │                           ├─ decorator-svc   :4003  decorators, briefs, bookings, chat
 │                           └─ notification    :4004  alerts feed, radius alerts, digests
 └─ lib/ai.ts ───────────► Gemini API
      1. analyzeRoom      gemini-2.5-flash        → structured JSON (structure, placement zones)
      2. generateImage    gemini-2.5-flash-image  → decorated preview (restrictive prompt + photo)
      3. verifyStructure  gemini-2.5-flash        → compares original vs generated; reject → retry (max 3)
      4. identifyItems    from analysis           → item list → shop matching (FR-14/15)
```

## Tasks

Foundation
- [x] 1. Terracotta palette `constants/colors.ts`
- [ ] 2. `constants/theme.ts` — spacing, radii, type scale
- [ ] 3. `lib/api.ts` — gateway client
- [ ] 4. `lib/session.ts` — in-memory session
- [ ] 5. `lib/ai.ts` — 4-step Gemini pipeline w/ structure-check retry loop
- [ ] 6. `lib/social-auth.ts` — Google + Facebook via expo-auth-session (env client IDs, dev fallback)
- [ ] 7. `data/seed.ts` — products (UI reference items), prompt templates by event type
- [ ] 8. UI kit: Button, Chip, ProductCard, BottomNav, ScreenHeader, EmptyState

Backend (zero-dep node:http microservices)
- [ ] 9. `server/lib.js` — http + JSON-store helpers
- [ ] 10. `server/auth-service.js`
- [ ] 11. `server/shop-service.js` — Ghana shops seed, haversine radius match
- [ ] 12. `server/decorator-service.js` — decorators seed, briefs, bookings (Enquiry→Confirmed→In Preparation→Completed), messages
- [ ] 13. `server/notification-service.js` — feed + radius alerts
- [ ] 14. `server/gateway.js` + `server/start.js`; `npm run server`

Screens (all in new design language)
- [ ] 15. index (redirect) · 16. onboarding · 17. create-account (+ Google/FB buttons)
- [ ] 18. home — "Decorate Your home", bell badge, category chips, product grid w/ hearts, bottom nav
- [ ] 19. generate — photo upload, event type, style, template library, custom prompt (≤4 taps to preview)
- [ ] 20. result — 01/10 carousel, ←/→, ✕, object-type toggles, 3 variants, item list, save/share
- [ ] 21. shops — directory: distance, rating, contact, stock match
- [ ] 22. decorators — directory + portfolio + send brief + booking request
- [ ] 23. bookings — status tracker · 24. chat — in-app messaging
- [ ] 25. notification — alerts feed · 26. profile · 27. account-settings
- [ ] 28. shop-dashboard — stock manager + radius slider + incoming alerts
- [ ] 29. delete login/otp/register; update `_layout.tsx`

Wire-up
- [ ] 30. npm install, typecheck, boot server + expo
