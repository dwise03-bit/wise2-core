# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.9

COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml ./

# Copy workspace packages needed for build
COPY packages/db/package.json ./packages/db/
COPY packages/ui-components/package.json ./packages/ui-components/

# Copy app package.json
COPY apps/fergies-table/package.json ./apps/fergies-table/

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy full source
COPY apps/fergies-table ./apps/fergies-table
COPY packages/db ./packages/db
COPY packages/ui-components ./packages/ui-components

# Re-link dependencies after copying source
RUN pnpm install --no-frozen-lockfile

# Build using pnpm filter
RUN pnpm --filter @wise2/fergies-table build

# Production image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Copy built app from builder
COPY --from=builder /app/apps/fergies-table/.next/standalone ./
COPY --from=builder /app/apps/fergies-table/.next/static ./apps/fergies-table/.next/static
COPY --from=builder /app/apps/fergies-table/public ./apps/fergies-table/public

EXPOSE 3026

CMD ["sh", "-c", "HOSTNAME=0.0.0.0 node apps/fergies-table/server.js"]
