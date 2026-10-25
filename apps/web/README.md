# Color Bank Web

React single-page application built with Vite, TanStack Router and Query, Tailwind CSS, Base UI, and TypeScript. It includes the shade database interface, mapping previews, Color Bank requests, reports, data input, and user management screens. Some screens remain demos or previews; see `apps/api/README.md` for the API's current scope.

Run commands from the repository root.

## Development

```sh
pnpm install
cp .env.example .env
# Configure the required root environment values, then:
pnpm dev:web
```

The root `.env` is used by Vite. `WEB_HOST`, `WEB_PORT`, `API_URL`, and `VITE_API_BASE_URL` are required. The Vite development server proxies `/api` requests to `API_URL`. Do not create an `apps/web/.env` for the standard monorepo setup.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm --filter web dev` or `pnpm dev:web` | Start Vite |
| `pnpm --filter web build` | Type-check and create a production bundle |
| `pnpm --filter web typecheck` | Run TypeScript project checks |
| `pnpm --filter web lint` | Run Oxlint |
| `pnpm --filter web format` | Format web source with Biome |
| `pnpm --filter web format:check` | Check web source formatting |
| `pnpm --filter web preview` | Preview the production bundle |
| `pnpm --filter web test` | Run Playwright tests in `e2e/` |
| `pnpm --filter web test:ui` | Open Playwright UI mode |

The Playwright configuration starts the web dev server and uses Chromium. E2E tests are in `apps/web/e2e/`.

## Source layout

```text
src/
  components/           Shared layout, API, product, and UI components
  features/              Feature-specific code and planning notes
    auth/                Auth API, components, hooks, and user store
    color-database/      Color database notes
    my-mappings/         Mapping notes
    report/              Report notes
    shade-mapping/       Mapping notes
    user-management/     User management notes
  hooks/                 Shared data hooks
  lib/                   HTTP client, utilities, and local demo data
  pages/                 Page components
  routes/                TanStack Router route definitions and generated tree
  services/              API access helpers
  types/                 API types
```
