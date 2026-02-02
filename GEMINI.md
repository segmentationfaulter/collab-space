# Project Context & Rules

## Source of Truth

- The primary specification for this project is located at `@docs/specs.md`. Always refer to it for architectural and feature decisions.
- The design system standards are located at `@docs/design-system.md`.
- The engineering workflow is defined in `@docs/workflow.md`.

## Current Focus

- **Active Feature:** Authentication (See: `docs/plans/01-authentication.md`)

## Resources

- **Better Auth Documentation (LLM-friendly):** https://www.better-auth.com/llms.txt

## Git Conventions

- **Seeding:** Ensure `npm run db:seed` is always functional to populate a dev environment.
- **Security:** Sanitize all user-generated content (especially Markdown) to prevent XSS.
