FROM node:20-alpine AS deps
WORKDIR /app/services/control-bridge
COPY services/control-bridge/package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app/services/control-bridge
COPY --from=deps /app/services/control-bridge/node_modules ./node_modules
COPY services/control-bridge/package*.json services/control-bridge/tsconfig.json services/control-bridge/vitest.config.ts ./
COPY services/control-bridge/src ./src
# Shared ops protocol is compiled in from source; it has no runtime dependencies.
COPY packages/ops-protocol/src /app/packages/ops-protocol/src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache docker-cli docker-cli-compose git curl coreutils && addgroup -S control && adduser -S control -G control
COPY --from=build /app/services/control-bridge/package*.json ./
COPY --from=build /app/services/control-bridge/node_modules ./node_modules
COPY --from=build /app/services/control-bridge/dist ./dist
USER control
EXPOSE 3099
CMD ["node", "dist/services/control-bridge/src/server.js"]
