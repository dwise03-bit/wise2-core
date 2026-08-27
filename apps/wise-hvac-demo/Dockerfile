# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/wise-hvac-demo ./apps/wise-hvac-demo
COPY packages ./packages

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the app
WORKDIR /app/apps/wise-hvac-demo
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy the traced standalone server and its static assets.
COPY --from=builder /app/apps/wise-hvac-demo/.next/standalone ./
COPY --from=builder /app/apps/wise-hvac-demo/.next/static ./.next/static
COPY --from=builder /app/apps/wise-hvac-demo/public ./public

# Environment
ENV NODE_ENV=production
ENV PORT=3024

EXPOSE 3024

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3024/wise-hvac-demo/signin || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
