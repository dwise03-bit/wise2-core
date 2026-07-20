# Production build for WISE² Website (build context: project root)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# Copy website only - no need to copy packages for frontend build
COPY apps/website ./apps/website

# Build the website
WORKDIR /app/apps/website
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app/apps/website

RUN apk add --no-cache dumb-init curl

# Copy built artifacts from builder
COPY --from=builder /app/apps/website/.next/standalone/apps/website/server.js ./server.js
COPY --from=builder /app/apps/website/.next/standalone/node_modules ./node_modules
COPY --from=builder /app/apps/website/public ./public
COPY --from=builder /app/apps/website/package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "server.js"]
