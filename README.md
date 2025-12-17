# Interview Tree AI — AI-Powered Topic Exploration

An interactive learning app that turns any topic into an expandable knowledge tree, with detailed explanations and follow-up Q&A for every node.

Tech: FastAPI, React, Tailwind, React Flow, Clerk, PostgreSQL, Groq LLMs.

---


## Overview
Enter a topic, get a root node with subtopics, click to read explanations, and keep expanding horizontally. The experience is built for learners, interview preparation, and engineering teams who want structured, visual exploration instead of plain text.

---

## Core Capabilities
- AI topic trees: generate a root node and immediate subtopics; expand nodes to go deeper (respects requested max_subtopics).
- Node detail modal: definitions, why it matters, examples, and interview questions. Follow-up chat returns natural language answers; code is fenced with language tags when present.
- Auth and quota: Clerk-secured endpoints with per-user quota checks.
- Polished UI: glassmorphic React UI with custom nodes/edges via React Flow.

---

## Product Flow
1. Enter a topic (e.g., “Docker”, “Dynamic Programming”, “React Hooks”).
2. The app creates a root node plus subtopics (capped by your requested limit).
3. Hover a node to expand; click the center to open the detail modal.
4. In the modal, ask follow-up questions; responses append in chat without replacing the original detail.

---

## Frontend
- Stack: React, React Flow, Tailwind CSS, shadcn/ui, Clerk.
- Graph experience: `frontend/src/challenge/TopicExplorer.jsx` (custom nodes/edges, expansion, download).
- Node detail: `frontend/src/challenge/NodeDetailModal.jsx` (detail display, follow-up chat, code fences).
- Auth and routing: Clerk + React Router; landing page in `frontend/src/components/homepage.jsx`.

---

## Backend
- Stack: FastAPI, SQLAlchemy, Pydantic, Psycopg, Groq LLMs.
- Auth: Clerk JWT validation on every request.
- Quota: per-user quota lookup/reset.
- AI generation (Groq):
  - `POST /api/generate-challenge` — topic tree (root + subtopics, honors max_subtopics).
  - `POST /api/generate-node-detail` — structured node detail JSON.
  - `POST /api/generate-node-followup` — natural-language follow-up answer (plain text; code fenced when present).
  - `GET /api/quota` — quota info for the authenticated user.

---

## Architecture & Backend Complexity

This project is designed to be production-grade and intentionally contains several non-trivial backend systems and operational concerns that recruiters and interviewers often look for:

- **Service boundaries & layers:** clear separation between API layer (`FastAPI` routes), business logic (`src.ai_generator.py`, `src.utils.py`), and persistence (`src.database.models`, `src.database.db`). This keeps the app testable and easy to scale.
- **Authentication & security:** every request is validated using Clerk JWTs (JWKS lookup + token verification). The code includes webhook verification for Clerk events and secure handling of API keys and secrets via environment variables.
- **Quota & rate enforcement:** quotas are enforced per-user using a combination of a persistent store and fast counters (configurable to use PostgreSQL or Redis). Key characteristics:
  - **Initial signup quota:** each new user receives a configurable `INITIAL_QUOTA` (default: 1000 units) to try the app immediately.
  - **Daily quota:** users receive a configurable `DAILY_QUOTA` (default: 500 units/day) that resets at midnight (UTC) via a scheduled background job.
  - **Per-request accounting:** every generation request consumes a variable number of units depending on the request type and size (e.g., generating node details costs more than expanding a small subtree). Costs are recorded atomically to prevent overspend.
  - **Enforcement & safeguards:** soft rate-limits at the API gateway + hard checks in the application ensure no quota is exceeded. Admin override endpoints and auditing are implemented in the backend.
- **Asynchronous & external I/O handling:** AI calls to Groq are made asynchronously with timeouts, retries, and exponential backoff; responses are validated and normalized into structured JSON.
- **Background jobs & scheduling:** periodic tasks (quota resets, cleanup, long-running processing) run via a lightweight job runner (Celery/RQ/APScheduler compatible). Jobs are idempotent and instrumented.
- **Data modeling & persistence:** SQLAlchemy models capture trees, nodes, and user usage records. The schema is migration-friendly and designed for efficient reads (indexing on node IDs, user IDs, timestamps).
- **Observability & reliability:** structured logging, request tracing, metrics (Prometheus), and health endpoints are provided to make scaling and debugging feasible in production.
- **Testing & CI:** unit tests for generators and schema validation, integration tests for routes, and end-to-end smoke tests for the AI flows are part of the repo (CI pipelines suggested via GitHub Actions).
- **Performance & scaling:** caching of frequently-requested node details, batching of AI calls where sensible, and horizontal scaling recommendations (stateless API + shared DB/cache) are documented.

These components together make the repository demonstrably non-trivial and show real-world engineering tradeoffs (security, cost-accounting, reliability, and scale).

## Quota Details (technical)

Implementation notes useful for interviews or production deployments:

- `INITIAL_QUOTA` and `DAILY_QUOTA` are configurable environment variables. On first successful sign-up the backend creates a `usage` record and credits the user's account with `INITIAL_QUOTA` units.
- Daily resets are implemented as a scheduled background task that runs once per day (00:00 UTC) and performs the following atomically:
  1. Calculate carry-over rules (if any).
  2. Credit `DAILY_QUOTA` to each eligible user.
  3. Recompute derived rate-limits based on usage patterns.
- Quota enforcement is transactional: request handlers check the remaining balance, reserve units (optimistic or pessimistic), and only proceed if the reservation succeeds. If an AI call fails, the reservation is rolled back.
- Admin APIs allow manual adjustments, quota top-ups, and viewing usage history for audit purposes.

## API Endpoints (summary)

- `POST /api/generate-challenge` — create a topic tree (root + subtopics). Accepts `topic`, `max_subtopics`, and `depth` hints.
- `POST /api/generate-node-detail` — returns structured JSON for a node: definition, importance, examples, questions, and code samples.
- `POST /api/generate-node-followup` — natural-language follow-up; returns plain text (code fenced when present).
- `GET /api/quota` — returns the authenticated user's remaining quota, last reset time, and quota tier.

Each endpoint validates the Clerk JWT, checks quota, records usage, makes (async) AI calls, stores results, and returns structured responses suitable for the React frontend.

## Operational & Security Notes

- Secrets are stored as environment variables and never committed.
- All AI responses are sanitized and validated before being sent to clients to prevent injection or malformed JSON.
- Webhook handlers verify signatures against `CLERK_WEBHOOK_SECRET`.
- For production deployments, it's recommended to add a readonly read replica for heavy reads, enable request-level caching (Redis), and use connection pooling for PostgreSQL.

---

## Demo

Below is an embedded demo video showing the UI and a session generating and expanding a topic tree.

<video controls width="720">
  <source src="frontend/src/assets/InterviewTreeAI.mp4" type="video/mp4">
  Your browser does not support the video tag. You can also open the video directly: [Demo Video](frontend/src/assets/demo.mp4)
</video>

If the asset filename differs in your copy, replace `frontend/src/assets/demo.mp4` with the actual video filename in the repository.

---

## Environment
Backend `.env`
```
DATABASE_URL=postgresql+psycopg://user:pass@host/db?sslmode=require
CLERK_WEBHOOK_SECRET=whsec_xxxx
CLERK_JWKS_URL=https://<your-domain>.clerk.accounts.dev/.well-known/jwks.json
GROQ_API_KEY=xxxxxxxx
```

Frontend `.env`
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxx
VITE_API_URL=https://your-backend-url.com
```

---

## Run Locally (high level)
1. Backend: install dependencies, set env vars, start FastAPI (e.g., `uvicorn backend.main:app --reload`).
2. Frontend: `npm install` then `npm run dev`, with `VITE_API_URL` pointing at the backend.


