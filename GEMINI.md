# Project Context & Rules

## Source of Truth

- The primary specification for this project is located at `@docs/specs.md`. Always refer to it for architectural and feature decisions.
- The engineering workflow is defined in `@docs/workflow.md`.
- The application's routing and URL strategy is defined in `@docs/url-structure.md`.

## Current Focus

- **Active Feature:** Authentication (See: `docs/plans/01-authentication.md`)

## Rules & Mandates

- **Strict Task Approval:** NEVER proceed to the next task in a plan until the user has explicitly approved the implementation of the current task.
- **Workflow Adherence:** Always follow the Execution Loop defined in `@docs/workflow.md` (Verify -> Commit -> Approval -> Next Task).
- **Better Auth Documentation (LLM-friendly):** https://www.better-auth.com/llms.txt
- **Next.js Documentation (LLM-friendly):** https://nextjs.org/docs/llms.txt
- **Drizzle Documentation (LLM-friendly):** https://orm.drizzle.team/llms.txt
- **Shadcn UI Documentation (LLM-friendly):** https://ui.shadcn.com/llms.txt
- **Package Manager:** This project uses `pnpm`. Use `pnpm dlx` instead of `npx` for one-off commands.
- **Terminology:** Use **"Workspace"** for all user-facing UI text, labels, and messages. Keep **"Organization"** for backend code, database schemas, API routes, and technical identifiers (e.g., `organizationId`).
