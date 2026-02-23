# Migration Plan: Reimplement Marketplace App

## Context

The workshop marketplace app at `workshop/marketplace-app/` is currently built with Next.js 14 (React) + FastAPI (Python). It needs to be reimplemented from scratch using the team's actual stack: **TypeScript/Nuxt 3 (Vue) + Node.js/Express.js**.

This is a full reimplementation, not a refactor. Delete old code and build fresh.

**Base path**: `/Users/hodisraeli/.superset/worktrees/sourcix-workshop/hod-israeli/agentic-workshop/workshop`

---

## New Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Nuxt 3 (Vue 3, TypeScript, Tailwind CSS) |
| Backend | Express.js (TypeScript, raw SQL with `pg` node-postgres) |
| Database | PostgreSQL (same as current) |
| Testing | Vitest for everything (frontend + backend) |
| Infrastructure | Docker Compose + GitHub Actions CI |

**Same ports**: frontend 3333, product-service 8011, user-service 8012, PostgreSQL 5433

**Same architecture**: 2 microservices + frontend + PostgreSQL

**No ORM** — use raw SQL with `pg` (node-postgres)

---

## API Contracts (must be preserved exactly)

### Product Service (port 8011, internal 8001)

```
GET  /health                    → {status: "healthy", service: "product-service"}
GET  /api/products?page=1&per_page=20  → {items: Product[], meta: PaginationMeta}
GET  /api/products/:id          → ProductResponse (404: {detail: "Product not found"})
POST /api/products              → ProductResponse (201)
PUT  /api/products/:id          → ProductResponse (404: {detail: "Product not found"})
DELETE /api/products/:id        → 204 (404: {detail: "Product not found"})
```

### User Service (port 8012, internal 8002)

```
GET  /health                    → {status: "healthy", service: "user-service"}
GET  /api/users/:id             → UserResponse (404: {detail: "User not found"})
POST /api/users                 → UserResponse (201, 409: {detail: "Email already registered"})
GET  /api/sellers/:id           → SellerProfileResponse (404: {detail: "Seller profile not found"})
```

### Data Types

```typescript
// Product Service Types
type ProductStatus = 'draft' | 'active' | 'sold' | 'archived'

interface Category {
  id: number
  name: string
  slug: string
  parent_id: number | null
}

interface Product {
  id: number
  title: string
  description: string
  price: number
  image_url: string | null
  category_id: number | null
  category: Category | null
  seller_id: number
  status: ProductStatus
  created_at: string
  updated_at: string
}

interface ProductCreate {
  title: string
  description: string
  price: number
  image_url?: string
  category_id?: number
  seller_id: number
  status?: ProductStatus
}

interface ProductUpdate {
  title?: string
  description?: string
  price?: number
  image_url?: string
  category_id?: number
  status?: ProductStatus
}

interface PaginationMeta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

interface ProductListResponse {
  items: Product[]
  meta: PaginationMeta
}

// User Service Types
type UserRole = 'buyer' | 'seller' | 'admin'

interface SellerProfile {
  id: number
  user_id: number
  store_name: string
  description: string
  rating: number
}

interface User {
  id: number
  email: string
  name: string
  role: UserRole
  created_at: string
  seller_profile: SellerProfile | null
}

interface UserCreate {
  email: string
  name: string
  role?: UserRole
}
```

### Database Schemas

```sql
-- Product service (schema: products)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  price FLOAT NOT NULL,
  image_url VARCHAR(500),
  category_id INTEGER REFERENCES categories(id),
  seller_id INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User service (schema: users)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(20) DEFAULT 'buyer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  store_name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT '',
  rating FLOAT DEFAULT 0.0
);
```

---

## Phase 1: Delete Old Code

Delete everything under:
- `marketplace-app/backend/product-service/app/` (all Python files)
- `marketplace-app/backend/product-service/tests/` (all Python test files)
- `marketplace-app/backend/product-service/requirements.txt`
- `marketplace-app/backend/user-service/app/` (all Python files)
- `marketplace-app/backend/user-service/tests/` (all Python test files)
- `marketplace-app/backend/user-service/requirements.txt`
- `marketplace-app/frontend/src/` (all React/Next.js files)
- `marketplace-app/frontend/next.config.js`
- `marketplace-app/frontend/postcss.config.js`
- `marketplace-app/frontend/tailwind.config.ts`
- `marketplace-app/frontend/vitest.config.ts`
- `marketplace-app/frontend/tsconfig.json`
- `marketplace-app/frontend/package.json`

Keep: `docker-compose.yml`, `.github/`, `.cursor/rules/`, `.gitignore`, `README.md`, `tasks/`

---

## Phase 2: Backend — Product Service

**Path**: `marketplace-app/backend/product-service/`

Create these files:

### `package.json`
```json
{
  "name": "product-service",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/express": "^4.17.21",
    "@types/pg": "^8.10.9",
    "@types/cors": "^2.8.17",
    "tsx": "^4.7.0",
    "vitest": "^1.2.1",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src/**/*"]
}
```

### `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
})
```

### `Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 8001
CMD ["npx", "tsx", "src/index.ts"]
```

### `src/config.ts`
- Export DATABASE_URL (default: `postgresql://marketplace:marketplace@localhost:5432/marketplace`)
- Export DB_SCHEMA (default: `products`)
- Export PORT (default: 8001)
- Read all from process.env

### `src/database.ts`
- Create pg.Pool using DATABASE_URL
- Export `query(text, params)` helper
- Export `getPool()` for direct access
- Export `initDb()` that runs CREATE TABLE for categories + products (see SQL above)
- Set search_path to DB_SCHEMA in initDb

### `src/types.ts`
- All Product Service types from the contracts section above

### `src/routes/products.ts`
- Express Router
- `GET /` — paginated list (page, per_page query params, defaults 1 and 20)
  - COUNT query for total, then SELECT with JOIN on categories, OFFSET/LIMIT
  - Return `{items, meta}` matching ProductListResponse
- `GET /:id` — single product with category JOIN, 404 if not found
- `POST /` — validate required fields (title, price, seller_id), INSERT, return 201
- `PUT /:id` — partial update (only set provided fields), 404 if not found
- `DELETE /:id` — DELETE, 204 on success, 404 if not found

### `src/app.ts`
- Create Express app
- Add cors() and express.json() middleware
- Mount products router at `/api/products`
- Add `GET /health` → `{status: "healthy", service: "product-service"}`
- Export app (for testing)

### `src/index.ts`
- Import app, initDb, config
- Call initDb() then app.listen(PORT)

### `src/__tests__/products.test.ts`
6 tests using supertest against the Express app:
1. `test_list_products_empty` — GET /api/products returns empty items array
2. `test_create_product` — POST /api/products returns 201 with product data
3. `test_get_product_by_id` — GET /api/products/:id returns product
4. `test_get_product_not_found` — GET /api/products/999 returns 404
5. `test_list_products_with_data` — create 2 products, list returns both with correct pagination
6. `test_health_check` — GET /health returns healthy status

**Test database strategy**: Use a real test database or mock the database module. Simplest approach: create a test setup that initializes fresh tables in beforeEach and cleans up in afterEach. Use the same PostgreSQL (if available in Docker) or mock the query function.

---

## Phase 3: Backend — User Service

**Path**: `marketplace-app/backend/user-service/`

Identical structure to product service with these differences:
- `package.json` name: `user-service`
- `src/config.ts`: DB_SCHEMA=`users`, PORT=8002
- `src/database.ts`: CREATE TABLE for users + seller_profiles
- `src/types.ts`: User Service types from contracts above
- `src/routes/users.ts`: Express Router mounted at `/api`
  - `GET /users/:id` — user with LEFT JOIN on seller_profiles, 404 if not found
  - `POST /users` — check email uniqueness first (409 on duplicate), INSERT, 201
  - `GET /sellers/:id` — seller profile by user_id, 404 if not found
- `src/app.ts`: Mount at `/api`, health check
- `Dockerfile`: EXPOSE 8002
- 6 tests: create_user, get_by_id, not_found, duplicate_email, seller_not_found, health_check

---

## Phase 4: Frontend — Nuxt 3

**Path**: `marketplace-app/frontend/`

### `package.json`
```json
{
  "name": "marketplace-frontend",
  "private": true,
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "lint": "nuxt typecheck",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "nuxt": "^3.10.0",
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "@nuxtjs/tailwindcss": "^6.11.0",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "typescript": "^5.3.3",
    "vitest": "^1.2.1",
    "@vitejs/plugin-vue": "^5.0.3",
    "@vue/test-utils": "^2.4.3",
    "happy-dom": "^13.3.0"
  }
}
```

### `nuxt.config.ts`
- Modules: `@nuxtjs/tailwindcss`
- devServer port: 3000
- runtimeConfig: productServiceUrl, userServiceUrl (server-side), public versions (client-side)
- nitro routeRules: proxy /api/products/** and /api/users/** and /api/sellers/** to backend services

### `tailwind.config.ts`
- Same primary color palette (blue 50-900)
- Content: components, layouts, pages, composables, app.vue

### `vitest.config.ts`
- vue plugin, happy-dom environment, globals: true

### `Dockerfile`
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### Pages (Vue SFC)
- `app.vue` — layout with Header + NuxtPage
- `pages/index.vue` — home with featured products (useAsyncData + fetchProducts)
- `pages/products/index.vue` — listing with pagination
- `pages/products/[id].vue` — product detail
- `pages/sell.vue` — seller form (client-side state with ref())

### Components
- `components/Header.vue` — nav bar with NuxtLink (Browse, Sell, Sign In)
- `components/ProductCard.vue` — product card with image, title, price, category, seller info

### Composables
- `composables/useApi.ts` — $fetch-based API client: fetchProducts, fetchProduct, createProduct, fetchUser, fetchSellerProfile

### Types
- `types/index.ts` — same interfaces as defined in contracts above (shared between frontend and backend)

### Tests
- `__tests__/ProductCard.test.ts` — 6 tests with @vue/test-utils mount()

### Visual Design
The frontend should look the same as the current app:
- Gray-50 background
- Product cards in a responsive grid (1/2/3 columns)
- Each card shows: image (placeholder if none), title, price, category badge, seller info
- Navigation: logo "Marketplace", Browse link, Sell link, Sign In button
- Product detail page with full info
- Sell page with form: title, description, price, category dropdown, image URL, submit

---

## Phase 5: Docker + CI

### `marketplace-app/docker-compose.yml`
Update:
- Backend volumes: `./backend/product-service/src:/app/src` (not `/app/app`)
- DATABASE_URL format: `postgresql://...` (drop `+asyncpg` prefix)
- Frontend env vars: `NUXT_PUBLIC_PRODUCT_SERVICE_URL` and `NUXT_PUBLIC_USER_SERVICE_URL` (not `NEXT_PUBLIC_*`)
- Keep same ports: 3333:3000, 8011:8001, 8012:8002, 5433:5432

### `marketplace-app/.github/workflows/ci.yml`
All 3 jobs use Node.js 20:
- backend-product-service: npm ci → tsc --noEmit → npm test
- backend-user-service: npm ci → tsc --noEmit → npm test
- frontend: npm ci → npm run lint → npm test

### `marketplace-app/.gitignore`
Replace Python entries with:
```
node_modules/
.nuxt/
.output/
dist/
```

---

## Phase 6: CLAUDE.md

Create `marketplace-app/CLAUDE.md` with:
- Project overview (marketplace workshop app)
- Tech stack (Express.js + Nuxt 3 + PostgreSQL)
- Architecture diagram
- Service ports table
- Common commands (docker compose, test, dev)
- Database info (raw SQL, no ORM, pg library)
- Conventions (error format, TypeScript interfaces, imports at top)
- API contracts summary
- **Include the create-prd and generate-tasks workflow instructions** so Claude Code has them in context automatically (no need to read .mdc files)

---

## Phase 7: Workshop Materials Updates

All these files reference the old stack and need updating:

### Cursor Rules (2 files)
- `marketplace-app/.cursor/rules/create-prd.mdc` — Python+FastAPI+SQLAlchemy+Pydantic+Next.js → TypeScript+Express+raw SQL+Nuxt 3
- `marketplace-app/.cursor/rules/generate-tasks.mdc` — same replacements, update file path examples (.py → .ts)

### Templates (1 file)
- `day1/templates/generate-tasks.md` — "Use pytest to run backend tests" → "Use npx vitest run to run tests"

### Slides (3 .md files)
- `day1/slides/section-2-workflow.md`:
  - "Always use FastAPI for new services, pytest for tests" → "Always use Express.js for new services, vitest for tests"
  - "AI implements the Pydantic schema" → "AI implements the TypeScript interface"
- `day1/slides/section-3-setup.md`:
  - "FastAPI, port 8011/8012" → "Express.js, port 8011/8012"
  - "Next.js 14, port 3333" → "Nuxt 3, port 3333"
  - "pip install -r requirements.txt" → "npm install"

### Sample Outputs (8 files)
All 4 PRDs and 4 task lists need:
- Python code snippets → TypeScript
- SQLAlchemy models → raw SQL CREATE TABLE + TypeScript interfaces
- Pydantic schemas → TypeScript interfaces
- FastAPI routes → Express routes
- .py file paths → .ts file paths
- .tsx file paths → .vue file paths
- React hooks → Vue composables
- `frontend/src/app/` paths → `frontend/pages/` paths
- `frontend/src/components/*.tsx` → `frontend/components/*.vue`
- `backend/*/app/*.py` → `backend/*/src/*.ts`
- `tests/test_*.py` → `src/__tests__/*.test.ts`

### Guides (2 files)
- `day2/guides/ci-cd-integration.md` — ~14 FastAPI/pytest/Pydantic/Next.js references
- `day2/guides/30-day-roadmap.md` — stack references

### Facilitator Notes (1 file)
- `facilitator/facilitator-notes.md`:
  - "uvicorn app.main:app --reload" → "npx tsx src/index.ts"
  - "pytest" references → "npx vitest run"
  - "pip install" → "npm install"

### README (2 files)
- `marketplace-app/README.md` — full rewrite for new stack
- `workshop/README.md` — remove Python 3.11+ prerequisite

### HTML Slides (3 files)
- Regenerate all 3 HTML slide decks after updating the .md source files

---

## Phase 8: Verification

1. **Backend tests**: `cd backend/product-service && npm install && npm test` (6 pass)
2. **Backend tests**: `cd backend/user-service && npm install && npm test` (6 pass)
3. **Frontend tests**: `cd frontend && npm install && npm test` (6 pass)
4. **Docker**: `docker compose up --build` — all services healthy
5. **Manual check**: localhost:3333 loads, :8011/health responds, :8012/health responds
6. **Stale reference grep**:
   ```bash
   grep -rn "FastAPI\|SQLAlchemy\|Pydantic\|pytest\|uvicorn\|pip install\|requirements\.txt\|Next\.js\|React\|\.tsx\|\.jsx" workshop/ --include="*.md" --include="*.html" --include="*.yml" --include="*.mdc"
   ```
   Expected: zero Python/React references remain.

---

## Execution Strategy

Phases 2, 3, and 4 can run in parallel (no dependencies between them).
Then: Phase 5 (Docker/CI) → Phase 6 (CLAUDE.md) → Phase 7 (materials) → Phase 8 (verify).

For Phase 7, the sample outputs (8 files) are the most labor-intensive — they contain inline code that needs full rewriting from Python to TypeScript.
