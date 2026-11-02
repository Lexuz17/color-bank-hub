# Color Bank API

Hono REST API backed by the existing PostgreSQL/Drizzle schema. This first pass covers Color Database, Report, Data Input, and Color Bank. The Color Database, Report, Data Input, and Color Bank pages use these endpoints through the Vite `/api` proxy and TanStack Query. The component showcase and mapping previews remain independent demo screens.

Better Auth handles Google sign-in (plus email/password in development). Every `/api/*` route except `/api/auth/*` requires an active, signed-in user with a role, and write routes enforce the shared permission matrix (see [Access control](#access-control)). Reports, prototypes, decisions, and audit records are attributed to the signed-in user. User-management endpoints are not implemented yet; the web screen is not backed by the API.

## Development

Use the existing root Turbo commands:

```bash
pnpm dev:api
pnpm build
pnpm typecheck
pnpm test
pnpm db:migrate
```

Workspace packages (`@color-bank-hub/db`, `@color-bank-hub/contracts`) are consumed as TypeScript source, so no prebuild is needed; `tsup` bundles them into `dist`. Local scripts load the root `.env` with Node's `--env-file-if-exists`, and `src/env.ts` validates it with zod at startup. `DATABASE_URL` must point to the Docker database's published localhost port when running on the host; Docker Compose supplies its own internal database URL to containers. Keep database credentials in `.env`.

Network settings live in the root `.env` (see `.env.example`):

- `HOST`, `PORT`: API bind address and port (defaults `0.0.0.0`, `3000`; Compose forces `HOST=0.0.0.0`).
- `API_URL`: Vite's backend proxy target.
- `WEB_HOST`, `WEB_PORT`: Vite's bind address and port. Keep `WEB_HOST` and `WEB_ORIGIN` on the same host, since `localhost` and `127.0.0.1` are different origins for Better Auth.
- `VITE_API_BASE_URL`: browser request base, normally `/api` for the same-origin proxy.
- `WEB_ORIGIN`: allowed CORS and Better Auth origin.
- `POSTGRES_BIND_HOST`, `POSTGRES_PORT`: Docker PostgreSQL's published address and port. `POSTGRES_CONTAINER_PORT` controls its internal listening port.

Health: `GET /health` (public). Restart the dev processes after changing `.env`.

## Endpoints

All resource paths below begin with `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/me` | The signed-in user (`id`, `email`, `name`, `role`) |
| GET | `/brands` | Brand lookup |
| POST | `/brands` | Create a brand; `{name, isOwn?}` |
| GET | `/product-formats` | Categories with nested format items and actual shade counts |
| POST | `/product-formats` | Add a format/subcategory using `{name, items:[{name, code}]}` |
| GET | `/products` | Product lookup, capped at 1,000 records |
| POST | `/products` | Create a product with brand, format, and ingredients |
| GET | `/shades` | Search, filter, sort, and paginate shades |
| GET | `/shades/:id` | Shade, product, brand, and format details |
| POST | `/shades` | Manual shade entry with computed color metrics |
| PATCH | `/shades/:id` | Update supported shade fields; recompute metrics when HEX changes |
| POST | `/imports/preview` | Validate rows and references without writing |
| POST | `/imports/commit` | Revalidate and insert all rows in one transaction |
| GET, POST | `/reports` | List or submit reports |
| GET, PATCH | `/reports/:id` | Read a report or update its status |
| GET, POST | `/prototype-requests` | List or create Color Bank requests |
| GET | `/prototype-requests/:id` | Request details |
| PATCH | `/prototype-requests/:id/status` | Approve, decline, start formulation, or complete |
| PATCH | `/prototype-requests/:id/formulation` | Save formulation data while formulating |

Request and response schemas live in `packages/contracts/src/<module>.ts` and are shared with the web app.

Create products using `{brandId, formatItemId, name, ingredientsInci, baseType?}`. Product formats use database records. Data Input includes explicit format, brand, and product creation controls for an empty database. Creating a subcategory under an existing parent name reuses that parent; duplicate names/codes return a conflict.

Lists for shades, reports, and requests return:

```json
{"data":{"items":[],"pagination":{"page":1,"pageSize":25,"total":0}}}
```

Other successful responses return `{data: ...}`. Creation returns HTTP 201. Lists accept `page` and `pageSize` (1–100).

Shade filters: `search` (shade/SKU/product/brand), `brandId`, `formatItemId`, `season`, `undertone`, `colorFamily`. Sorting: `sort=name|sku|createdAt|hue|lightness`, `direction=asc|desc`. Report filters: `status=pending|resolved`. Request filters: `status` and `formatItemId`. Enum values are lowercase.

## Data input

Manual entry body:

```json
{
  "productId": "UUID-from-products",
  "sku": "EMINA-JELLY-08",
  "name": "08 Ube Mochi",
  "hex": "#aa6d78"
}
```

Optional shade fields: `mayContain`, `lipPhotoUrl`, `swatchPhotoUrl`, and `composition` (`[{name, percentage}]`, own brands only). Images currently use HTTP/HTTPS URLs; binary upload/storage is not implemented.

Import body: `{rows: [/* manual-entry records */]}`, 1–500 rows, up to 2 MB total. Parse spreadsheet/TSV content into these records before calling the endpoint. XLSX file parsing is not included yet. Preview returns row numbers, normalized data, validation errors, and valid-row counts. Commit rejects the entire batch if any row fails; duplicate SKUs are rejected both within a batch and against the database. Database constraints still protect against concurrent duplicate commits.

HEX calculates RGB, HSL, HSV, CIE Lab, and LCh (sRGB, D65). Season, undertone, and business categories are left unclassified until business rules are configured. Editing HEX clears previous classifications to avoid stale values. External-product composition is rejected on writes and omitted on reads. Own-brand composition is also omitted for roles without `shade:viewComposition`.

## Reports

Submit `{description, brandId?, shadeId?, attachmentUrls?, priority?}`. Description requires 10–20,000 characters; priority is `low|medium|high`. If both brand and shade are supplied, their relationship is validated. Update with `{status: "resolved"}` or `{status: "pending"}`. Resolution records its timestamp and the signed-in user; reopening clears those fields. Status changes are audited.

## Color Bank workflow

Create:

```json
{
  "type": "gap_filling",
  "priority": "medium",
  "brandNameNew": "Emina",
  "productNameNew": "Jelly Stain",
  "shadeNameNew": "Rosewood",
  "targetHex": "#aa6d78",
  "formatItemId": 1,
  "description": "Fill a gap in the current shade range."
}
```

`type`: `gap_filling|benchmark_matching`; optional `targetSeason`: `spring|summer|autumn|winter`. Format ID must exist.

Allowed transitions:

```text
pending -> approved -> formulating -> completed
pending -> declined
```

Decline requires `declineReason`. Approval allocates a format-specific sequence and name inside a transaction with an advisory lock. Invalid or repeated transitions return 409. Status changes are audited in the same transaction.

Formulation fields: `baseType`, `ingredientsInci`, `mayContain`, `composition`, `resultPhotoUrl`, `deltaE`, `resultNotes`. Completion requires a saved result photo URL. API status `completed` corresponds to the UI's “Result uploaded”; it does not automatically create a master shade. Promotion into the catalog is not implemented yet.

## Access control

Who can do what is defined once in `packages/contracts/src/rbac.ts`; the API enforces it with `requirePermission()` on routes, and the web uses the same `can()` to hide actions. Reading data only requires an active account.

| Permission | Routes | Roles |
| --- | --- | --- |
| `catalog:write` | `POST /brands`, `/product-formats`, `/products`, `/shades`, `/imports/*`; `PATCH /shades/:id` | website_admin, rnd |
| `shade:viewComposition` | Field-level: `composition` in shade responses | website_admin, rnd, tsi |
| `report:create` | `POST /reports` | all roles |
| `report:resolve` | `PATCH /reports/:id` | website_admin, rnd |
| `prototype:create` | `POST /prototype-requests` | website_admin, pid, tsi |
| `prototype:process` | `PATCH /prototype-requests/:id/status`, `/formulation` | website_admin, rnd |
| `user:manage` | Web user-management screen (no API yet) | website_admin |

To change access, edit the role list in `rbac.ts`. To add a capability, add a `<resource>:<action>` key there and reference it with `requirePermission()` and `useCan()`.

## Validation and errors

Unknown write fields are rejected. UUIDs, HEX values, URLs, pagination, percentage totals, and state transitions are validated. Errors return:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","requestId":"b1f0…","issues":[{"path":"hex","message":"Use a six-digit HEX code"}]}}
{"error":{"code":"NOT_FOUND","reason":"SHADE_NOT_FOUND","message":"Shade not found","requestId":"b1f0…"}}
```

- `code` is general and maps 1:1 to the HTTP status. The list lives in `errorStatus` in `packages/contracts/src/common.ts`. Branch on it in the client.
- `reason` is optional and names the specific cause. Use it for specific UI handling.
- `requestId` equals the `X-Request-Id` response header and the server log entry for 500 errors.
- `issues` appears only with `VALIDATION_ERROR`.

| `code` | HTTP | `reason` values |
|---|---|---|
| `BAD_REQUEST` | 400 | `INVALID_JSON` |
| `UNAUTHORIZED` | 401 | — |
| `FORBIDDEN` | 403 | `ACCOUNT_INACTIVE`, `MISSING_PERMISSION` |
| `NOT_FOUND` | 404 | `ROUTE_NOT_FOUND`, `SHADE_NOT_FOUND`, `REPORT_NOT_FOUND`, `REQUEST_NOT_FOUND` |
| `CONFLICT` | 409 | `UNIQUE_VIOLATION`, `INVALID_TRANSITION`, `NOT_FORMULATING` |
| `PAYLOAD_TOO_LARGE` | 413 | — |
| `VALIDATION_ERROR` | 422 | — (see `issues`) |
| `BUSINESS_RULE` | 422 | `INVALID_PRODUCT`, `EXTERNAL_COMPOSITION`, `BRAND_SHADE_MISMATCH`, `RESULT_REQUIRED`, `IMPORT_INVALID`, `INVALID_REFERENCE` |
| `INTERNAL` | 500 | — |

Throw with `fail(code, message, reason?)` from `src/core/errors.ts`. Internal SQL and credentials are not sent to clients.

## Tests

`pnpm test` runs validation, color conversion, permission, and Hono route tests through Turbo. Route tests inject a user with `createApp({ resolveUser })` instead of a real session. Database integration tests run only when `TEST_DATABASE_URL` is explicitly supplied to the Turbo test task. Use a development Docker database: tests create uniquely named fixture rows and clean up only their own records. Existing schema/migrations must be applied first. Database integration tests are not cached.

## Structure

`routes (paths + permission guards) -> controllers (HTTP + input validation) -> services (business rules, typed input) -> repositories (SQL) -> PostgreSQL`. Only controllers touch Hono's `Context`; services and repositories never see `unknown` input. Transaction-dependent workflow checks stay beside the locked database updates. User-management API endpoints remain future work.
