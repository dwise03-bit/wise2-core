# WISE² Terminal Dashboard Production Build
# Node 22: better-sqlite3 13.x segfaults on Node 20 (verified), so do not lower this.
FROM node:22-alpine

WORKDIR /app

# Native build tools are required for node-pty during npm install.
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies: vite (a devDependency) is needed for the build step
RUN npm install

# Copy source code
COPY . .

# Build the frontend, then drop devDependencies from the runtime image
RUN npm run build && npm prune --omit=dev

# Expose port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --quiet --tries=1 --spider http://localhost:3030/ || exit 1

# Start server
CMD ["node", "server/index.js"]
