# Production build for WISE² Website (build context: project root)
FROM node:20-alpine

WORKDIR /app/apps/website

RUN apk add --no-cache dumb-init curl

# Copy pre-built website and dependencies
COPY apps/website/.next ./.next
COPY apps/website/public ./public
COPY apps/website/package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init"]
CMD ["node", ".next/standalone/apps/website/server.js"]
