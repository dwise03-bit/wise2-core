FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/clipper-ui/package*.json ./
RUN npm install
COPY apps/clipper-ui .
RUN npm run build

FROM node:18-alpine
RUN apk add --no-cache curl
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3015
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3015/ || exit 1
CMD ["npm", "start"]
