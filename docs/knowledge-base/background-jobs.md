# Knowledge Base: Background Jobs and Email Delivery

This document explores different strategies for handling asynchronous tasks in CollabSpace, such as sending invitation emails, task assignments, and processing long-running jobs.

---

## 1. Why Background Jobs?

In a web application, certain tasks should not block the main request/response cycle:

- **Email Sending:** Network latency from third-party APIs (Resend, SendGrid) can slow down the UI.
- **Reliability:** If an email fails to send, we need a way to retry it without the user having to re-submit their action.
- **Scale:** Offloading heavy processing ensures the web server remains responsive.

---

## 2. Approach 1: BullMQ (Redis-Backed)

**Status:** Defined in project `specs.md`.

BullMQ is the industry standard for Node.js. It uses **Redis** to store a queue of jobs and a separate **Worker** process to execute them.

- **Pros:**
  - **Robustness:** Built-in support for retries, backoff, and delayed jobs.
  - **Observability:** Excellent tooling for monitoring queue health and failure rates.
  - **Portfolio Value:** Demonstrates knowledge of distributed systems and infrastructure management.
- **Cons:**
  - **Infrastructure Overhead:** Requires managing a Redis instance and a long-running containerized worker (Vercel alone is not enough).

---

## 3. Approach 2: `next/after` (Native Next.js)

Next.js 15+ introduced `after()`, allowing code to run after the response has been sent to the user.

- **Pros:**
  - **Zero Infrastructure:** No Redis or separate workers needed.
  - **Simplicity:** Extremely easy to implement for simple tasks like fire-and-forget emails.
- **Cons:**
  - **No Persistence:** If the serverless function hits a timeout or the process restarts, the job is lost forever.
  - **No Retries:** If the email provider is down, the email will not be sent, and there is no automatic retry mechanism.

---

## 4. Approach 3: Inngest (Serverless / Event-Driven)

Inngest is a modern "background job as a service" that works via webhooks.

- **Pros:**
  - **Serverless Friendly:** Works perfectly on Vercel; no long-running workers required.
  - **Reliability:** Full state management, retries, and "step-through" functions (complex workflows).
  - **DX:** You write worker code directly inside your Next.js API routes.
- **Cons:**
  - **SaaS Dependency:** Introduces a third-party dependency with its own pricing and uptime.

---

## 5. Approach 4: Database-Backed Queues (Postgres)

Using tools like `pg-boss` or custom logic to store jobs in a `jobs` table in PostgreSQL.

- **Pros:**
  - **Transactional Integrity:** You can save a "New Task" and an "Email Notification" in the _same_ database transaction. They either both succeed or both fail.
  - **Less Infrastructure:** Reuses your existing Postgres database; no Redis needed.
- **Cons:**
  - **Performance:** Not as high-throughput as Redis; constant polling can put slight pressure on the database.

---

## 6. Comparison Summary

| Feature          | BullMQ         | `next/after` | Inngest     | DB-Backed       |
| :--------------- | :------------- | :----------- | :---------- | :-------------- |
| **Persistence**  | High (Redis)   | None         | High (SaaS) | High (Postgres) |
| **Retries**      | Automatic      | Manual/None  | Automatic   | Automatic       |
| **Infra Needed** | Redis + Worker | None         | None        | Postgres        |
| **Complexity**   | High           | Low          | Medium      | Medium          |

## Recommendation for CollabSpace

For this project, we prioritize **Engineering Depth** and **Reliability**.

While `next/after` is suitable for simple notifications, **BullMQ** (as specified in our architecture) provides the most robust solution for a production-grade SaaS application. It allows us to showcase a decoupled architecture where the Next.js app acts as a **Producer** and a separate Dockerized service acts as the **Consumer**.
