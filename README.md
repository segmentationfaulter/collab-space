# CollabSpace

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://collab-space-gilt.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![tRPC](https://img.shields.io/badge/tRPC-%E2%9C%93-blue.svg)](https://trpc.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CollabSpace** is a high-performance, full-stack task collaboration platform designed for modern software teams. Inspired by industry leaders like Linear and Trello, it serves as a showcase of production-grade engineering, featuring a multi-tenant architecture, end-to-end type safety, and event-driven background processing.

## 🚀 Live Demo

**URL:** [https://collab-space-gilt.vercel.app/](https://collab-space-gilt.vercel.app/)

---

## 🛠 Engineering Stack

This project was built with a focus on **Type Safety**, **Scalability**, and **Developer Experience (DX)**.

### Core Architecture

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components, Suspense)
- **API Layer:** [tRPC](https://trpc.io/) for 100% end-to-end type safety between the client and server.
- **Database:** [PostgreSQL](https://www.postgresql.org/) managed via [Drizzle ORM](https://orm.drizzle.team/) for high-performance SQL with type-safe schemas.
- **Authentication:** [Better Auth](https://www.better-auth.com/) with Multi-tenancy (Organizations) support.
- **Background Jobs:** [Inngest](https://www.inngest.com/) for serverless, event-driven workflows (e.g., automated emails).

### Frontend & UI

- **Styling:** Tailwind CSS with [shadcn/ui](https://ui.shadcn.com/) for accessible, headless components.
- **State Management:** TanStack Query (React Query) for robust server-state caching and optimistic UI updates.
- **Validation:** Type-safe schema validation using [Zod](https://zod.dev/).

### Infrastructure & DevOps

- **Deployment:** Vercel (Serverless Edge).
- **CI/CD:** GitHub Actions for automated linting, type-checking, and building.
- **Infrastructure:** Docker Compose for local development (Postgres, Redis).

---

## ✨ Key Features (Implemented)

### 🏢 Multi-Tenant Workspaces

- Users can create and belong to multiple **Workspaces**.
- Role-based access control (Owner, Admin, Member) via `@better-auth/organizations`.
- Custom workspace slugs and dynamic routing.

### 📋 Kanban Board System

- Full CRUD operations for boards and tasks.
- Column-based task management (Todo, In Progress, Done).
- **Optimistic UI:** Instant feedback when moving or editing tasks, with background synchronization.

### 📧 Event-Driven Workflows

- Automated workspace invitations.
- Email notifications for task assignments and system alerts.
- Retriable background jobs handled by Inngest.

---

## 🗺 Roadmap & Progress

I am building this project in phases, following a rigorous engineering specification.

### 🚧 Current Focus: Phase 1 (MVP)

- [ ] **Collaboration:** Threaded comments on tasks and a persistent activity feed.
- [ ] **Time Tracking:** Integrated task timers and basic duration reporting.
- [ ] **Testing Infrastructure:** Expanding E2E coverage with Playwright and deeper tRPC integration tests with Vitest.
- [ ] **Observability:** Sentry integration for error tracking and structured JSON logging for server logs.

### 🌟 Future Vision: Phase 2

- [ ] **Real-Time Sync:** Implementing Server-Sent Events (SSE) for live multi-user board updates.
- [ ] **Offline-First PWA:** Service worker asset caching and an offline mutation queue for mobile-ready usage.
- [ ] **Public REST API:** A documented API surface with Bearer token authentication for external integrations.

---

## 💻 Local Development

I've prioritized **Developer Experience** so the project can be spun up with minimal effort:

1.  **Clone the repo:** `git clone ...`
2.  **Infrastructure:** Run `docker-compose up -d` to start local Postgres and Redis.
3.  **Install:** `pnpm install`
4.  **Database:** `pnpm db:push` to sync the schema.
5.  **Dev Server:** `pnpm dev`

---

## 🧠 Engineering Philosophy

This isn't just a "todo app." It’s an exploration of how to build **resilient** and **type-safe** distributed systems on the web.

- **Strict Typing:** No `any`. Every piece of data from the database to the button click is typed.
- **Optimistic UI:** Every mutation is designed to feel instantaneous, masking server latency for a superior user experience.
- **Scalable Multitenancy:** The database and auth layers are built to support thousands of isolated organizations from day one.

---

_Built with ❤️ for a better collaboration experience._
