# Command Center Dashboard - Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages

RUN npm install -g pnpm && pnpm install --frozen-lockfile
WORKDIR /app/apps/dashboard
RUN pnpm build

FROM node:20-alpine
WORKDIR /app/apps/dashboard
RUN npm install -g pnpm

COPY --from=builder /app/apps/dashboard/.next ./.next
COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder /app/apps/dashboard/package.json ./

ENV NODE_ENV=production PORT=3000
EXPOSE 3000

CMD ["npm", "start"]
