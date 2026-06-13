# Architecture

## Goal

An AI-powered ticket workspace that receives operational requests, classifies
them with an LLM, and tracks their status through a dashboard and a detail view.
The whole stack runs with `docker compose up --build`.

## Tech stack

- **Frontend:** React + Vite + Tailwind CSS, served as static files by nginx
- **Backend:** Node.js + Express + Prisma ORM
- **Database:** PostgreSQL 16
- **AI:** LLM through an OpenAI-compatible API (default: gpt-oss-120b on Cerebras)
- **Runtime:** Docker Compose

## Components

Three containers. The browser only ever talks to nginx; nginx serves the built
React app and proxies `/api` to the backend, so there are no CORS headers and no
backend port baked into the client. The backend is the only service that talks
to PostgreSQL and the LLM, keeping the AI API key server-side.

```
browser ──▶ frontend (nginx :5173)
                  │  serves the React SPA
                  └──/api──▶ backend (Express :3004) ──SQL──▶ PostgreSQL
                                       │
                                       └──HTTPS──▶ LLM (OpenAI-compatible API)
```

The web app is on host port **5173**, the backend on **3004**, and Postgres is
mapped to host port **5434** to avoid clashing with services that commonly
occupy 3000/3001/5432.

## Data model

**tickets**
- `id` (uuid, PK)
- `customer_name` (text, required)
- `request_text` (text, required)
- `attachment_url` (text, optional)
- `category` (text: Finance | Legal | Procurement | Operations)
- `priority` (text: High | Medium | Low)
- `summary` (text)
- `status` (text, default `Open`: Open | In Progress | Resolved | Closed)
- `owner` (text, nullable)
- `ai_status` (text, default `pending`: pending | processing | done | failed)
- `created_at`, `updated_at` (timestamptz)

**comments**
- `id` (uuid, PK)
- `ticket_id` (uuid, FK to tickets, cascade delete)
- `author` (text)
- `body` (text)
- `created_at` (timestamptz)

**agents** (support team, seeded on startup)
- `id` (uuid, PK)
- `name` (text)
- `email` (text, unique)
- `created_at` (timestamptz)

A ticket's `owner` holds the chosen agent's name, so the dashboard can offer a
dropdown of the seeded team while keeping the tickets table self-contained.

## API

- `GET  /api/health`
- `POST /api/tickets` — create
- `GET  /api/tickets` — list (dashboard)
- `GET  /api/tickets/:id` — detail + comments
- `PATCH /api/tickets/:id` — update status / owner
- `POST /api/tickets/:id/comments` — add comment
- `POST /api/tickets/:id/classify` — re-run AI classification
- `GET  /api/agents` — list the support team

Validation is handled with zod. A centralized Express error handler maps
validation errors to 400 and missing records to 404.

## AI classification

When a ticket is created, the backend calls the LLM with a structured prompt
that asks for `{ category, priority, summary }` as JSON. The result is persisted
on the ticket and `ai_status` moves `pending -> processing -> done` (or `failed`
on error, so a bad AI call never blocks ticket creation). Because the provider
exposes an OpenAI-compatible endpoint, the standard OpenAI SDK is simply pointed
at `LLM_BASE_URL`, which keeps the integration provider-agnostic.

## Error handling

- Invalid input returns 400 with details.
- A missing ticket returns 404.
- AI failures are caught and recorded as `ai_status = failed`; ticket creation
  still succeeds.

## Data flow

1. The user submits a ticket from the React form.
2. The backend validates the payload and stores the ticket.
3. The backend asks the LLM to classify the request and updates the ticket.
4. The dashboard lists all tickets; the detail view allows status changes,
   owner assignment and comments.
