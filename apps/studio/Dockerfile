FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm fetch

FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
COPY pnpm-lock.yaml ./
COPY . .
RUN npm install -g pnpm && pnpm install --no-frozen-lockfile
RUN cd apps/studio && pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3005
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/apps/studio/public ./public
COPY --from=builder /app/apps/studio/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3005
CMD ["node_modules/.bin/next", "start", "-p", "3005"]
