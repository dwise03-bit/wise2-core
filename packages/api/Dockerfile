FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages ./packages
COPY packages/api ./packages/api

RUN npm ci --workspaces

WORKDIR /app/packages/api
RUN npm run build

FROM node:20-alpine

WORKDIR /app

RUN npm install -g @nestjs/cli

COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/node_modules ./node_modules
COPY --from=builder /app/packages/db ./packages/db

EXPOSE 3001

CMD ["node", "dist/main"]
