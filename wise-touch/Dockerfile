FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache bash curl

COPY package*.json ./

RUN npm ci --only=production

COPY .next ./.next
COPY public ./public
COPY next.config.js ./
COPY package.json ./

EXPOSE 3000

CMD ["npm", "start"]
