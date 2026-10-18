# Color Bank

A web application for exploring, mapping, and managing lip product shades.

## Features

- **Color Database**: browse and filter thousands of shades by product format, with sorting, search, and multi-select.
- **Shade Mapping**: three-step wizard that generates an interactive map by season or color family, with zoom, photo toggle, custom axes, save, and export.
- **Product Detail**: shade info, benchmarks, ingredients, color composition, and similar shades.
- **My Mappings**: saved, pinned, and personal mappings.
- **Color Bank**: prototype requests with an approval workflow.
- **Reports and Data Input**: issue reporting, `.xlsx` import, and manual entry with automatic classification from HEX.
- **Administration**: user and role management, audit log, and configurable classification thresholds.
- **Role-based access control** enforced on the API, including field-level restrictions.

## Tech Stack

| Area          | Technology                                                      |
| ------------- | --------------------------------------------------------------- |
| Monorepo      | pnpm workspaces, Turborepo                                      |
| Web           | React, Vite, TanStack Router / Query / Table / Virtual, Zustand |
| UI            | shadcn/ui, Tailwind CSS                                         |
| Visualization | visx, d3                                                        |
| API           | Hono (Node.js), Zod, `@hono/zod-openapi`, Scalar                |
| Auth          | Better Auth (OAuth/SSO)                                         |
| Authorization | Custom RBAC (permission matrix in `packages/shared`)            |
| Database      | PostgreSQL, Drizzle ORM                                         |
| Search        | PostgreSQL full-text search, `pg_trgm`                          |
| Tooling       | TypeScript, Vitest, Biome, GitHub Actions, Docker Compose       |

## Prerequisites

- Node.js (current LTS)
- pnpm
- Docker (for local PostgreSQL)

## Getting Started

```bash
git clone https://github.com/<owner>/<repo>.git
cd color-bank
pnpm install

cp .env.example .env

pnpm docker:db             # start PostgreSQL
pnpm db:migrate            # apply migrations
pnpm db:seed               # load dummy data
pnpm dev                   # web :5173, api :3000
```

API documentation is served at `http://localhost:3000/docs`.

## Environment Variables

**`apps/api/.env`**

| Variable                                  | Description                              |
| ----------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                            | PostgreSQL connection string             |
| `BETTER_AUTH_SECRET`                      | Secret used to sign sessions             |
| `BETTER_AUTH_URL`                         | Public base URL of the API               |
| `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` | OAuth client credentials                 |
| `OAUTH_ISSUER`                            | OIDC issuer URL of the identity provider |
| `ALLOWED_EMAIL_DOMAIN`                    | Only emails from this domain can sign in |
| `WEB_ORIGIN`                              | Allowed CORS origin (web app URL)        |

**`apps/web/.env`**

| Variable       | Description         |
| -------------- | ------------------- |
| `VITE_API_URL` | Base URL of the API |

## Scripts

| Command            | Description                                            |
| ------------------ | ------------------------------------------------------ |
| `pnpm dev`         | Run web and API in watch mode                          |
| `pnpm build`       | Build all apps and packages                            |
| `pnpm test`        | Run unit and integration tests                         |
| `pnpm lint`        | Lint and format check                                  |
| `pnpm typecheck`   | Type-check all workspaces                              |
| `pnpm db:migrate`  | Apply database migrations                              |
| `pnpm db:seed`     | Seed dummy data                                        |
| `pnpm docker:db`   | Start PostgreSQL database container                    |
| `pnpm docker:up`   | Build and start all containers in background           |
| `pnpm docker:down` | Stop and remove all containers                         |
| `pnpm docker:logs` | Follow live container logs                             |

## Project Structure

```
apps/
  web/              React SPA
    ├── src/features/   Feature modules (shades, mapping, product-detail, color-bank, admin, imports)
    ├── src/components/ Shared UI components (shadcn/ui) and layout shell
    ├── src/routes/     TanStack Router route tree
    ├── src/stores/     Zustand client state (mapping canvas, active filters)
    ├── src/hooks/      Reusable custom React hooks
    └── src/lib/        HTTP client (Axios), TanStack Query client, utilities
  api/              Hono API (functional layered architecture)
    ├── src/controllers/  HTTP request/response handlers (pure functions)
    ├── src/services/     Business logic and domain operations
    ├── src/repositories/ Database access and queries
    ├── src/routes/       Hono router and route definitions
    └── src/models/       Data models and TypeScript interfaces
packages/
  db/               Drizzle schema, migrations, seed
  shared/           Zod schemas, types, permission matrix
  color-engine/     HEX conversion and color classification
  ui/               Shared UI components (shadcn/ui)
  config/           Shared tsconfig, Biome, Tailwind preset
```
