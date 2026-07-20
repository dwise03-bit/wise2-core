# Production runtime for WISE² Creative Studio Website
# Copy pre-built Next.js standalone artifacts
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache dumb-init curl

# Copy only the necessary artifacts from the pre-built .next/standalone
COPY .next/standalone/apps/website/server.js ./
COPY .next/standalone/node_modules ./node_modules
COPY public ./public
COPY package.json ./

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["dumb-init", "node"]
CMD ["server.js"]
