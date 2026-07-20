# Production runtime for WISE² Creative Studio Website
# Copy pre-built Next.js standalone artifacts
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy only the necessary artifacts from the pre-built .next/standalone
# (paths relative to project root build context)
COPY apps/website/.next/standalone/apps/website/server.js ./
COPY apps/website/.next/standalone/node_modules ./node_modules
COPY apps/website/public ./public
COPY apps/website/package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["server.js"]
