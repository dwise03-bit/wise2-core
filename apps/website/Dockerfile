# Production runtime for WISE² Creative Studio Website
# Use the pre-built Next.js standalone output with static files
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy the standalone server runtime
COPY apps/website/.next/standalone ./

# Copy static files that the server needs to serve
COPY apps/website/.next/static ./.next/static

# Copy public assets
COPY apps/website/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["apps/website/server.js"]
