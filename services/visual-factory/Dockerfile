FROM node:20-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN npm install || npm ci || pnpm install

# Copy source code
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build

# Create directories
RUN mkdir -p logs data/brands cache

# Set environment
ENV NODE_ENV=production
ENV COMFYUI_URL=http://comfyui:8188
ENV PORT=8890

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8890/health || exit 1

# Start server
CMD ["npm", "start"]
