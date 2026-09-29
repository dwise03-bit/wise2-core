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
COPY packages/ops-protocol/package.json /app/packages/ops-protocol/package.json
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache docker-cli docker-cli-compose git curl coreutils && addgroup -S control && adduser -S control -G control
COPY --from=build /app/services/control-bridge/package*.json ./
COPY --from=build /app/services/control-bridge/node_modules ./node_modules
COPY --from=build /app/services/control-bridge/dist ./dist
# The compiled bridge keeps relative imports to the shared protocol runtime
# (../../../packages/ops-protocol/src/*.js). Copy the compiled modules to that
# runtime path; raw TypeScript sources are not executable by Node.
COPY --from=build /app/services/control-bridge/dist/packages/ops-protocol /app/packages/ops-protocol
COPY packages/ops-protocol/package.json /app/packages/ops-protocol/package.json
# Fail the image build if the shared runtime is missing or compiled in the
# wrong module format. This prevents another deployable-but-crash-looping image.
RUN node --input-type=module -e "import('/app/packages/ops-protocol/src/replay.js').then(m => { if (typeof m.createNonceStore !== 'function') process.exit(1) })"
USER control
EXPOSE 3099
CMD ["node", "dist/services/control-bridge/src/server.js"]
