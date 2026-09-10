FROM node:20-alpine

WORKDIR /app/services/admin-backend

COPY services/admin-backend/package.json ./
RUN npm install

COPY services/admin-backend/ .

EXPOSE 3014

CMD ["node", "server.js"]
