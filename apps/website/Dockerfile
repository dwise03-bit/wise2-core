# Production runtime for WISE² Creative Studio Website
FROM node:20-alpine

WORKDIR /app/apps/website

RUN apk add --no-cache dumb-init curl

# Copy the standalone server runtime and all its dependencies
COPY apps/website/.next/standalone/ ./

# Copy static files in the location the server expects
COPY apps/website/.next/static ./.next/static

# Copy public assets
COPY apps/website/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["server.js"]
