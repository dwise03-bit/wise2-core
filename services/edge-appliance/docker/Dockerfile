# Multi-stage build for WISE² Edge Appliance
# Stage 1: Builder
FROM node:20-bullseye as builder

WORKDIR /build

# Install system dependencies for building
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20-slim as runtime

WORKDIR /app

# Install runtime dependencies for Raspberry Pi
RUN apt-get update && apt-get install -y \
    # Audio capture/playback
    alsa-utils \
    # GPIO control
    wiringpi \
    # Video capture
    libcamera-tools \
    # Ollama (local LLM inference)
    curl \
    # TTS/STT dependencies
    espeak-ng \
    pocketsphinx \
    # Speech recognition
    ffmpeg \
    # Network
    wireguard-tools \
    # Monitoring
    procps \
    # Utilities
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -s /bin/bash wise2

# Set up directory structure
RUN mkdir -p /data /var/log/wise2-edge-appliance /etc/wise2 /models

# Copy built application from builder
COPY --from=builder /build/dist /app/dist
COPY --from=builder /build/node_modules /app/node_modules
COPY --from=builder /build/package.json /app/

# Set ownership
RUN chown -R wise2:wise2 /app /data /var/log/wise2-edge-appliance /etc/wise2 /models

# Switch to non-root user
USER wise2

# Expose ports
EXPOSE 3000 3002 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV NODE_ID=edge-node-1
ENV LOCAL_DB_PATH=/data/wise2-edge.db
ENV PORT=3000

# Start application
CMD ["node", "dist/index.js"]
