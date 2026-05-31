# Kakiyo Outreach

AI-powered outreach platform. Define what you sell, save a prospect with any combination of URLs and screenshots, and get a personalized cold message that sounds like a human wrote it — not a template.

---

## Live demo

> https://personalized-outreach-dashboard-three.vercel.app/

**Test credentials**
```
email:    demo@kakiyo.com
password: demo1234
```
## Snippets

<img width="1638" height="665" alt="image" src="https://github.com/user-attachments/assets/5019b8f3-605c-40b9-846a-d783e9793242" />
<img width="1576" height="784" alt="image" src="https://github.com/user-attachments/assets/a2fad271-5294-479e-8d03-248098355b0f" />
---

## What it does

1. **Offerings** — describe what you sell. Paste a URL and the app scrapes and extracts it automatically. Edit freely on top.
2. **Prompt editor** — write the tone brief for the AI. Controls length, angle, what to avoid. Ships with a strong default.
3. **Prospects** — save a lead with any combination of GitHub URLs, LinkedIn screenshots, personal sites, company websites, or free text. Each input is extracted and compiled into context.
4. **LinkedIn screenshot processing** — upload a LinkedIn screenshot directly. The image is sent to a vision-capable model via OpenRouter which reads and extracts name, role, company, recent activity, and topics to mention — no scraping, no OCR library needed.
5. **Generate** — pick an offering, hit generate. Watch the message stream in word by word.
6. **Reply handling** — paste a prospect's reply and get a contextual follow-up that continues the conversation naturally.
7. **Dashboard** — total messages, prospects, offerings, active conversations, top offerings by usage, messages per day.

---

## Real example

**Prospect inputs:** GitHub profile (pinned repos in outreach tooling), LinkedIn screenshot (Sales Engineer at B2B SaaS, recent post about outreach volume)

**Generated message:**
> Hey Sarah, saw your post about the outreach volume problem last week. Funny timing — I've been building something a few sales engineers have been using for exactly that. Kakiyo runs the full LinkedIn conversation for you, qualification and all. Worth a quick look?

**Prompt used:** conversational, under 100 words, lead with something real about the prospect, end with a soft question

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14, App Router | Server components + server actions + streaming route handlers in one framework |
| Language | TypeScript strict | Type safety across DB rows, AI payloads, and UI state |
| Database | Postgres + Drizzle ORM | Reliable relational storage, JSONB for flexible inputs and threads, schema as code |
| Auth | Better Auth | Handles sessions, hashing, cookies without building crypto from scratch |
| AI | OpenRouter | Single gateway, model swappable via env var, vision support for screenshot extraction |
| Scraping | `@extractus/article-extractor` | Strips boilerplate from URLs, improves token efficiency |
| Styling | Tailwind CSS | Fast layout iteration |
| Charts | Recharts | Lightweight React charting |
| Containers | Docker + Docker Compose | Consistent local environment, single command startup |
| Deploy | Railway | Postgres plugin + Next.js service in one project |

---

## Project structure

```
├── actions/                  # Server actions, split by domain
│   ├── offerings/            # mutations, queries, types per module
│   ├── prospects/            # includes extraction routing
│   ├── messages/
│   └── conversations/
├── app/
│   ├── (auth)/               # login, signup — no shared layout
│   ├── (app)/                # protected routes — shared sidebar layout
│   │   ├── dashboard/
│   │   ├── offerings/
│   │   ├── prompt/
│   │   └── prospects/
│   └── api/
│       ├── auth/[...all]/    # Better Auth catch-all handler
│       └── generate/         # Streaming AI route handler
├── components/
│   ├── prospects/            # Generator panel, message card, reply composer,
│   │                         # thread view, hooks, types
│   ├── offerings/
│   ├── dashboard/
│   └── ui/                   # Shared primitives
├── db/
│   ├── schema.ts             # Single source of truth for all tables
│   └── index.ts              # Drizzle client with globalThis pool cache
├── lib/
│   ├── ai.ts                 # OpenRouter streaming call
│   ├── scraper.ts            # URL extraction + vision screenshot reading
│   ├── prompts.ts            # Default prompt + system prompt builder
│   ├── auth.ts               # Better Auth config
│   └── logger.ts             # Request/error logging across routes
├── drizzle/                  # Migration files, committed to git
├── Dockerfile                # Production container definition
├── docker-compose.yml        # Local dev: app + postgres wired together
├── proxy.ts                  # Next.js middleware, session-based route protection
└── drizzle.config.ts
```

---

## Local setup

Two options — Docker Compose (recommended, zero config) or manual.

---

### Option A — Docker Compose (recommended)

#### Prerequisites
- Docker Desktop running

#### Steps

```bash
git clone https://github.com/[your-repo]/personalized-outreach-dashboard
cd personalized-outreach-dashboard
cp .env.example .env
```

Fill in only these two values in `.env` — everything else is handled by Docker Compose:
```env
OPENROUTER_API_KEY=your-key-from-openrouter.ai
BETTER_AUTH_SECRET=paste-64-char-random-string-here
```

Generate the secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start everything:
```bash
docker compose up --build
```

This starts Postgres, waits for it to be healthy, runs migrations automatically, then starts the app.

Open [http://localhost:3000](http://localhost:3000)

---

### Option B — Manual (npm run dev)

#### Prerequisites
- Node.js 18+
- Postgres running locally or via Docker

Start Postgres if needed:
```bash
docker run --name kakiyo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=outreach \
  -p 5432:5432 -d postgres:16
```

Install and configure:
```bash
git clone https://github.com/[your-repo]/personalized-outreach-dashboard
cd personalized-outreach-dashboard
npm install
cp .env.example .env
```

Fill in `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/outreach
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-64-char-random-string
OPENROUTER_API_KEY=your-key-from-openrouter.ai
AI_MODEL=openrouter/owl-alpha
VISION_MODEL=openrouter/free
```

Run migrations and start:
```bash
npx drizzle-kit migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string. Set automatically by Docker Compose and Railway. |
| `BETTER_AUTH_URL` | Yes | Full app base URL including protocol. `http://localhost:3000` locally, your Railway URL in production. |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ byte secret for session signing. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `OPENROUTER_API_KEY` | Yes | Get one free at [openrouter.ai](https://openrouter.ai) — no credit card needed for free models |
| `AI_MODEL` | No | OpenRouter model ID for message generation. Defaults to `deepseek/deepseek-v3-0324:free` |
| `VISION_MODEL` | No | OpenRouter model ID for LinkedIn screenshot extraction. Must support vision. Defaults to `meta-llama/llama-3.2-11b-vision-instruct:free` |
| `NEXT_PUBLIC_AI_MODEL` | No | Exposes model override to client components |

---

## Architecture decisions

### 1. Offering injected into system prompt, not user message
The offering (what you sell) is appended to the system prompt rather than included in the user message alongside prospect context. The system prompt is persistent background context — the model never "forgets" what's being sold. If it were in the user message, it would be treated as just another data point and frequently get buried by the prospect details.

### 2. LinkedIn screenshots processed via vision model, not OCR
LinkedIn blocks all scrapers. Rather than using a third-party OCR library, uploaded screenshots are sent directly to a vision-capable OpenRouter model which reads the image and returns structured context — name, role, company, recent activity, topics worth mentioning. This requires no additional dependencies and works with any screenshot format. A separate `VISION_MODEL` env var points to a vision-capable model independently of the generation model.

### 3. Extraction on input add, not at generation time
When a user adds a URL or screenshot to a prospect, extraction runs immediately and the result is stored in the database. Generation reads the stored `extractedContext` — it never re-scrapes. Regenerating a message for the same prospect costs no scraping calls, has no third-party rate limit exposure, and the user can see exactly what the AI knows by looking at the compiled context panel.

### 4. JSONB for prospect inputs and conversation threads
Prospect inputs vary by type and quantity — one prospect might have a GitHub URL and a LinkedIn screenshot, another might have five URLs and free text. Fixed columns would mean many nullable fields and a schema migration for every new input type. JSONB handles any combination without schema changes. The same logic applies to conversation threads — you always read the full thread at once, never one turn in isolation, so a separate turns table with joins adds complexity for no benefit.

### 5. Streaming is a route handler, not a server action
Server actions return values — they can't hold an HTTP connection open and push tokens as they arrive. Streaming requires returning a `Response` object with a `ReadableStream` body, which only route handlers support. The client reads the stream with `response.body.getReader()` and updates the UI on each chunk.

### 6. Ownership enforced in SQL WHERE clauses
Every database query that reads or mutates user data uses `and(eq(table.id, id), eq(table.userId, userId))`. The database rejects cross-user access regardless of what the UI sends — ownership is not a conditional check in application code, it's baked into the query itself.

---

## Tradeoffs made

**Temperature 0.85** — higher than typical defaults (0.7). Deliberate choice: lower temperature produces corporate-sounding output. 0.85 gives enough stylistic variance that two generations for the same prospect feel meaningfully different while staying coherent for short business writing.

**One prompt per user, not per offering** — tone is a consistent voice decision. Different targets get different offerings, but the same voice. Per-offering prompts would add configuration surface most users would never touch and risk inconsistent tone across generations.

**App-generated timestamps on thread turns** — conversation turn timestamps are generated in application code at write time rather than being set by the database. Minor inconsistency with no functional impact.

**Manual upsert in prompt actions** — Drizzle supports `.onConflictDoUpdate()` for true upserts, but the prompt actions use an explicit check-then-insert/update pattern. More verbose but easier to read and reason about.

---

## What I'd do with more time

1. **Per-offering prompt overrides** — let users set a different tone for specific offerings without changing their global prompt
2. **Message export** — CSV export of message history per prospect for teams tracking outreach in external tools
3. **End-to-end tests** — auth flow, generation flow, and reply flow covered with Playwright
4. **Streaming on more mobile browsers** — `ReadableStream.getReader()` has quirks on older iOS; a fallback polling approach would improve mobile compatibility

---

## Notes for evaluators

- The model is fully swappable via `AI_MODEL` env var — no code changes needed
- The default prompt ships with specific rules against AI-sounding phrases — outputs are intentionally terse and direct
- The compiled context panel on the prospect detail page shows exactly what the AI receives before generation — useful for understanding why a message came out the way it did
- LinkedIn screenshot upload is fully working — upload the image, the vision model extracts structured context, it feeds directly into generation
- Logger (`lib/logger.ts`) outputs structured logs on all route handler calls and errors
- `temperature: 0.85` and `max_tokens: 400` are deliberate product decisions documented in `lib/ai.ts`
