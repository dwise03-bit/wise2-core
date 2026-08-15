FROM node:20-slim

WORKDIR /app

# Install system dependencies for FFmpeg, image processing, and utilities
RUN apt-get update && apt-get install -y --no-install-recommends \
  ffmpeg \
  ffprobe \
  imagemagick \
  postgresql-client \
  curl \
  && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install --production

# Copy worker files
COPY . .

# Create temp directory for video assembly
RUN mkdir -p /tmp/wise-content && chmod 777 /tmp/wise-content

# Health check (ping Redis)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('ioredis')('redis://redis:6379').ping().then(() => process.exit(0)).catch(() => process.exit(1))"

# Start content worker
CMD ["node", "worker-content.js"]
