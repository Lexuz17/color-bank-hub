# Color Bank Web

Frontend web application for Color Bank. It provides interfaces for browsing and searching shades, creating interactive shade mappings, submitting prototype requests, importing data, and administering roles.

Built with React 19, Vite, Tailwind CSS, TanStack Router & Query, and TypeScript.

> Part of the Color Bank monorepo. Run commands from the repository root unless noted.

## Tech Stack

| Purpose                 | Tool                                                  |
| ----------------------- | ----------------------------------------------------- |
| UI Framework            | React 19, Vite                                        |
| Routing                 | TanStack Router                                       |
| Server State & Caching  | TanStack Query                                        |
| Tables & Virtualization | TanStack Table, TanStack Virtual                      |
| Forms & Validation      | TanStack Form, Zod (`packages/shared`)                |
| Client State            | Zustand                                               |
| UI Components & Styling | shadcn/ui, Tailwind CSS                               |
| Data Visualization      | visx, d3                                              |
| HTTP Client             | Axios                                                 |
| Tooling & Quality       | TypeScript, Oxlint, Biome                             |

## Getting Started

```bash
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm --filter web dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

| Variable       | Description                                 | Default                 |
| -------------- | ------------------------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL of the backend API                 | `http://localhost:3000` |

## Scripts

Run with `pnpm --filter web <script>`.

| Script         | Description                             |
| -------------- | --------------------------------------- |
| `dev`          | Start Vite development server           |
| `build`        | Type-check and bundle for production    |
| `preview`      | Preview production build locally        |
| `typecheck`    | Run TypeScript type checking            |
| `lint`         | Run Oxlint                              |
| `format`       | Format code with Biome                  |
| `format:check` | Check code formatting with Biome        |

## Project Structure

```
apps/web/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/              # Static assets (images, icons, logos)
│   ├── components/          # Shared components across features
│   │   ├── layout/          # App shell, navbar, sidebar, page headers
│   │   └── ui/              # Base UI primitives (button, modal, dropdown, etc.)
│   ├── features/            # Feature-driven domain modules
│   │   ├── shades/          # Color database table, filters, search, multi-select
│   │   ├── mapping/         # 3-step wizard, interactive 2D map (visx/d3), export
│   │   ├── product-detail/  # Shade specs, composition, benchmarks, similar shades
│   │   ├── my-mappings/     # Saved, pinned, and personal mappings gallery
│   │   ├── color-bank/      # Prototype requests and approval workflows
│   │   ├── reports/         # Issue reporting and resolution
│   │   ├── imports/         # Excel upload, column mapping preview, commit
│   │   └── admin/           # User/role management, audit logs, thresholds
│   ├── hooks/               # Global utility hooks (use-debounce, use-media-query)
│   ├── lib/                 # Shared libraries (http-client, query-client, utils)
│   ├── routes/              # Application route definitions and page views
│   ├── stores/              # Zustand global client stores (mapping-canvas, active filters)
│   ├── types/               # App-level TypeScript type declarations
│   ├── App.tsx              # Root component & providers
│   ├── index.css            # Global styles and Tailwind directives
│   └── main.tsx             # Application bootstrap entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── .oxlintrc.json
```

### Inside a Feature Module

Features are modular and self-contained:

```
features/shades/
├── components/          # Feature-specific UI components
├── hooks/               # TanStack queries and mutations
├── services/            # API request functions
├── stores/              # Feature-specific Zustand store (if needed)
└── types/               # Local types and view models
```
