FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY pnpm-lock.yaml ./
COPY . .
RUN npm install -g pnpm && pnpm install --frozen-lockfile
RUN cd apps/studio && pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3005
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/apps/studio/public ./public
COPY --from=builder /app/apps/studio/.next/standalone ./
COPY --from=builder /app/apps/studio/.next/static ./.next/static

USER nextjs
EXPOSE 3005
CMD ["node", "server.js"]
