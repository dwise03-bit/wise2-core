# WISE² Dashboard Docker Container
# Build: docker build -t wise2-dashboard .
# Run: docker run -d -p 80:80 -p 443:443 -v /etc/letsencrypt:/etc/letsencrypt wise2-dashboard

FROM nginx:alpine

# Install dependencies
RUN apk add --no-cache \
    git \
    curl \
    certbot \
    python3 \
    py3-pip && \
    pip3 install certbot-nginx

# Clone WISE² dashboard
RUN mkdir -p /app && cd /app && \
    git clone --branch setup/dave-station https://github.com/dwise03-bit/wise2-core.git . && \
    cp -r CommandCenter/Dashboard/* /usr/share/nginx/html/

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY wise2.conf /etc/nginx/conf.d/default.conf

# Create startup script
RUN mkdir -p /docker-entrypoint.d && \
    echo '#!/bin/sh\n\
set -e\n\
DOMAIN=${DOMAIN:-wise2.net}\n\
EMAIL=${EMAIL:-admin@wise2.net}\n\
\n\
if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then\n\
    echo "Generating SSL certificate..."\n\
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN \\\n\
        --non-interactive --agree-tos --email $EMAIL\n\
fi\n\
\n\
nginx -g "daemon off;"\n\
' > /docker-entrypoint.d/ssl-setup.sh && \
    chmod +x /docker-entrypoint.d/ssl-setup.sh

# Expose ports
EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/index.html || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
