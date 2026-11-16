# syntax=docker/dockerfile:1
# Web image for the VPS: the built SPA served by Caddy, which also proxies /api to the backend.
# Separate from the root Dockerfile (API image), so local development is not affected.
# Build from the repo root: docker build -f deploy/web.Dockerfile .

FROM node:24-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile --ignore-scripts --filter "web..."
# VITE_API_BASE_URL is not set: the browser calls /api on the same domain, which Caddy proxies.
# Staging only: a development build shows the email login form (import.meta.env.DEV). Remove for production.
ENV NODE_ENV=development
RUN pnpm --filter web build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/apps/web/dist /srv
