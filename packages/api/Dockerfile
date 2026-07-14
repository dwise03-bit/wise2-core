FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages

RUN npm ci --workspaces

WORKDIR /app/packages/api
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g @nestjs/cli

# Copy built application
COPY --from=builder /app/packages/api/dist ./dist

# Copy production dependencies
RUN npm install --production --silent

EXPOSE 3001

CMD ["node", "dist/main"]
