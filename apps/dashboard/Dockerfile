FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/dashboard ./apps/dashboard
COPY packages/ui-components ./packages/ui-components
COPY packages/types ./packages/types

RUN npm install --legacy-peer-deps

WORKDIR /app/apps/dashboard

RUN npm run build

# Create startup script with error handling
RUN cat > start.sh << 'EOF'
#!/bin/sh
set -e
echo "Starting Next.js server..."
echo "Working directory: $(pwd)"
echo "Node version: $(node --version)"
echo "Port: 3002"
npm start
EOF

RUN chmod +x start.sh

EXPOSE 3000

ENV NODE_ENV=production

CMD ["./start.sh"]
