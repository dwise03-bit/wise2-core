# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cherry-count ./apps/cherry-count
COPY packages ./packages

RUN corepack enable && corepack prepare pnpm@8.15.9 --activate && pnpm install --frozen-lockfile

WORKDIR /app/apps/cherry-count
ARG NEXT_PUBLIC_API_URL=https://api.wise2.net/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init wget

COPY --from=builder /app/apps/cherry-count/.next/standalone ./
COPY --from=builder /app/apps/cherry-count/.next/static ./.next/static
COPY --from=builder /app/apps/cherry-count/public ./public

ENV NODE_ENV=production
ENV PORT=3025
ENV HOSTNAME=0.0.0.0

EXPOSE 3025

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3025/cherry-count/api/health || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
