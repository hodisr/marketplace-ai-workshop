# Marketplace App

A microservices-based marketplace application built with Nuxt 3 and Express.js. This project serves as the sandbox environment for the AI Development Workshop.

## Architecture

```
marketplace-app/
  frontend/          -> Nuxt 3 (Vue 3, TypeScript, Tailwind CSS)
  backend/
    product-service/ -> Express.js (TypeScript, raw SQL with pg)
    user-service/    -> Express.js (TypeScript, raw SQL with pg)
  docker-compose.yml -> Local dev orchestration
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3333 | Nuxt 3 app with SSR product pages |
| Product Service | 8011 | Product CRUD, categories |
| User Service | 8012 | User accounts, seller profiles |
| PostgreSQL | 5433 | Single DB, separate schemas per service |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 20+ (for local development)

### Run with Docker Compose

```bash
docker compose up --build
```

This starts all services. The frontend is available at http://localhost:3333.

### Run services individually

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

**Product Service:**

```bash
cd backend/product-service
npm install
npx tsx src/index.ts
```

**User Service:**

```bash
cd backend/user-service
npm install
npx tsx src/index.ts
```

### Running Tests

**Backend:**

```bash
cd backend/product-service
npm test

cd backend/user-service
npm test
```

**Frontend:**

```bash
cd frontend
npm test
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://marketplace:marketplace@postgres:5432/marketplace | Postgres connection string |
| NUXT_PRODUCT_SERVICE_URL | http://product-service:8001 | Internal URL for product service |
| NUXT_USER_SERVICE_URL | http://user-service:8002 | Internal URL for user service |
