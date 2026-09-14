# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml ./

# Install pnpm using corepack (built-in to Node 16+)
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy app source
COPY apps/fergies-table ./apps/fergies-table
COPY packages ./packages

# Build app
WORKDIR /app/apps/fergies-table
RUN pnpm build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy built app from builder
COPY --from=builder /app/apps/fergies-table/.next ./.next
COPY --from=builder /app/apps/fergies-table/public ./public
COPY --from=builder /app/apps/fergies-table/package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Expose port
EXPOSE 3026

# Start server
CMD ["pnpm", "start"]
