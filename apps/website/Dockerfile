# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm with fixed version
RUN npm install -g pnpm@8.15.9

# Copy all files for workspace build
COPY . .

# Install dependencies - skip frozen lockfile and integrity check
RUN pnpm install --no-frozen-lockfile --strict-peer-dependencies=false 2>&1 || pnpm install --force --no-frozen-lockfile

# Build Next.js app
WORKDIR /app/apps/website
# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so the
# API origin must be present here (not just at runtime). Pass with:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.wise2.net ...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DASHBOARD_URL
ENV NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL
RUN pnpm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy built app from builder
COPY --from=builder /app/apps/website/.next/standalone ./
COPY --from=builder /app/apps/website/.next/static ./apps/website/.next/static
COPY --from=builder /app/apps/website/public ./apps/website/public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["apps/website/server.js"]
