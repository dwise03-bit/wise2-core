# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* npm-shrinkwrap.json* ./
COPY apps/website/package.json ./apps/website/
COPY packages/ ./packages/

# Install dependencies
RUN npm install -g pnpm 2>/dev/null || true
RUN npm ci || npm install

# Copy source code
COPY apps/website ./apps/website
COPY packages ./packages

# Build Next.js app
WORKDIR /app/apps/website
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy built app from builder
COPY --from=builder /app/apps/website/.next/standalone ./
COPY --from=builder /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=builder /app/apps/website/public ./apps/website/public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["apps/website/server.js"]
