# Plan: 03-background-jobs (Infrastructure & Notifications)

## Goals

- Establish a robust, serverless background job system using Inngest.
- Integrate Resend for reliable email delivery.
- Automate Workspace invitation emails via Better Auth hooks.
- Implement task assignment notifications.
- Setup local debugging via the Inngest Dev Server.

## Tasks

### Task 1: Inngest & Resend Setup

- [ ] Install dependencies: `pnpm add inngest resend`.
- [ ] Setup Inngest Client: Create `src/lib/inngest/client.ts`.
- [ ] Setup Route Handler: Create `src/app/api/inngest/route.ts` to serve Inngest functions.
- [ ] Configure Environment: Add `RESEND_API_KEY`, `INNGEST_EVENT_KEY`, and `INNGEST_SIGNING_KEY` (placeholder for local) to `.env`.
- [ ] Local Dev Tooling: Add `"inngest:dev": "npx inngest-cli@latest dev -u http://localhost:3000/api/inngest"` to `package.json`.
- **Verification:** Run `pnpm inngest:dev` and ensure the Inngest UI detects the local app.

### Task 2: Email Foundation & Helper

- [ ] Create simple JSX email templates in `src/components/emails/` (e.g., `InvitationEmail.tsx`, `TaskAssignedEmail.tsx`).
- [ ] Create a `sendEmail` utility in `src/lib/email.ts` using the Resend SDK.
- **Verification:** Create a temporary test route to send a sample email to yourself.

### Task 3: Invitation System Integration

- [ ] Implement `workspace/member.invited` Inngest function.
- [ ] Hook into Better Auth: Use `onInvitationSent` (or similar hook) to trigger the Inngest event when a workspace invite is created.
- [ ] Handle Edge Cases: Ensure the job is idempotent and handles missing data gracefully.
- **Verification:** Invite a user via the UI and verify the "Send Email" job appears and succeeds in the Inngest Dev Server.

### Task 4: Task Assignment Notifications

- [ ] Define `task/assigned` event schema in Inngest client.
- [ ] Implement `sendTaskAssignmentEmail` Inngest function.
- [ ] Update Kanban tRPC procedures: Trigger the `task/assigned` event when a task is created with an assignee or when the assignee is updated.
- **Verification:** Assign a task to a user in the Kanban board and verify the notification job triggers.

### Task 5: Scheduled Jobs (Due Date Reminders)

- [ ] Implement a cron-scheduled Inngest function (`app/task.due-soon`) that runs daily.
- [ ] Query Logic: Find tasks due in the next 24 hours that haven't been notified yet.
- [ ] Batch Processing: Trigger individual notification events for each task found.
- **Verification:** Manually trigger the scheduled job via Inngest UI and verify it correctly identifies "due soon" tasks.
