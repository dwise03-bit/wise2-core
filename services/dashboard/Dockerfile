FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.9

# Copy entire monorepo
COPY . .

# Install all dependencies using pnpm workspaces
RUN pnpm install

# Build the dashboard
RUN pnpm run -r --filter=@wise2/dashboard build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8.15.9

# Copy from builder
COPY --from=builder /app /app

# Install production dependencies only
RUN pnpm install --prod

EXPOSE 3000

ENV NODE_ENV=production

WORKDIR /app/apps/dashboard

CMD ["npm", "start"]
