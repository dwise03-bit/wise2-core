FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin

RUN npm ci --workspaces

WORKDIR /app/apps/admin
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy standalone Next.js build
COPY --from=builder /app/apps/admin/.next/standalone /app

# Copy static files
COPY --from=builder /app/apps/admin/.next/static /app/.next/static
COPY --from=builder /app/apps/admin/public /app/public

# Copy node_modules for dependencies
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "/app/node_modules/.bin/next", "start", "-p", "3000"]
