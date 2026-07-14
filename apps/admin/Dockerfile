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

COPY --from=builder /app/apps/admin/.next/standalone ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin/.next/static ./.next/static
COPY --from=builder /app/apps/admin/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

USER nobody
ENTRYPOINT ["dumb-init"]
CMD ["node", "server.js"]
