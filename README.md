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

---

## Roadmap (concise)
- Save and replay trees per user; export as image/PDF.
- AI practice questions and spaced repetition.
- Premium tiers, sharing, and collaboration.

