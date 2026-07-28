FROM node:20-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
  postgresql-client \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm ci --production

# Copy worker files
COPY . .

# Health check (ping Redis)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('ioredis')('redis://redis:6379').ping().then(() => process.exit(0)).catch(() => process.exit(1))"

# Start worker
CMD ["node", "worker.js"]
