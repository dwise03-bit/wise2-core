FROM node:20-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends git docker.io ca-certificates curl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY services/control-bridge/package.json ./package.json
COPY services/control-bridge/src ./src
# Docker socket access is required for the fixed, allowlisted Docker adapter.
# The API exposes no arbitrary command or shell route.
EXPOSE 8787
CMD ["node", "src/server.js"]
