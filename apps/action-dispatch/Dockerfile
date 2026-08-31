FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/action-dispatch ./apps/action-dispatch
RUN pnpm install --no-frozen-lockfile
WORKDIR /app/apps/action-dispatch
RUN pnpm build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/apps/action-dispatch/.next ./.next
COPY --from=builder /app/apps/action-dispatch/public ./public
COPY --from=builder /app/apps/action-dispatch/package.json ./
RUN mkdir -p public
RUN pnpm install --prod

ENV NODE_ENV=production
ENV PORT=3027
ENV HOSTNAME=0.0.0.0
EXPOSE 3027

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3027/action-dispatch/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["pnpm", "start"]
