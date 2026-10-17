FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY tsconfig.json ./
COPY src ./src
RUN npm run test && npm run build && npm prune --omit=dev

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3045
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD wget -q -O - http://127.0.0.1:3045/health >/dev/null || exit 1
CMD ["node","dist/server.js"]
