FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm ci --workspaces

WORKDIR /app/packages/api
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Copy built app and required files from builder
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

CMD ["node", "dist/main"]
