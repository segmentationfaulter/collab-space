# Project Context & Rules

## Source of Truth

- The primary specification for this project is located at `@docs/specs.md`. Always refer to it for architectural and feature decisions.

## Development Standards

- **Seeding:** Ensure `npm run db:seed` is always functional to populate a dev environment.
- **Security:** Sanitize all user-generated content (especially Markdown) to prevent XSS.
