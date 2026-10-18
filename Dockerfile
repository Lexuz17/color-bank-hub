# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
RUN apk add --no-cache libc6-compat

FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo@^2
COPY . .
RUN turbo prune api --docker

FROM base AS builder
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY --from=pruner /app/out/full/ .
RUN pnpm --filter api build

FROM base AS prod-deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 hono

COPY --from=prod-deps --chown=hono:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=hono:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=hono:nodejs /app/package.json ./package.json
COPY --from=builder --chown=hono:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=hono:nodejs /app/apps/api/dist ./apps/api/dist

USER hono

EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

WORKDIR /app/apps/api

CMD ["node", "dist/index.js"]
