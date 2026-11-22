FROM node:22-alpine
ENV NODE_ENV=production WISE2_MCP_HOST=0.0.0.0 PORT=8787
WORKDIR /app
COPY tools/wise2-commander/*.mjs ./
COPY tools/wise2-commander/package.json ./
USER node
EXPOSE 8787
CMD ["node","http-gateway.mjs"]
