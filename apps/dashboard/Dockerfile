FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/website ./apps/website
COPY apps/dashboard ./apps/dashboard

RUN npm ci --workspaces

WORKDIR /app/apps/dashboard
RUN npm run build

FROM node:20-alpine

WORKDIR /app/apps/dashboard

RUN apk add --no-cache dumb-init curl

COPY --from=builder /app/apps/dashboard/.next ./.next
COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/apps/dashboard/package.json ./package.json
COPY --from=builder /app/apps/dashboard/next.config.js ./next.config.js

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "/app/node_modules/.bin/next", "start"]
