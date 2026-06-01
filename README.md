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

**Test credentials**
```
email:    abc@gmail.com
password: 12345678
```
## Example outputs

These are real generations from the app. Inputs shown, output shown.

---

**Prospect: Ayush (Kakiyo)**

Inputs: company website (`kakiyo.com`), LinkedIn screenshot, free text about positioning

```
Ayush, your banner says "Ship! Ship! Ship!" and it shows. Kakiyo's positioning around real 
conversations at scale, not robotic sequences, is sharp. The cloud-based approach with no 
Chrome extension risk is a genuine differentiator in a space where account safety is a real concern.

We built Zecruit to solve a similar problem on the hiring side. Our AI handles candidate outreach, 
qualification, and screening at scale while keeping human expertise in the loop for quality. 
Companies like Medhavi, Masters Union, and Apollo Finvest use it to cut recruiter time spent 
on outreach by 80%.

Curious if you've thought about how your own hiring pipeline works at Kakiyo. Are you running 
that manually or have you productized it yet?
```

The opening references his actual LinkedIn banner. The offering is introduced in one sentence, not a pitch. Ends with a question about his own problem, not a meeting request.

---

**Prospect: Sindre Sorhus**

Inputs: GitHub (`github.com/sindresorhus`), personal website, LinkedIn screenshot, free text

```
Sindre — I've been looking at your work maintaining so many small utilities. Managing hundreds 
of packages with consistent releases takes real discipline.

We help maintainers tighten up their release loops — cutting flaky checks, reducing re-runs, 
and making CI more predictable. It's the kind of thing that matters most when you're shipping 
often across a large surface.

Curious whether you've found any particular patterns in how your packages break in CI, or if 
the release flow mostly hums along these days?
```

GitHub context drove the opening — the model read his actual repo patterns. The offering is one sentence. The closing question is about his specific workflow, not a generic ask.

---

**Prospect: Vercel**

Inputs: GitHub (`github.com/vercel`), company website, free text about CI fit

```
Your Workflow SDK and Sandbox repos show you're building infrastructure that needs to be 
rock-solid and fast to iterate on.

We help teams like yours cut flaky CI and speed up merge-to-deploy — usually starting with 
a 2-week reliability sprint that targets flaky tests, isolation, and failure patterns. 
Typical result: 30–60% flake reduction and faster confidence on every PR.

Does CI reliability ever slow down your release velocity on the platform side?
```

Specific repo names from GitHub. Offering framed as a sprint with a concrete outcome. Ends with a question tied to their actual workflow.

---


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

## Project structure

```
├── actions/                  # Server actions, split by domain
│   ├── offerings/            # queries, mutations, types
│   ├── prospects/            # queries, mutations, extraction, auth, types
│   ├── messages/
│   └── conversations/
├── app/
│   ├── (auth)/               # login, signup
│   ├── (app)/                # protected routes
│   │   ├── dashboard/
│   │   ├── offerings/
│   │   ├── prompt/
│   │   └── prospects/
│   └── api/
│       ├── auth/[...all]/    # Better Auth handler
│       └── generate/         # Streaming route handler
├── components/
│   ├── prospects/            # Generator panel, message card, reply composer,
│   │                         # thread view, hooks, types
│   ├── offerings/
│   ├── dashboard/
│   └── ui/
├── db/
│   ├── schema.ts             # All tables, relations, JSONB types
│   └── index.ts              # Lazy Drizzle client
├── lib/
│   ├── ai.ts                 # OpenRouter streaming
│   ├── scraper.ts            # URL + vision extraction
│   ├── prompts.ts            # Default prompt + builder
│   ├── auth.ts               # Lazy Better Auth client
│   └── logger.ts             # Structured logging
├── drizzle/                  # Migration SQL, committed to git
├── proxy.ts                  # Route protection middleware
└── drizzle.config.ts
```

---


### Dashboard

- `/dashboard`
- shows message counts, prospect counts, offering usage, and recent activity

## Scraping and extraction

The app uses:

- `@extractus/article-extractor` for URLs
- DEFAULT_VISION_MODELS = ["openrouter/free", "nvidia/nemotron-nano-12b-v2-vl:free"]

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

1. **Offering in system prompt, not user message** - system prompt is persistent context the model never forgets. In the user message it competes with prospect details and can get burried

2. **Screenshots via vision model, not OCR** - LinkedIn blocks scrapers. Vision model reads the image directly, returns structured context, needs no extra dependencies.

3. **Extraction on input add, not at generation** - scrape once, store the result, reuse forever. Regenerating the same prospect costs zero scraping calls and zero rate limit risk.

4. **JSONB for inputs and threads** - prospect inputs vary by type and count, conversation threads are always read whole.

5. **Streaming is a route handler, not a server action** - server actions return values, they can't push tokens as they arrive. Only a route handler can return a `ReadableStream` body that the client reads chunk by chunk.

- The app is structured to keep files small and reusable.
- Most business logic lives in `actions/`.
- Route protection happens in `proxy.ts`.
- The dashboard and prospect pages read directly from the database on the server.

## Tradeoffs made and why

- **Drizzle + raw SQL joins** - Drizzle keeps the schema type-safe, while a few raw SQL expressions make the dashboard queries easier to express.
- **Stored extracted context** - prospect inputs are extracted once and saved, so generation does not have to scrape again every time.
- **folder structure** - i have made more files, but each one is smaller and easier to understand than a set of mega files.

## What I would do with more time

- improve URL extraction for more sites
- add a cleaner live preview when importing offering content
- add better empty/error states in the dashboard and prospect pages
- better frontend UI
- add end-to-end tests for sign-in, offering creation, prospect enrichment, generation, and replies
- add some sort of feedback loop
- add message export features

