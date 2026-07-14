# Production build for WISE² Website
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy root package files
COPY package.json package-lock.json ./
COPY apps/website ./apps/website
COPY packages ./packages

# Install all dependencies
RUN npm ci

# Build website only
RUN npm run build --filter='./apps/website'

# Production image
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl
RUN addgroup --gid 1001 --system nodejs && adduser --system nextjs --uid 1001

# Copy built website
COPY --from=builder /app/apps/website/.next/standalone ./
COPY --from=builder /app/apps/website/.next/static ./.next/static
COPY --from=builder /app/apps/website/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
