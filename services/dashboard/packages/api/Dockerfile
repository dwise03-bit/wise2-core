FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/api ./packages/api
COPY packages/db ./packages/db
COPY packages/types ./packages/types

RUN npm install --legacy-peer-deps

WORKDIR /app/packages/api

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
