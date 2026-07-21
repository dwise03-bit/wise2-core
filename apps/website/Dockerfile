# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* npm-shrinkwrap.json* ./
COPY apps/website/package.json ./apps/website/
COPY packages/ ./packages/

# Install dependencies with legacy-peer-deps for React 19/Next.js 14 compatibility
RUN npm install --legacy-peer-deps

# Copy source code
COPY apps/website ./apps/website
COPY packages ./packages

# Build Next.js app
WORKDIR /app/apps/website
# NEXT_PUBLIC_* vars are inlined into the client bundle at BUILD time, so the
# API origin must be present here (not just at runtime). Pass with:
#   docker build --build-arg NEXT_PUBLIC_API_URL=https://api.wise2.net ...
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_DASHBOARD_URL
ENV NEXT_PUBLIC_DASHBOARD_URL=$NEXT_PUBLIC_DASHBOARD_URL
RUN npm run build

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
