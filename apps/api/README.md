# Color Bank API

REST API for Color Bank. It serves shade data, saves mappings, handles prototype requests and reports, imports Excel files, and controls who can do what.

Built with [Hono](https://hono.dev) on Node.js, PostgreSQL, and TypeScript.

> Part of the Color Bank monorepo. Run commands from the repository root unless noted.

## Tech Stack

| Purpose                 | Tool                                      |
| ----------------------- | ----------------------------------------- |
| Web framework           | Hono                                      |
| Validation and API docs | Zod, `@hono/zod-openapi`, Scalar          |
| Database                | PostgreSQL, Drizzle ORM (`packages/db`)   |
| Login and sessions      | Better Auth                               |
| Permissions             | Own permission matrix (`packages/shared`) |
| Logging                 | pino (JSON to stdout)                     |
| Metrics                 | prom-client                               |
| Build and tests         | tsup, Vitest, Biome                       |

## Getting Started

```bash
pnpm install
cp apps/api/.env.example apps/api/.env

docker compose up -d postgres   # start the database
pnpm db:migrate                 # create tables
pnpm db:seed                    # load dummy data
pnpm --filter api dev           # http://localhost:3000
```

| URL        | What it is                                                     |
| ---------- | -------------------------------------------------------------- |
| `/docs`    | Interactive API documentation                                  |
| `/health`  | Returns 200 if the process is running                          |
| `/ready`   | Returns 200 if the database is reachable                       |
| `/metrics` | Metrics for Prometheus (keep internal, do not expose publicly) |

## Environment Variables

All variables are checked at startup (`src/config/env.ts`). The API refuses to start if one is missing or invalid.

| Variable                                  | Description                                 |
| ----------------------------------------- | ------------------------------------------- |
| `NODE_ENV`                                | `development`, `test`, or `production`      |
| `PORT`                                    | HTTP port (default `3000`)                  |
| `LOG_LEVEL`                               | `debug`, `info`, `warn`, or `error`         |
| `DATABASE_URL`                            | PostgreSQL connection string                |
| `BETTER_AUTH_SECRET`                      | Secret used to sign sessions                |
| `BETTER_AUTH_URL`                         | Public base URL of this API                 |
| `OAUTH_ISSUER`                            | Identity provider URL                       |
| `OAUTH_CLIENT_ID` / `OAUTH_CLIENT_SECRET` | OAuth credentials                           |
| `ALLOWED_EMAIL_DOMAIN`                    | Only emails from this domain can sign in    |
| `WEB_ORIGIN`                              | Web app URL allowed to call this API (CORS) |

## Scripts

Run with `pnpm --filter api <script>`.

| Script      | Description                 |
| ----------- | --------------------------- |
| `dev`       | Start with auto-reload      |
| `build`     | Bundle to `dist/` with tsup |
| `start`     | Run the built server        |
| `test`      | Run tests                   |
| `lint`      | Check code style            |
| `typecheck` | Check types                 |

Database scripts (`db:migrate`, `db:seed`) live in `packages/db` and are available from the root.

## Project Structure

```
apps/api/
├── Dockerfile
├── tsconfig.json
└── src/
    ├── controllers/         # HTTP request/response handlers (pure functions)
    │   └── sample-item-controller.ts
    ├── services/            # Business logic and domain operations (pure functions)
    │   └── sample-item-service.ts
    ├── repositories/        # Database access and query operations (pure functions)
    │   └── sample-item-repository.ts
    ├── routes/              # Hono endpoint definitions and middleware wiring
    │   └── sample-item-routes.ts
    ├── models/              # TypeScript types, interfaces, and schemas
    │   └── sample-item.ts
    ├── middleware/          # CORS, authentication, error-handling middleware
    ├── config/              # Environment variables and app configuration
    └── index.ts             # Server bootstrap and HTTP server startup
```

Shared packages used by the API:

| Package                 | Used for                                               |
| ----------------------- | ------------------------------------------------------ |
| `packages/db`           | Table definitions, migrations, seed data               |
| `packages/shared`       | Zod schemas shared with the web app, permission matrix |
| `packages/color-engine` | HEX conversion and color classification                |

### Layered Architecture (Functional)

Data flow strictly follows a unidirectional layered model using pure functions:

```
Request -> Route -> Controller -> Service -> Repository -> Database
```

| Layer          | Responsibility                                            | Implementation Style               |
| -------------- | --------------------------------------------------------- | ---------------------------------- |
| `routes`       | Defines URL paths, HTTP verbs, and binds controllers      | Hono router definitions            |
| `controllers`  | Parses request context, invokes service, returns response | Async handler functions `(c) => {}`|
| `services`     | Core business logic, validations, calculations            | Async functions                    |
| `repositories` | Data persistence, database queries, ORM operations        | Async query functions              |
| `models`       | Type definitions, interfaces, domain entity shapes        | TypeScript interfaces & types      |

Calls only go one way: `routes -> controllers -> services -> repositories`. Components are written with functional composition without classes.

## How a Request Flows

```
request
  -> request-id, logger, session
  -> route: validate input, check permission
  -> service: apply business rules
  -> repository: query database
  -> service: shape the result for the user's role
  -> route: return JSON
```

If anything throws, `error-handler` turns it into a JSON response.

## Errors

Services throw errors from `core/errors.ts`. They never set HTTP status codes. One error handler converts them.

```ts
// in a service
if (!shade) throw new NotFoundError("SHADE_NOT_FOUND");
```

All error responses have the same shape:

```json
{ "error": { "code": "SHADE_NOT_FOUND" } }
```

The web app reads `code` to show the right message. Expected errors are logged as `warn`. Unexpected errors are logged as `error` and return `INTERNAL` with status 500.

## Permissions

- Login and sessions are handled by Better Auth.
- What a user may do is defined in the permission matrix in `packages/shared` (role -> list of permissions).
- Routes declare the permission they need (for example `shade:create`). Code checks permissions, not role names.
- Field-level rules (for example hiding color composition from some roles) are applied in the service, so hidden fields are never sent.
- Role changes are written to the audit log in the same database transaction as the change.

## Logging

- Logs are JSON, written to stdout with pino.
- Each request log includes `requestId`, `userId`, `method`, `path`, `status`, and `durationMs`.
- `authorization`, `cookie`, `password`, and `token` fields are masked.
- In Docker, a log collector reads container output and sends it to Loki. The API does not talk to Loki directly.
- The audit log is different: it is stored in the database, never deleted by log rotation, and shown in the admin UI.

## Adding a Module

1. Create `modules/<name>/` with the files listed above.
2. Add tables in `packages/db` and run a migration.
3. Create the repository and service in `container.ts`.
4. Mount the routes in `app.ts`.
5. Add any new permissions to `packages/shared` and write tests.

## Testing

| Kind       | What it checks                   | How                          |
| ---------- | -------------------------------- | ---------------------------- |
| Service    | Business rules                   | Fake repository, no database |
| Route      | Input, status codes, permissions | Hono `testClient`            |
| Repository | Real queries                     | PostgreSQL in Docker         |

```bash
pnpm --filter api test
```

## Docker

Build from the repository root:

```bash
docker build -f apps/api/Dockerfile -t color-bank-api .
docker run --env-file apps/api/.env -p 3000:3000 color-bank-api
```

The image runs as a non-root user and has a health check on `/health`. To run the full stack, including optional Loki, Grafana, and Prometheus:

```bash
docker compose up -d
docker compose --profile observability up -d
```
