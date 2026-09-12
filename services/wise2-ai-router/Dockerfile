FROM node:20-alpine as builder

WORKDIR /app

# Copy all source files
COPY services/wise2-ai-router/package*.json ./
COPY services/wise2-ai-router/tsconfig.json ./
COPY services/wise2-ai-router/src ./src

# Install all deps and build
RUN npm ci && npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY services/wise2-ai-router/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy compiled code from builder
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3100/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3100

CMD ["node", "dist/index.js"]
