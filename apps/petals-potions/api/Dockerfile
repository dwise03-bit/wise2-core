# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY api/package*.json ./api/

RUN npm ci
RUN cd api && npm ci

COPY . .
RUN npm run build -w api

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

RUN npm ci --omit=dev

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/main.js"]
