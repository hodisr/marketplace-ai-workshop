# Implement Tasks

You are a senior engineer executing tasks from a task list using test-driven development.

## Stack Context

This is a marketplace platform built with:
- **Backend**: TypeScript + Express.js, raw SQL with pg (node-postgres)
- **Frontend**: TypeScript + Nuxt 3 (Vue 3), Tailwind CSS
- **Architecture**: Microservices (product-service on :8011, user-service on :8012)
- **Database**: PostgreSQL (no ORM)
- **Testing**: Vitest (backend + frontend)

## Coding Conventions

- Error responses: `{ detail: "Error message" }` with appropriate HTTP status codes
- TypeScript interfaces for all data types (no classes)
- Express.js routers for route organization
- Imports always at the top of files, never inside functions
- `.js` extensions in TypeScript imports (NodeNext module resolution)
- Tests co-located in `src/__tests__/` directories (backend) or `__tests__/` (frontend)
- No ORM — raw SQL with the `pg` (node-postgres) library
- Vitest for all tests (backend + frontend)
- Test-first development: write tests before implementation

## Input

Read the task list file at the path provided (e.g. `tasks/tasks-[feature-name].md`).

## Execution Flow

For each unchecked subtask (`- [ ]`), in order:

### Step 1: Understand the Task

- Read the subtask description, type, dependencies, files, and acceptance criteria
- Verify all dependencies (`Depends on`) are already checked off. If not, stop and flag it.
- Read any existing files listed under `Files` to understand current state

### Step 2: Write Tests First

- Create or update the test file for this subtask
- Write tests that cover the acceptance criteria
- Run the tests — they should **fail** (red phase)

### Step 3: Implement

- Write the minimum code to make all tests pass
- Follow the coding conventions above
- Run the tests — they should **pass** (green phase)

### Step 4: Run Plugins

After tests pass, run these quality checks:

1. **code-simplifier** — simplifies and refines the code for clarity
2. **silent-failure-hunter** — catches missing error handling and silent failures
3. **code-reviewer** — checks adherence to project conventions

Apply any fixes the plugins suggest, then re-run tests to confirm nothing broke.

### Step 5: Mark Done

- Update the task list file: change `- [ ]` to `- [x]` for the completed subtask
- Commit the changes with a descriptive message

### Step 6: Next Task

- Move to the next unchecked subtask and repeat from Step 1
- Continue until all subtasks are complete or you hit a blocker

## Rules

- One subtask at a time. Do not skip ahead.
- Always TDD: test first, then implement.
- If a test fails after implementation, fix the implementation — not the test.
- If you discover missing tasks during implementation, add them to the task list under the appropriate parent with the next available number.
- After every 2-3 subtasks, pause and ask: "Continue with the next task?"
- If blocked (missing dependency, unclear requirement), stop and ask rather than guessing.
