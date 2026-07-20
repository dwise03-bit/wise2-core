# Production runtime for WISE² Creative Studio Website
# Use the pre-built Next.js standalone output directly
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy the entire standalone directory which includes server.js and node_modules
COPY apps/website/.next/standalone ./
COPY apps/website/public ./public

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["apps/website/server.js"]
