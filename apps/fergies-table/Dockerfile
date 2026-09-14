# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm using corepack (built-in to Node 16+)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all packages and apps
COPY packages ./packages
COPY apps/fergies-table ./apps/fergies-table

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build app using monorepo filter
RUN pnpm build -F @wise2/fergies-table

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built app and dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/fergies-table ./apps/fergies-table
COPY --from=builder /app/pnpm-lock.yaml ./
COPY package.json ./

# Expose port
EXPOSE 3026

# Set working directory to app
WORKDIR /app/apps/fergies-table

# Start server
CMD ["pnpm", "start"]
