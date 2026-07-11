FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache bash curl git

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
