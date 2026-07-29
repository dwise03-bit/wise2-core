FROM node:20-slim AS base
RUN npm install -g pnpm@8

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/command-center/package.json ./apps/command-center/
RUN pnpm install --frozen-lockfile --filter @wise2/command-center...

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/command-center/node_modules ./apps/command-center/node_modules
COPY apps/command-center ./apps/command-center
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_LOGIN_URL
ARG NEXT_PUBLIC_BRAIN_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_LOGIN_URL=$NEXT_PUBLIC_LOGIN_URL
ENV NEXT_PUBLIC_BRAIN_API_URL=$NEXT_PUBLIC_BRAIN_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

WORKDIR /app/apps/command-center
RUN pnpm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/* && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/command-center/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/command-center/.next/static ./apps/command-center/.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "apps/command-center/server.js"]
