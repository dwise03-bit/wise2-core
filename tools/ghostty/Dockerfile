FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3033

ENV WISE2_CONTROL_TOKEN=${WISE2_CONTROL_TOKEN}
ENV PORT=3033

CMD ["node", "dist/cli.js", "daemon"]
