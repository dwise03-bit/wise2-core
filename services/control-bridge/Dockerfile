FROM node:20-alpine AS deps
WORKDIR /app
COPY services/control-bridge/package*.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY services/control-bridge/package*.json services/control-bridge/tsconfig.json services/control-bridge/vitest.config.ts ./
COPY services/control-bridge/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache docker-cli git curl coreutils && addgroup -S control && adduser -S control -G control
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER control
EXPOSE 3099
CMD ["node", "dist/server.js"]
