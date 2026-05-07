FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10 --activate
WORKDIR /app

# --- deps: install all dependencies ---
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/server/package.json apps/server/package.json
RUN pnpm install --frozen-lockfile --ignore-scripts

# --- builder: build and deploy ---
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY . .
RUN pnpm --filter server build
RUN pnpm deploy --filter server --prod --legacy --ignore-scripts /deployed

# --- runner: production image ---
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /deployed/node_modules ./node_modules
COPY --from=builder /app/apps/server/dist ./dist

USER nestjs
EXPOSE 4000
CMD ["node", "dist/main.js"]
