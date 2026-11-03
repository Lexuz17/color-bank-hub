# @color-bank-hub/contracts

Everything `apps/api` and `apps/web` must agree on, defined once.

**Rule:** if both apps need it, it lives here. If only one app needs it, it stays in that app.

## Files

One file per module. Import by path; there is no index file.

```ts
import { shadeInput, type Shade } from "@color-bank-hub/contracts/shade";
import { can } from "@color-bank-hub/contracts/rbac";
```

## What belongs here

- Zod schemas for request bodies, query strings and params.
- TypeScript types for API responses.
- Rules both sides must enforce identically: permissions, upload limits, error codes.

## What does not

- Database queries or Drizzle schema → `packages/db`.
- React components or hooks → `apps/web`.
- Node-only code (`node:*`, AWS SDK, env access) → `apps/api`. This package must run in the browser too.

## Conventions

- Schema `camelCase` (`shadeInput`), type `PascalCase` (`ShadeInput`) via `z.infer`.
- Input schemas use `.strict()` so unknown fields are rejected.
- `XxxQuery` is the parsed query; `XxxParams = z.input<typeof xxxQuery>` is what the web sends.
- Adding a module: create `src/<module>.ts`. The `"./*"` export makes it importable as `@color-bank-hub/contracts/<module>` with no other change.

## Build

None. Apps import the TypeScript source directly (tsup inlines it for the API, Vite for the web). `pnpm --filter @color-bank-hub/contracts typecheck` checks it.
