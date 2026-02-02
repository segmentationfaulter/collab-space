# Engineering Workflow

We follow a structured "Feature-by-Feature" development workflow to ensure quality, testability, and steady progress.

## 1. Feature Lifecycle

Every major feature (as defined in `specs.md`) follows this lifecycle:

1.  **Selection:** We pick a feature (e.g., "5.1 Authentication").
2.  **Planning:** We create a dedicated plan file in `docs/plans/` (e.g., `docs/plans/01-auth.md`).
    - This plan breaks the feature into small, atomic **Tasks**.
    - Each task must have a clear "Definition of Done" (usually a test passing).
3.  **Approval:** The user reviews and approves the plan.
4.  **Execution Loop:**
    - **Implement Task:** We write the code for _one_ task.
    - **Verify:** We run the specific test or verification step.
    - **Commit:** We commit the changes with a semantic message (`feat:`, `test:`, etc.).
    - **Repeat:** We move to the next task in the plan.
5.  **Completion:** Once all tasks are done, we update the `GEMINI.md` status and mark the feature complete in `specs.md`.

## 2. Planning Artifacts

Plans are stored in `docs/plans/` and follow this naming convention: `XX-feature-slug.md` (e.g., `00-scaffold.md`, `01-auth.md`).

**Plan Template:**

```markdown
# [Feature Name] Plan

## Goals

- High-level goal 1
- High-level goal 2

## Tasks

### Task 1: [Task Name]

- [ ] Sub-step 1
- [ ] Sub-step 2
- **Verification:** Command to run to verify success.

### Task 2: [Task Name]

...
```

## 3. Rules of Engagement

- **No Invisible Work:** Do not start coding a task until the plan is approved.
- **One Task at a Time:** Focus on one atomic task. Do not try to solve the whole feature in one turn.
- **Test-Driven:** Whenever possible, define how we will test the task _before_ we write it.
