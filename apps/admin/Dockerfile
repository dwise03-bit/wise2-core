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

# Copy standalone Next.js build. Because apps/admin is an npm workspace,
# Next.js's standalone output preserves the monorepo path, landing the
# server entrypoint at /app/apps/admin/server.js (NOT /app/server.js).
COPY --from=builder /app/apps/admin/.next/standalone ./

# Static and public assets must be copied into that same nested path,
# since server.js resolves them relative to its own directory.
COPY --from=builder /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=builder /app/apps/admin/public ./apps/admin/public

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
CMD ["node", "apps/admin/server.js"]
