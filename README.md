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
| UI            | Base UI, Tailwind CSS                                           |
| API           | Hono (Node.js), Zod                                             |
| Auth          | Better Auth (Google OAuth)                                     |
| Database      | PostgreSQL, Drizzle ORM                                         |
| Tooling       | TypeScript, Oxlint, Biome, Playwright, Docker Compose           |

## Prerequisites

- Node.js (22 or newer)
- pnpm 10.14.0
- Docker (for local PostgreSQL)

## Getting Started

```bash
pnpm install
cp .env.example .env
# Set POSTGRES_PASSWORD and BETTER_AUTH_SECRET in .env.
pnpm docker:db             # start PostgreSQL
pnpm db:migrate             # apply migrations
pnpm db:seed                # load development data
pnpm dev                    # start web and API
```

The web app runs at the configured `WEB_HOST` and `WEB_PORT` (defaults to `127.0.0.1:5173`). The API listens on `APP_PORT` (default `3000`). API documentation is served at `/docs`.

## Environment Variables

Copy the root `.env.example` to `.env`. Both apps read their configuration from this root file.

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for host commands |
| `BETTER_AUTH_SECRET` / `BETTER_AUTH_URL` | Better Auth session secret and public API URL |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials (optional in development; required otherwise) |
| `ALLOWED_EMAIL_DOMAIN` | Email domain allowed to sign in |
| `WEB_ORIGIN` | Allowed web app origin for CORS |
| `API_URL` | API target used by the Vite `/api` proxy |
| `WEB_HOST` / `WEB_PORT` | Vite bind address and port |
| `VITE_API_BASE_URL` | Browser API base path, normally `/api` |
| `POSTGRES_*` | Local PostgreSQL settings; see `.env.example` for each variable |

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run web and API in watch mode |
| `pnpm build` | Build workspace packages and apps |
| `pnpm test` | Run workspace tests |
| `pnpm lint` | Run Oxlint for the web workspace |
| `pnpm format` | Format repository files with Biome |
| `pnpm typecheck` | Type-check configured workspaces |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed development data |
| `pnpm docker:db` / `pnpm docker:db:down` | Start or stop the PostgreSQL container |
| `pnpm docker:db:logs` | Follow PostgreSQL logs |

## Project Structure

```
apps/
  web/                 React SPA
    src/components/    Shared UI and layout components
    src/features/      Auth and feature-specific modules/notes
    src/hooks/         Shared data hooks
    src/lib/           HTTP client, utilities, and demo data
    src/pages/         Page components
    src/routes/        TanStack Router route tree
  api/                 Hono API (layered architecture)
    src/controllers/   HTTP request/response handlers
    src/services/      Business logic and domain operations
    src/repositories/  Database access and queries
    src/routes/        Hono route definitions
    src/models/        API model types
packages/
  contracts/           Shared API contracts and Zod schemas
  db/                  Drizzle schema, migrations, and seed
  shared/              Shared TypeScript package
```

See [apps/api/README.md](apps/api/README.md) for API endpoints and workflow details, and [apps/web/README.md](apps/web/README.md) for web-specific commands and structure.
