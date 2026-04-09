# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run start    # Start production server
```

No lint or test commands are configured.

## Architecture

This is a **Next.js App Router** application (no `src/` directory). It's an AI-powered virtual concierge for a vacation rental apartment in Cannes, France.

### Key files

- `app/LoftAI.jsx` — Monolithic client component (~50KB) containing the entire chat UI: language selector, GDPR consent flow, message bubbles, quick actions, and the full system prompt (apartment details, appliance manuals, local recommendations, house rules).
- `app/page.js` — Just renders `<LoftAI />` as a client component.
- `app/api/chat/route.js` — Proxies POST requests to the Anthropic API using `ANTHROPIC_API_KEY`. Uses model `claude-sonnet-4-20250514`, max 1000 tokens. The system message is passed as the first element of the messages array.
- `app/api/conversations/route.js` — GET/POST/DELETE for conversation storage in Upstash Redis (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). Keys: `conv:*`, 90-day TTL. Admin operations require an `x-admin-password` header (currently hardcoded as `"LoftAI#Cannes2025!"` — should be moved to env var).
- `app/admin/page.js` — Client-side admin dashboard for browsing, filtering, and deleting stored conversations.
- `app/privacy/page.js` — Static GDPR privacy policy page.

### Data flow

1. User selects language → GDPR consent popup → chat initializes
2. `sendMessage()` in `LoftAI.jsx` → `POST /api/chat` → Anthropic API → response rendered
3. On conversation end (or page unload), `saveConversation()` → `POST /api/conversations` → Upstash Redis

### Environment variables required

```
ANTHROPIC_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
ADMIN_PASSWORD   # not yet wired up — currently hardcoded in conversations/route.js
```

### Styling

Tailwind CSS v4 via `@tailwindcss/postcss`. Custom theme uses CSS variables (`--bg`, `--accent`, `--text-primary`, etc.) defined in `LoftAI.jsx`. No separate theme config file.

### Path aliases

`@/` maps to the project root (configured in `jsconfig.json`).
