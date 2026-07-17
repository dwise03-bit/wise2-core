FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/admin ./apps/admin

RUN npm ci --workspaces

WORKDIR /app/apps/admin
RUN npm run build

FROM node:20-alpine

WORKDIR /app/apps/admin

RUN apk add --no-cache dumb-init curl

# Copy Next.js standalone build. The standalone output for a monorepo app
# preserves the nested structure (apps/admin/server.js inside the standalone tar).
# Extract from standalone/apps/admin/ directly to avoid double nesting.
COPY --from=builder /app/apps/admin/.next/standalone/apps/admin ./

# Copy monorepo node_modules to parent (needed for dependency resolution).
COPY --from=builder /app/apps/admin/.next/standalone/node_modules ../../node_modules

# Static and public assets must be in the same app directory structure.
COPY --from=builder /app/apps/admin/.next/static ./.next/static
COPY --from=builder /app/apps/admin/public ./public

EXPOSE 3000

# Docker sets HOSTNAME=<container-id>, which Next.js's standalone server.js
# reads and binds to literally, instead of 0.0.0.0. That leaves the app
# unreachable via localhost/127.0.0.1 from inside the container (only via
# its container-network IP), which fails Docker's own HEALTHCHECK even
# though the app is otherwise up and externally reachable through the
# published port.
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "server.js"]
