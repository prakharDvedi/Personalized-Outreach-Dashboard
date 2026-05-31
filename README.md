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

## Notes

- The app is structured to keep files small and reusable.
- Most business logic lives in `actions/`.
- Route protection happens in `proxy.ts`.
- The dashboard and prospect pages read directly from the database on the server.

