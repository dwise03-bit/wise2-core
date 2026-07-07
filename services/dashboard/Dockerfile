FROM node:22-alpine

WORKDIR /app

# Install Docker CLI + bash for container control
RUN apk add --no-cache bash docker-cli curl git

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
