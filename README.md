# AI Ticket Workspace

A lightweight, AI-powered ticket management system for support teams. Users submit operational requests, an LLM automatically classifies them by category and priority and writes a plain-language summary, and agents track and resolve them through a live dashboard.

Built for the Sysdatec technical challenge.

---

## Tech stack

| Layer    | Technology                                        |
| -------- | ------------------------------------------------- |
| Frontend | React + Vite + Tailwind CSS (served by nginx)     |
| Backend  | Node.js + Express + Prisma ORM                    |
| Database | PostgreSQL 16                                     |
| AI       | gpt-oss-120b via Cerebras (OpenAI-compatible API) |
| Runtime  | Docker Compose                                    |

---

## Architecture

```
browser ──▶ frontend (nginx :5173)
                 │  serves the React SPA
                 └──/api──▶ backend (Express :3004) ──SQL──▶ PostgreSQL
                                      │
                                      └──HTTPS──▶ LLM (OpenAI-compatible API)
```

Three containers run behind Docker Compose. The browser only talks to nginx; nginx serves the built React app and proxies all `/api` requests to the backend. This means:

- No CORS configuration needed.
- No backend port or AI API key ever reaches the browser.
- The database is only accessible from the backend container.

---

## Getting started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose included (Docker Desktop on Mac/Windows).

### Run

```bash
# 1. Copy the environment template and fill in your API key
cp .env.example .env

# 2. Build images and start all services
docker compose up --build
```

| Service  | URL                         |
| -------- | --------------------------- |
| Web app  | http://localhost:5173       |
| API      | http://localhost:3004       |
| Postgres | localhost:5434 (host port)  |

The backend runs `prisma migrate deploy` on startup and seeds the support team automatically, so there is no manual database setup.

> **AI key:** Set `LLM_API_KEY` in `.env` before starting. Without it, tickets are still created and stored normally — AI classification will stay in `pending` state and can be triggered manually later.

---

## Web app

A single-page app built with React and Vite, styled with Tailwind CSS.

### Agent session

When you first open the app, a **"Who are you?"** modal appears listing the seeded support team. Select your profile — it is saved to `localStorage` and used to attribute comments automatically. You can switch profiles at any time by clicking your name in the top bar. No passwords, no JWT — this is a lightweight session designed for an internal tool used by a small, trusted team.

### Features

- **Board and list views** — tickets grouped into columns by status (Open, In Progress, Resolved, Closed), or a compact sortable table. Switch between views from the top bar.
- **Filters and search** — filter by queue (status) from the sidebar; search across customer name, request text, AI summary, category, and assigned owner.
- **Create ticket** — fill in customer name, request text, and an optional attachment URL. The ticket is sent to the AI classifier immediately on creation; the result appears in the detail drawer within seconds.
- **Detail drawer** — slide-in panel with the full request, AI triage results (category, priority, summary), a re-run triage button, editable status and owner dropdowns, and a comment thread.
- **Comment thread** — agents leave notes on a ticket. Comments are automatically attributed to the selected agent profile; no manual name entry.
- **Triage status indicator** — every ticket card and detail view shows the AI lifecycle: `pending → processing → done | failed`.

---

## API

Base URL: `http://localhost:3004`

| Method | Endpoint                        | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/health`                   | Health check                             |
| POST   | `/api/tickets`                  | Create a ticket (triggers AI triage)     |
| GET    | `/api/tickets`                  | List all tickets                         |
| GET    | `/api/tickets/:id`              | Get a ticket with its comments           |
| PATCH  | `/api/tickets/:id`              | Update `status` and/or `owner`           |
| POST   | `/api/tickets/:id/comments`     | Add a comment                            |
| POST   | `/api/tickets/:id/classify`     | Re-run AI classification on a ticket     |
| GET    | `/api/agents`                   | List the support team                    |

### Request & response examples

```bash
# Create a ticket
curl -X POST http://localhost:3004/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corp",
    "requestText": "We need an invoice reissued for March.",
    "attachmentUrl": "https://example.com/invoice.pdf"
  }'

# List all tickets
curl http://localhost:3004/api/tickets

# Update status and assigned owner
curl -X PATCH http://localhost:3004/api/tickets/<id> \
  -H "Content-Type: application/json" \
  -d '{ "status": "In Progress", "owner": "Valentina Gómez" }'

# Add a comment
curl -X POST http://localhost:3004/api/tickets/<id>/comments \
  -H "Content-Type: application/json" \
  -d '{ "author": "Carlos Mendez", "body": "Looking into this now." }'

# Re-run AI classification
curl -X POST http://localhost:3004/api/tickets/<id>/classify

# List support agents
curl http://localhost:3004/api/agents
```

---

## AI classification

When a ticket is created, the backend sends the `requestText` to the LLM with a structured prompt asking for a JSON response containing `category`, `priority`, and `summary`. The result is stored on the ticket record.

**Categories:** Finance · Legal · Procurement · Operations  
**Priorities:** High · Medium · Low

The `ai_status` field tracks the full lifecycle:

```
pending → processing → done
                    ↘ failed
```

- `pending` — ticket created, classification not yet started.
- `processing` — LLM call in flight.
- `done` — classification stored successfully.
- `failed` — LLM call errored; ticket is intact, re-run via the UI or `POST /api/tickets/:id/classify`.

**AI failures never block ticket creation.** The ticket is always saved first; classification is a best-effort step that runs after.

**Provider-agnostic:** the integration uses the OpenAI SDK pointed at `LLM_BASE_URL`. Swap the provider by changing two `.env` variables — no code changes needed. The `.env.example` includes ready-to-use settings for Cerebras (default), OpenRouter, and DashScope.

---

## Data model

### tickets

| Column           | Type      | Notes                                              |
| ---------------- | --------- | -------------------------------------------------- |
| `id`             | uuid (PK) | Auto-generated                                     |
| `customer_name`  | text      | Required                                           |
| `request_text`   | text      | Required                                           |
| `attachment_url` | text      | Optional — external URL (image, PDF, etc.)         |
| `category`       | text      | Set by AI: Finance, Legal, Procurement, Operations |
| `priority`       | text      | Set by AI: High, Medium, Low                       |
| `summary`        | text      | Set by AI: plain-language summary                  |
| `status`         | text      | Default `Open`; Open, In Progress, Resolved, Closed|
| `owner`          | text      | Agent name (nullable)                              |
| `ai_status`      | text      | Default `pending`; pending, processing, done, failed|
| `created_at`     | timestamptz |                                                  |
| `updated_at`     | timestamptz |                                                  |

### comments

| Column      | Type      | Notes                                    |
| ----------- | --------- | ---------------------------------------- |
| `id`        | uuid (PK) |                                          |
| `ticket_id` | uuid (FK) | References tickets; cascade delete       |
| `author`    | text      | Agent name                               |
| `body`      | text      |                                          |
| `created_at`| timestamptz |                                        |

### agents

Seeded automatically on first startup. Used for the owner dropdown and comment attribution.

| Column     | Type      | Notes        |
| ---------- | --------- | ------------ |
| `id`       | uuid (PK) |              |
| `name`     | text      |              |
| `email`    | text      | Unique       |
| `created_at`| timestamptz |           |

---

## Project structure

```
.
├── docker-compose.yml          # Three services: db, backend, frontend
├── .env.example                # All environment variables with documentation
├── README.md
├── docs/
│   └── architecture.md         # Architecture deep-dive
├── frontend/                   # React + Vite SPA
│   ├── Dockerfile              # Build → static files served by nginx
│   ├── nginx.conf              # SPA fallback + /api proxy to backend
│   ├── package.json
│   └── src/
│       ├── App.jsx             # Root shell, routing state, agent session
│       ├── main.jsx
│       ├── api/
│       │   └── client.js       # Fetch wrapper for all REST endpoints
│       ├── components/
│       │   ├── AgentSelector.jsx   # "Who are you?" session picker modal
│       │   ├── Board.jsx           # Kanban board grouped by status
│       │   ├── Chips.jsx           # Priority/category chips, Avatar
│       │   ├── Icon.jsx            # Icon component
│       │   ├── NewTicketModal.jsx  # Create ticket form
│       │   ├── Sidebar.jsx         # Status filter navigation
│       │   ├── TicketCard.jsx      # Board card
│       │   ├── TicketDetail.jsx    # Slide-in detail drawer
│       │   └── TicketTable.jsx     # List view table
│       └── lib/
│           ├── constants.js        # Statuses, category/priority lists
│           ├── format.js           # Date formatters
│           └── ui.js               # Shared Tailwind class constants
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── prisma/
    │   └── schema.prisma       # Data model (Ticket, Comment, Agent)
    └── src/
        ├── index.js            # Express app entry point + middleware
        ├── db.js               # Prisma client singleton
        ├── seed.js             # Seeds the support team on startup
        ├── ai/
        │   ├── classify.js     # Ticket classification logic
        │   └── llm.js          # OpenAI-compatible client setup
        └── routes/
            ├── tickets.js      # Ticket + comment endpoints
            └── agents.js       # GET /api/agents endpoint
```

---

## Local frontend development

If you want to iterate on the frontend without rebuilding Docker, run the backend stack first and then start Vite's dev server:

```bash
# Start the backend services (db + backend)
docker compose up db backend

# In another terminal, start the frontend dev server
cd frontend
npm install
npm run dev   # http://localhost:5173, proxies /api → localhost:3004
```
