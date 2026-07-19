# Production build for WISE² Website (build context: project root)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy monorepo files (paths relative to build context root)
COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/website ./apps/website

# Install all dependencies with workspace support
RUN npm install --frozen-lockfile

# Build website only (cd into website to avoid turbo loop)
RUN cd apps/website && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app/apps/website

RUN apk add --no-cache dumb-init curl

# Copy built website with full structure
COPY --from=builder /app/apps/website/.next ./.next
COPY --from=builder /app/apps/website/public ./public
COPY --from=builder /app/apps/website/package.json ./
# Copy node_modules from root for workspace dependencies
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "/app/node_modules/.bin/next", "start"]
