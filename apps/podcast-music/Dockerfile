# Multi-stage build for Next.js app

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace files
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY apps/podcast-music ./apps/podcast-music

WORKDIR /app/apps/podcast-music

# Install dependencies
RUN npm install

# Build application
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy from builder
COPY --from=builder /app/apps/podcast-music/package.json .
COPY --from=builder /app/apps/podcast-music/package-lock.json .
COPY --from=builder /app/apps/podcast-music/.next .next
COPY --from=builder /app/apps/podcast-music/public ./public

# Install only production dependencies
RUN npm install --production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

USER nextjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3003/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

EXPOSE 3003
