FROM node:20-alpine AS builder

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps/website ./apps/website
COPY apps/dashboard ./apps/dashboard

RUN npm install -g pnpm@8.15.9 && pnpm install --frozen-lockfile --recursive

WORKDIR /app/apps/dashboard
# NEXT_PUBLIC_* vars inline into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build

FROM node:20-alpine

WORKDIR /app/apps/dashboard

RUN apk add --no-cache dumb-init curl

COPY --from=builder /app/apps/dashboard/.next ./.next
COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder /app/apps/dashboard/node_modules ./node_modules
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/apps/dashboard/package.json ./package.json
COPY --from=builder /app/apps/dashboard/next.config.js ./next.config.js

# Create startup script without relying on Dockerfile heredoc parsing.
RUN printf '%s\n' \
  '#!/bin/sh' \
  'set -e' \
  'echo "Starting Next.js server..."' \
  'exec node ./node_modules/next/dist/bin/next start -p 3000 -H 0.0.0.0' \
  > /app/apps/dashboard/start.sh \
  && chmod +x /app/apps/dashboard/start.sh

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["/app/apps/dashboard/start.sh"]
