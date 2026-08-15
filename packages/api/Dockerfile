FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies needed for native modules
# (bcrypt, sqlite3, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages

# Install pnpm and dependencies for entire monorepo
RUN npm install -g pnpm && pnpm install --frozen-lockfile --recursive

WORKDIR /app/packages/api

# CRITICAL: Clean stale build cache to ensure JS files are emitted
# Without this, incremental TypeScript builds skip .js emission on Alpine
RUN rm -f tsconfig.tsbuildinfo

# Build the application
RUN pnpm run build

# Verify that JavaScript files were generated (not just .d.ts files)
RUN if [ ! -f dist/main.js ]; then \
      echo "ERROR: Build failed! No main.js file generated."; \
      echo "Contents of dist/:"; \
      ls -la dist/ || echo "dist/ directory not found"; \
      exit 1; \
    fi

FROM node:20-slim

WORKDIR /app

# Install runtime dependencies (curl for health checks)
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Copy monorepo structure
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages

# Install pnpm and all dependencies (Prisma needs generation)
RUN npm install -g pnpm && pnpm install --frozen-lockfile --recursive

# Generate Prisma client
RUN cd packages/db && npx prisma generate --schema=prisma/schema.prisma

# Copy compiled dist from builder
COPY --from=builder /app/packages/api/dist ./packages/api/dist

EXPOSE 3001

CMD ["node", "packages/api/dist/main"]
