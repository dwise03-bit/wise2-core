FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Install pnpm
RUN npm install -g pnpm

COPY pnpm-lock.yaml ./
COPY package.json pnpm-workspace.yaml ./
COPY apps/studio/package.json ./apps/studio/
COPY packages/db/package.json ./packages/db/
COPY packages/api/package.json ./packages/api/

RUN pnpm install --frozen-lockfile

COPY apps/studio ./apps/studio
COPY packages/db ./packages/db

RUN pnpm --filter @wise2/studio build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 3005
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/apps/studio ./apps/studio
COPY --from=builder /app/packages/db ./packages/db

RUN pnpm install --frozen-lockfile --production

EXPOSE 3005
CMD ["pnpm", "--filter", "@wise2/studio", "start"]
