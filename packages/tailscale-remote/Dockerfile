FROM node:20-alpine

WORKDIR /app

# Install Tailscale (Alpine doesn't have it by default, use binary)
RUN apk add --no-cache curl bash \
    && curl -fsSL https://tailscale.com/install.sh | sh

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Create log directory
RUN mkdir -p /app/.wise2/logs

# Expose port
EXPOSE 3009

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3009/health || exit 1

# Start service
CMD ["npm", "start"]
