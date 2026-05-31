# Kakiyo Outreach

Kakiyo Outreach is a small Next.js app for writing personalized outreach.

It lets you:

- sign up and log in
- create offerings
- store prospects
- add context from URLs, free text, and LinkedIn screenshots
- generate outreach messages with OpenRouter
- save, rate, favorite, and delete messages
- handle replies and follow-up threads
- view basic dashboard analytics

## Snippets

<img width="1638" height="665" alt="image" src="https://github.com/user-attachments/assets/5019b8f3-605c-40b9-846a-d783e9793242" />
<img width="1576" height="784" alt="image" src="https://github.com/user-attachments/assets/a2fad271-5294-479e-8d03-248098355b0f" />

## Stack

- Next.js 16
- React 19
- TypeScript
- Drizzle ORM
- PostgreSQL
- Better Auth
- OpenRouter
- Tailwind CSS
- Recharts

## Main folders

- `app/` - routes and pages
- `actions/` - server actions grouped by domain
- `components/` - reusable UI and client logic
- `db/` - schema and database client
- `lib/` - auth, AI, scraping, logging, prompts, session helpers
- `drizzle/` - migration files

## What the app does

### Auth

- `/login`
- `/signup`
- auth is handled by Better Auth

### Offerings

- `/offerings`
- `/offerings/[id]`
- offerings describe what you sell
- you can import content from a URL, then edit it before saving

### Prompt

- `/prompt`
- lets you edit the system prompt used for generation

### Prospects

- `/prospects`
- `/prospects/[id]`
- you can add free text, URLs, or screenshots
- the app extracts context and compiles it for generation

### Dashboard

- `/dashboard`
- shows message counts, prospect counts, offering usage, and recent activity

## Scraping and extraction

The app uses:

- `@extractus/article-extractor` for URLs
- OpenRouter vision models for screenshots

If article extraction returns weak content, the app falls back to a simpler HTML cleanup path.

## Local development

### 1. Install

```bash
npm install
```

### 2. Configure env

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/outreach
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-random-secret
OPENROUTER_API_KEY=your-openrouter-key
AI_MODEL=openrouter/owl-alpha
VISION_MODEL=nvidia/nemotron-nano-12b-v2-vl:free
```

### 3. Run with Docker

```bash
docker compose up --build
```

This starts Postgres, runs migrations, and starts the app.

### 4. Or run locally

```bash
npm run migrate
npm run dev
```

## Deployment

### Vercel

Use Vercel for the app and Supabase for Postgres.

Set these environment variables in Vercel:

- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `OPENROUTER_API_KEY`
- `AI_MODEL`
- `VISION_MODEL`

### Supabase

Use the Supabase transaction pooler connection string for `DATABASE_URL`.

Run migrations against Supabase before or after deployment:

```bash
npm run migrate
```

### Architecture Decisions

1. **Offering in system prompt, not user message** — system prompt is persistent context the model never forgets. In the user message it competes with prospect details and gets buried.

2. **Screenshots via vision model, not OCR** — LinkedIn blocks scrapers. Vision model reads the image directly, returns structured context, needs no extra dependencies. `VISION_MODEL` env var keeps it independent from the generation model.

3. **Extraction on input add, not at generation** — scrape once, store the result, reuse forever. Regenerating the same prospect costs zero scraping calls and zero rate limit risk.

4. **JSONB for inputs and threads** — prospect inputs vary by type and count, conversation threads are always read whole. Fixed columns mean nullable fields and migrations for every new input type. JSONB handles any combination without schema changes.

5. **Streaming is a route handler, not a server action** — server actions return values, they can't push tokens as they arrive. Only a route handler can return a `ReadableStream` body that the client reads chunk by chunk.

6. **Ownership in SQL WHERE, not application code** — every query uses `and(eq(table.id, id), eq(table.userId, userId))`. Cross-user access is blocked at the database layer. You can't forget to check it because it's baked into the query itself.
## Notes

- The app is structured to keep files small and reusable.
- Most business logic lives in `actions/`.
- Route protection happens in `proxy.ts`.
- The dashboard and prospect pages read directly from the database on the server.

## Tradeoffs made and why

- **Drizzle + raw SQL joins** - Drizzle keeps the schema type-safe, while a few raw SQL expressions make the dashboard queries easier to express.
- **Stored extracted context** - prospect inputs are extracted once and saved, so generation does not have to scrape again every time.
- **add feedback loop** - this might help in better response generation
- **folder structure** - more files, but each one is smaller and easier to understand than a set of mega files.

## What I would do with more time

- add end-to-end tests for sign-in, offering creation, prospect enrichment, generation, and replies
- improve URL extraction for more sites
- add a cleaner live preview when importing offering content
- add better empty/error states in the dashboard and prospect pages
- better frontend UI
- add message export features