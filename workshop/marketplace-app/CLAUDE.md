# Marketplace App

Microservices-based marketplace for the AI Development Workshop. Used as a sandbox for participants to practice AI-assisted development.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 (Vue 3, TypeScript, Tailwind CSS) |
| Backend | Express.js (TypeScript, raw SQL with `pg`) |
| Database | PostgreSQL (single DB, separate schemas per service) |
| Testing | Vitest (frontend + backend) |
| Infrastructure | Docker Compose + GitHub Actions CI |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Frontend   │────▶│  Product Service  │────▶│             │
│  Nuxt 3      │     │  Express.js       │     │  PostgreSQL │
│  :3333       │     │  :8011 (→8001)    │     │  :5433      │
│              │     └──────────────────┘     │             │
│              │     ┌──────────────────┐     │  schemas:   │
│              │────▶│  User Service     │────▶│  products   │
│              │     │  Express.js       │     │  users      │
└─────────────┘     │  :8012 (→8002)    │     └─────────────┘
                     └──────────────────┘
```

## Service Ports

| Service | External Port | Internal Port |
|---------|--------------|---------------|
| Frontend | 3333 | 3000 |
| Product Service | 8011 | 8001 |
| User Service | 8012 | 8002 |
| PostgreSQL | 5433 | 5432 |

## Common Commands

```bash
# Start everything
docker compose up --build

# Run backend tests
cd backend/product-service && npm install && npm test
cd backend/user-service && npm install && npm test

# Run frontend tests
cd frontend && npm install && npm test

# Local dev (without Docker)
cd backend/product-service && npm install && npx tsx src/index.ts
cd backend/user-service && npm install && npx tsx src/index.ts
cd frontend && npm install && npm run dev
```

## Database

- **No ORM** — raw SQL with the `pg` (node-postgres) library
- Product service uses schema `products` (tables: `products`, `categories`)
- User service uses schema `users` (tables: `users`, `seller_profiles`)
- Connection string: `postgresql://marketplace:marketplace@localhost:5433/marketplace`

## Conventions

- Error responses: `{ detail: "Error message" }` with appropriate HTTP status codes
- TypeScript interfaces for all data types (no classes)
- Express.js routers for route organization
- Imports always at the top of files, never inside functions
- `.js` extensions in TypeScript imports (NodeNext module resolution)
- Tests co-located in `src/__tests__/` directories (backend) or `__tests__/` (frontend)
- No ORM — raw SQL with the `pg` (node-postgres) library
- Vitest for all tests (backend + frontend)
- Test-first development: write tests before implementation

## API Contracts

### Product Service (port 8011)

```
GET  /health                          → { status: "healthy", service: "product-service" }
GET  /api/products?page=1&per_page=20 → { items: Product[], meta: PaginationMeta }
GET  /api/products/:id                → Product (404: { detail: "Product not found" })
POST /api/products                    → Product (201)
PUT  /api/products/:id                → Product (404: { detail: "Product not found" })
DELETE /api/products/:id              → 204 (404: { detail: "Product not found" })
```

### User Service (port 8012)

```
GET  /health                          → { status: "healthy", service: "user-service" }
GET  /api/users/:id                   → User (404: { detail: "User not found" })
POST /api/users                       → User (201, 409: { detail: "Email already registered" })
GET  /api/sellers/:id                 → SellerProfile (404: { detail: "Seller profile not found" })
```

---

## AI Development Workflow

This project uses a two-file system for AI-assisted feature development. The workflow is available as Claude Code slash commands (`.claude/commands/`) and Cursor rules (`.cursor/rules/`).

### Step 1: Create PRD

In Claude Code, run `/create-prd`. In Cursor, invoke the `create-prd` rule. The AI will:
1. Ask 6 clarifying questions about the feature
2. Generate a structured PRD with 9 sections (Overview, Goals, User Stories, Technical Requirements, API Contracts, Data Models, Edge Cases, Success Metrics, Out of Scope)
3. Save to `tasks/prd-[feature-name].md`

### Step 2: Generate Tasks

In Claude Code, run `/generate-tasks` with the PRD path. In Cursor, invoke the `generate-tasks` rule. The AI will:
1. **Phase 1**: Generate 3-5 parent tasks (numbered 0.0-5.0) — then STOP
2. You review and say "Go"
3. **Phase 2**: Expand each parent into 2-6 subtasks with Type, Dependencies, Files, Description, and Acceptance Criteria
4. Save to `tasks/tasks-[feature-name].md`

### Step 3: Execute Tasks

Work through the task list in order, checking off each subtask. Each subtask should:
- Be completable in one AI session
- Address one concern (a model OR an endpoint OR a component)
- Include tests as part of the implementation (test-first)

After implementing a task, run code quality plugins before committing:
- `code-simplifier` — simplifies and refines code for clarity
- `silent-failure-hunter` — identifies silent failures and inadequate error handling
- `code-reviewer` — reviews code for adherence to project guidelines
