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
├── tsup.config.ts
└── src/
    ├── server.ts            # starts the server, shuts down cleanly
    ├── app.ts               # creates the Hono app, mounts all modules
    ├── container.ts         # creates repositories and services, passes them to routes
    ├── config/
    │   └── env.ts           # reads and validates environment variables
    ├── core/                # shared code, no business rules
    │   ├── errors.ts        # AppError and its subclasses (NotFound, Forbidden, ...)
    │   ├── logger/          # pino setup and sensitive-field masking
    │   ├── authz/           # authorize(user, permission)
    │   ├── audit/           # writes audit log entries
    │   └── http.ts          # AppEnv type (user, requestId, logger on the context)
    ├── middleware/          # request-id, request-logger, session, error-handler,
    │                        # cors, secure-headers, rate-limit, metrics
    └── modules/
        ├── auth/            # login, sessions, email domain check, first-login role
        ├── users/           # roles, role approval, audit log of role changes
        ├── shades/          # list, filter, search, detail, similar shades
        ├── mappings/        # generate, save, pin, delete mappings
        ├── color-bank/      # prototype requests and their workflow
        ├── reports/         # submit and resolve reports
        ├── imports/         # Excel upload, column mapping, preview, commit
        ├── classification/  # classification thresholds (admin)
        └── health/          # /health, /ready, /metrics
```

Shared packages used by the API:

| Package                 | Used for                                               |
| ----------------------- | ------------------------------------------------------ |
| `packages/db`           | Table definitions, migrations, seed data               |
| `packages/shared`       | Zod schemas shared with the web app, permission matrix |
| `packages/color-engine` | HEX conversion and color classification                |

### Inside a module

Every module has the same files:

```
modules/shades/
├── shades.routes.ts       # HTTP endpoints
├── shades.schema.ts       # request and response shapes (Zod)
├── shades.service.ts      # business rules
├── shades.repository.ts   # database queries
├── shades.model.ts        # types and small pure functions
├── shades.errors.ts       # optional: errors specific to this module
└── __tests__/
```

| File         | Does                                              | Does not                          |
| ------------ | ------------------------------------------------- | --------------------------------- |
| `routes`     | Read input, call the service, return the response | Contain business rules or SQL     |
| `service`    | Apply business rules, throw errors                | Know about HTTP or SQL            |
| `repository` | Read and write the database                       | Contain business rules            |
| `model`      | Define types, field-level rules per role          | Import anything from other layers |

Calls only go one way: `routes -> service -> repository`. A service receives its repository as an argument, so tests can pass in a fake one.

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
