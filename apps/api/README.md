# Color Bank API

Hono REST API backed by the existing PostgreSQL/Drizzle schema. This first pass covers Color Database, Report, Data Input, and Color Bank. The Color Database, Report, Data Input, and Color Bank pages use these endpoints through the Vite `/api` proxy and TanStack Query. The component showcase and mapping previews remain independent demo screens.

Authentication and user management are deferred. The server reads its bind address from `HOST` and refuses production startup until authentication is implemented. Reports, prototypes, decisions, and audit records use a database placeholder identity with a randomly generated UUID, a disabled account, and no role. Existing NOT NULL constraints and foreign keys remain intact. This identity does not authenticate requests.

## Development

Use the existing root Turbo commands:

```bash
pnpm dev:api
pnpm build
pnpm typecheck
pnpm test
pnpm db:migrate
```

Turbo builds the database package before dependent API tasks. No extra prebuild/predev commands are needed. `DATABASE_URL` must point to the Docker database's published localhost port when running on the host; Docker Compose supplies its own internal database URL to containers. Keep database credentials in `.env`.

Network settings live in the root `.env` (see `.env.example`):

- `HOST`: API bind address; `APP_PORT`: API port (`PORT` may override it in containers).
- `API_URL`: Vite's backend proxy target and the container health-check base URL.
- `WEB_HOST`, `WEB_PORT`: Vite's bind address and port.
- `VITE_API_BASE_URL`: browser request base, normally `/api` for the same-origin proxy.
- `WEB_ORIGIN`: allowed CORS origin.
- `POSTGRES_BIND_HOST`, `POSTGRES_PORT`: Docker PostgreSQL's published address and port. `POSTGRES_CONTAINER_PORT` controls its internal listening port.
- `API_CONTAINER_HOST`: API bind address inside Docker.

Required settings have no hardcoded runtime address defaults. Health: `GET /health`. Restart the dev processes after changing `.env`.

## Endpoints

All resource paths below begin with `/api`.

| Method | Path | Purpose |
| --- | --- | --- |
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

HEX calculates RGB, HSL, HSV, CIE Lab, and LCh (sRGB, D65). Season, undertone, and business categories are left unclassified until business rules are configured. Editing HEX clears previous classifications to avoid stale values. External-product composition is rejected on writes and omitted on reads.

## Reports

Submit `{description, brandId?, shadeId?, attachmentUrls?, priority?}`. Description requires 10–20,000 characters; priority is `low|medium|high`. If both brand and shade are supplied, their relationship is validated. Update with `{status: "resolved"}` or `{status: "pending"}`. Resolution records its timestamp and the placeholder actor; reopening clears those fields. Status changes are audited.

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

## Validation and errors

Unknown write fields are rejected. UUIDs, HEX values, URLs, pagination, percentage totals, and state transitions are validated. Errors return:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","issues":[{"path":"hex","message":"Use a six-digit HEX code"}]}}
```

HTTP 400: malformed JSON; 404: missing resource; 409: unique constraint or workflow conflict; 413: body too large; 422: invalid input or reference; 500: unexpected failure. Internal SQL and credentials are not sent to clients.

## Tests

`pnpm test` runs validation, color conversion, and Hono route tests through Turbo. Database integration tests run only when `TEST_DATABASE_URL` is explicitly supplied to the Turbo test task. Use a development Docker database: tests create uniquely named fixture rows and clean up only their own records. Existing schema/migrations must be applied first. Database integration tests are not cached.

## Structure

`routes -> controllers -> services -> repositories -> PostgreSQL`. Transaction-dependent workflow checks stay beside the locked database updates. No authentication endpoints or user-management endpoints are added.
