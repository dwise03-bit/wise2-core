FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/dashboard ./apps/dashboard
COPY packages/ui-components ./packages/ui-components
COPY packages/types ./packages/types

RUN npm install --legacy-peer-deps

WORKDIR /app/apps/dashboard

RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
