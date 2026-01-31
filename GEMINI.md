# Project Context: CollabSpace

**CollabSpace** is a modern, full-stack project and task collaboration platform inspired by tools like Linear and Trello.

## Key Goals
1.  **Portfolio-Grade:** Demonstrate end-to-end full-stack skills (Next.js 15, tRPC, Postgres).
2.  **Architecture:** Clean architecture, "CV-ready" documentation, and solid engineering trade-offs (ADRs).
3.  **Phased Delivery:**
    *   **Phase 1 (MVP):** Core Kanban features, Auth, Workspace management, Email notifications.
    *   **Phase 2 (Polish):** Real-time (SSE), Offline-first (PWA), Observability (OpenTelemetry), Testing Pyramid.

## Tech Stack Summary

*   **Frontend:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query.
*   **Backend:** Node.js, tRPC, Auth.js (NextAuth v5).
*   **Database:** PostgreSQL (Drizzle ORM + `postgres.js`), Redis (Caching/Queues).
*   **Async/Jobs:** BullMQ.
*   **Infrastructure:** Docker Compose (Local), Vercel (App), Managed PG/Redis (Prod).
*   **Testing:** Playwright (E2E), Vitest (Unit/Integration).

## Current Status
*   **Phase:** Setup / Initialization.
*   **Docs:** `docs/specs.md` contains the detailed specification.

## Developer Experience (DX) Guidelines
*   **Local Env:** Use `docker-compose` for services.
*   **Security:** Implement rate limiting and shared validation schemas from the start.
*   **Documentation:** Maintain ADRs in `docs/adr/` for key decisions.