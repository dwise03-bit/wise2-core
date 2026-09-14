# WISE² Command Center - Production Deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY wise2-command-center/package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY wise2-command-center/ ./

# Build production bundle
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init and verify installation
RUN apk update && apk add --no-cache dumb-init && which dumb-init

# Copy from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Grant nextjs user permission to use dumb-init
RUN chmod +x /sbin/dumb-init

USER nextjs

EXPOSE 3006

# Use dumb-init to handle signals properly
ENTRYPOINT ["/sbin/dumb-init", "--"]

# Start Next.js production server
CMD ["npm", "start"]
