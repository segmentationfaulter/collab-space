# Knowledge Base: Background Jobs and Email Delivery

This document explores different strategies for handling asynchronous tasks in CollabSpace, such as sending invitation emails, task assignments, and processing long-running jobs.

---

## 1. Why Background Jobs?

In a web application, certain tasks should not block the main request/response cycle:

- **Email Sending:** Network latency from third-party APIs (Resend, SendGrid) can slow down the UI.
- **Reliability:** If an email fails to send, we need a way to retry it without the user having to re-submit their action.
- **Scale:** Offloading heavy processing ensures the web server remains responsive.

---

## 2. Approach: Inngest (Serverless / Event-Driven)

**Status:** Currently used in CollabSpace.

Inngest is a modern "background job as a service" that works via webhooks. It allows us to build a robust, event-driven background job system that runs entirely on serverless infrastructure.

- **Pros:**
  - **Serverless Friendly:** Works perfectly on Vercel; no long-running workers or 24/7 processes required.
  - **Reliability:** Automatic retries, backoff, and state management for complex workflows.
  - **DX:** You write background logic as standard functions right inside your Next.js app.
  - **Zero Cost:** The free tier is generous and requires zero infrastructure management.
- **Cons:**
  - **SaaS Dependency:** Introduces a third-party dependency (Inngest Cloud) to manage the queue state.

---

## 3. Legacy Approach: BullMQ (Redis-Backed)

Initially, the project was planned to use BullMQ. While BullMQ is an industry standard, it requires a **stateful long-running worker** and a **Redis** instance.

- **Pros:**
  - **Robustness:** Built-in support for retries, backoff, and delayed jobs.
  - **Portfolio Value:** Demonstrates knowledge of distributed systems and infrastructure management.
- **Cons:**
  - **Infrastructure Overhead:** Requires managing a Redis instance and a long-running containerized worker. This is not $0-friendly and adds deployment complexity.

---

## 4. Other Alternatives

### `next/after` (Native Next.js)

- **Pros:** Zero infrastructure, built-in to Next.js.
- **Cons:** No persistence or automatic retries. If the function hits a timeout, the job is lost.

### Database-Backed Queues (Postgres)

- **Pros:** Transactional integrity; reuses existing database.
- **Cons:** Can put pressure on the primary database with constant polling.

---

## 5. Comparison Summary

| Feature          | Inngest (Current) | BullMQ (Legacy) | `next/after` | DB-Backed       |
| :--------------- | :---------------- | :-------------- | :----------- | :-------------- |
| **Persistence**  | High (SaaS)       | High (Redis)    | None         | High (Postgres) |
| **Retries**      | Automatic         | Automatic       | Manual/None  | Automatic       |
| **Infra Needed** | None              | Redis + Worker  | None         | Postgres        |
| **Cost**         | $0 (Free Tier)    | Paid (Server)   | $0           | $0              |

## Why we chose Inngest

For CollabSpace, we moved from BullMQ to **Inngest** to achieve **Zero Cost Infrastructure** without compromising on reliability. This demonstrates a pragmatic engineering decision: choosing a modern, serverless-native solution that fits our deployment constraints while maintaining professional-grade background job features like retries and stateful workflows.
