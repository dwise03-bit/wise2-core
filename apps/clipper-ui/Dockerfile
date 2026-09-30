FROM node:18-alpine AS builder
WORKDIR /app
COPY apps/clipper-ui/package*.json ./
RUN npm install
COPY apps/clipper-ui .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 3015
CMD ["npm", "start"]
