# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy app source
COPY . .

# Build the app
RUN pnpm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm in production container
RUN npm install -g pnpm

# Copy built app from builder (full monorepo structure needed)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/prompt-shop ./apps/prompt-shop
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Navigate to app and start
WORKDIR /app/apps/prompt-shop
CMD ["pnpm", "start"]
