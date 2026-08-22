# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package files
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy app
COPY apps/getdown-demo ./apps/getdown-demo

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build
WORKDIR /app/apps/getdown-demo
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built app from builder
COPY --from=builder /app/apps/getdown-demo/.next ./.next
COPY --from=builder /app/apps/getdown-demo/public ./public
COPY --from=builder /app/apps/getdown-demo/package.json ./

# Install runtime dependencies only
RUN pnpm install --prod

ENV NODE_ENV=production
ENV PORT=3020
ENV HOSTNAME=0.0.0.0

EXPOSE 3020

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3020', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["pnpm", "start"]
