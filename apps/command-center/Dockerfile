# Command Center Dashboard - Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app

# The workspace declares pnpm 8, whose self-managed Alpine binary is not
# available on linux-x64-musl. Keep the image on the compatible pnpm 9 binary
# installed below instead of having pnpm switch versions during install.
ENV COREPACK_ENABLE_PROJECT_SPEC=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/dashboard ./apps/dashboard
COPY packages ./packages

RUN npm install -g pnpm@9.15.9 \
    && pnpm config set manage-package-manager-versions false \
    && pnpm config set node-linker hoisted \
    && pnpm install --frozen-lockfile
WORKDIR /app/apps/dashboard
RUN pnpm install --filter @wise2/dashboard... --frozen-lockfile --force
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
