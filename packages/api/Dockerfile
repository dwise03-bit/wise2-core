FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies needed for native modules
# (bcrypt, sqlite3, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY packages ./packages

# Install dependencies with legacy-peer-deps for compatibility
RUN npm install --legacy-peer-deps

WORKDIR /app/packages/api

# CRITICAL: Clean stale build cache to ensure JS files are emitted
# Without this, incremental TypeScript builds skip .js emission on Alpine
RUN rm -f tsconfig.tsbuildinfo

# Build the application
RUN npm run build

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

# Copy entire app and node_modules from builder
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages ./packages

EXPOSE 3001

CMD ["node", "dist/main"]
