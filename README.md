# AI Ticket Workspace

A lightweight, AI-powered ticket management system. Users create operational
tickets, an LLM (Qwen via Alibaba DashScope) classifies them by category and
priority and writes a short summary, and a dashboard tracks their status.

Built for the Sysdatec technical challenge.

## Tech stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React + Vite + Tailwind        |
| Backend  | Node.js + Express + Prisma ORM |
| Database | PostgreSQL 16                  |
| AI       | Qwen via Alibaba DashScope     |
| Runtime  | Docker Compose                 |

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌──────────────┐
│  frontend   │─────▶│     backend      │─────▶│  PostgreSQL  │
│ React+Vite  │ HTTP │  Node + Express  │  SQL │   (db)       │
└─────────────┘      └────────┬─────────┘      └──────────────┘
                              │ HTTPS
                              ▼
                     ┌──────────────────┐
                     │  Qwen / DashScope│
                     └──────────────────┘
```

The backend is the only service that talks to PostgreSQL and to Qwen, so the
AI API key never reaches the browser.

## Getting started

### Prerequisites

- Docker + Docker Compose

### Run

```bash
# 1. Copy the environment template
cp .env.example .env

# 2. Build and start everything
docker compose up --build
```

The backend will be available at **http://localhost:3004**.
Postgres is exposed on host port **5434** to avoid clashing with a local
Postgres. Change `DB_PORT` in `.env` if that port is also taken.

On startup the backend syncs the schema and creates the tables automatically,
so there is no manual migration step.

## API

Base URL: `http://localhost:3004`

| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ----------------------------- |
| GET    | `/api/health`               | Healthcheck                   |
| POST   | `/api/tickets`              | Create a ticket               |
| GET    | `/api/tickets`              | List all tickets (dashboard)  |
| GET    | `/api/tickets/:id`          | Get a ticket with its comments|
| PATCH  | `/api/tickets/:id`          | Update `status` and/or `owner`|
| POST   | `/api/tickets/:id/comments` | Add a comment                 |

### Examples

```bash
# Create a ticket
curl -X POST http://localhost:3004/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Acme Corp",
    "requestText": "We need an invoice reissued for March.",
    "attachmentUrl": "https://example.com/invoice.pdf"
  }'

# List tickets
curl http://localhost:3004/api/tickets

# Update status and owner
curl -X PATCH http://localhost:3004/api/tickets/<id> \
  -H "Content-Type: application/json" \
  -d '{ "status": "In Progress", "owner": "Maria" }'

# Add a comment
curl -X POST http://localhost:3004/api/tickets/<id>/comments \
  -H "Content-Type: application/json" \
  -d '{ "author": "Maria", "body": "Looking into this now." }'
```

## Data model

**tickets**: `id`, `customer_name`, `request_text`, `attachment_url`,
`category`, `priority`, `summary`, `status`, `owner`, `ai_status`,
`created_at`, `updated_at`.

**comments**: `id`, `ticket_id` (FK to tickets, cascade delete), `author`,
`body`, `created_at`.

The classifier fills `category`, `priority` and `summary` when a ticket is
created. `ai_status` tracks the classification lifecycle
(`pending` -> `processing` -> `done` / `failed`).

## Project structure

```
.
├── docker-compose.yml        # db + backend services
├── .env.example
├── README.md
├── docs/                     # architecture notes
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── prisma/schema.prisma   # data model
    └── src/
        ├── index.js           # Express app + middleware
        ├── db.js              # Prisma client
        └── routes/tickets.js  # ticket + comment endpoints
```
