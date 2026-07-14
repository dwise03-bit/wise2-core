# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo files
COPY . .

# Install dependencies
RUN npm install --frozen-lockfile

# Build all apps
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve for static hosting and dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built artifacts from builder
COPY --from=builder /app/apps/studio/.next ./apps/studio/.next
COPY --from=builder /app/apps/website/.next ./apps/website/.next
COPY --from=builder /app/apps/dashboard/.next ./apps/dashboard/.next
COPY --from=builder /app/apps/admin/.next ./apps/admin/.next
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.next ./

# Copy public files
COPY --from=builder /app/apps/studio/public ./apps/studio/public
COPY --from=builder /app/apps/website/public ./apps/website/public
COPY --from=builder /app/apps/dashboard/public ./apps/dashboard/public
COPY --from=builder /app/apps/admin/public ./apps/admin/public

# Create startup script
RUN echo '#!/bin/sh\n\
exec dumb-init node /app/node_modules/.bin/next start -p ${PORT:-3000} --dir /app/apps/studio\n\
' > /app/start.sh && chmod +x /app/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3000}/ || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the studio app by default (port 3003)
ENV PORT=3003
ENV NODE_ENV=production

EXPOSE 3003

CMD ["node", "node_modules/.bin/next", "start", "-p", "3003", "--dir", "apps/studio"]
