# Production build for WISE² Website (build context: project root)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo files (paths relative to build context root)
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/website ./apps/website

# Install all dependencies
RUN npm ci

# Build website only (cd into website to avoid turbo loop)
RUN cd apps/website && npm run build

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
