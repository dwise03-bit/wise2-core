FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY apps/studio ./apps/studio

RUN npm install --frozen-lockfile

WORKDIR /app/apps/studio
RUN npm run build

FROM node:20-alpine

WORKDIR /app/apps/studio

RUN apk add --no-cache dumb-init curl

# Copy built studio with full structure
COPY --from=builder /app/apps/studio/.next ./.next
COPY --from=builder /app/apps/studio/public ./public
COPY --from=builder /app/apps/studio/package.json ./

# Copy node_modules from root for workspace dependencies
COPY --from=builder /app/node_modules /app/node_modules

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3003/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", "/app/node_modules/.bin/next", "start", "-p", "3003"]
