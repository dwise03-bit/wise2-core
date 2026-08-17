# WISE² Website - Docker Deployment Guide

Complete Docker setup for production deployment of the WISE² website.

## 📋 Quick Start

### Build Image
```bash
cd apps/website
docker build -t wise2-website:latest .
```

### Run Container
```bash
docker run -d \
  --name wise2-website \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://wise2.net \
  -e NEXT_PUBLIC_API_URL=https://api.wise2.net \
  wise2-website:latest
```

### Using Docker Compose
```bash
cd apps/website
docker-compose up -d
```

## 🐳 Docker Image Specifications

### Multi-Stage Build
- **Stage 1: Dependencies** - Installs production dependencies only
- **Stage 2: Builder** - Builds Next.js application
- **Stage 3: Runner** - Minimal production image with non-root user

### Image Size Optimization
- Based on `node:20-alpine` (lightweight)
- Production dependencies only (~200MB)
- Removes build artifacts and cache
- Uses non-root user for security

### Performance Features
- ✅ Health checks configured
- ✅ Proper signal handling (dumb-init)
- ✅ Production optimizations
- ✅ Caching layers optimized

## 📦 Environment Variables

### Required
```bash
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://wise2.net
```

### Optional
```bash
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
```

## 🔒 Security Features

- ✅ Non-root user (nextjs:nodejs)
- ✅ Read-only filesystem (volumes needed for .next)
- ✅ Minimal attack surface
- ✅ Proper signal handling
- ✅ Health checks enabled

## 🚀 Deployment Options

### Option 1: Local Docker
```bash
# Build
docker build -t wise2-website:latest .

# Run
docker run -d \
  --name wise2-website \
  -p 3000:3000 \
  wise2-website:latest

# Verify
curl http://localhost:3000
```

### Option 2: Docker Compose (Local/Server)
```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f website

# Stop
docker-compose down
```

### Option 3: Docker Compose with Environment File
```bash
# Create .env file
cat > .env << EOF
NEXT_PUBLIC_SITE_URL=https://wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
EOF

# Start with environment
docker-compose --env-file .env up -d
```

### Option 4: Production Server (Docker Swarm/Kubernetes)

#### Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml wise2

# Check services
docker service ls
docker service ps wise2_website
```

#### Kubernetes
```bash
# Create deployment manifest
kubectl apply -f k8s-deployment.yaml

# Check pods
kubectl get pods
kubectl logs -f deployment/wise2-website
```

See `k8s-deployment.yaml` template below.

## 📊 Monitoring

### View Logs
```bash
# Docker
docker logs -f wise2-website

# Docker Compose
docker-compose logs -f website

# Kubernetes
kubectl logs -f deployment/wise2-website
```

### Health Check
```bash
# Docker
docker inspect wise2-website | grep -A 10 "HealthStatus"

# Direct
curl http://localhost:3000/
```

### Container Stats
```bash
docker stats wise2-website
```

## 🔄 Updates & Rollback

### Update Image
```bash
# Build new version
docker build -t wise2-website:v2 .

# Stop old container
docker stop wise2-website
docker rm wise2-website

# Run new version
docker run -d --name wise2-website -p 3000:3000 wise2-website:v2
```

### Rollback
```bash
# Switch to previous image
docker run -d --name wise2-website -p 3000:3000 wise2-website:v1
```

## 🔧 Advanced Configuration

### Nginx Reverse Proxy (SSL Termination)
See `nginx.conf` template:
```nginx
upstream website {
  server website:3000;
}

server {
  listen 80;
  server_name wise2.net;
  
  location / {
    proxy_pass http://website;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

### Environment Configuration
Create `.env.docker`:
```bash
NEXT_PUBLIC_SITE_URL=https://wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
```

Load with:
```bash
docker run --env-file .env.docker wise2-website:latest
```

## 📈 Performance Optimization

### Build Time
- First build: ~2-3 minutes
- Subsequent builds: ~30-60s (cached layers)

### Runtime Performance
- Memory: ~100-150MB typical
- CPU: Minimal (event-driven)
- Startup time: ~5-10s

### Caching Strategy
```bash
# Tag for versioning
docker build -t wise2-website:1.0 .
docker build -t wise2-website:latest .

# Push to registry
docker push myregistry/wise2-website:latest
```

## 🐋 Container Registry

### Docker Hub
```bash
# Login
docker login

# Tag
docker tag wise2-website:latest username/wise2-website:latest

# Push
docker push username/wise2-website:latest
```

### Private Registry
```bash
# Tag
docker tag wise2-website:latest registry.example.com/wise2-website:latest

# Push
docker push registry.example.com/wise2-website:latest
```

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs wise2-website

# Inspect
docker inspect wise2-website

# Test build locally
docker build -t test . --progress=plain
```

### Health Check Failing
```bash
# Verify app responds
curl http://localhost:3000

# Check exposed port
docker port wise2-website

# Logs
docker logs wise2-website
```

### High Memory Usage
```bash
# Check stats
docker stats wise2-website

# Increase limit
docker run -m 512m wise2-website:latest
```

## 📚 Kubernetes Deployment Template

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wise2-website
spec:
  replicas: 3
  selector:
    matchLabels:
      app: wise2-website
  template:
    metadata:
      labels:
        app: wise2-website
    spec:
      containers:
      - name: website
        image: wise2-website:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_SITE_URL
          value: "https://wise2.net"
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.wise2.net"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: wise2-website
spec:
  selector:
    app: wise2-website
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 🛡️ Security Best Practices

- ✅ Non-root user in Dockerfile
- ✅ Minimal base image (Alpine)
- ✅ Health checks enabled
- ✅ Resource limits configured
- ✅ Network isolation (docker networks)
- ✅ .dockerignore configured
- ✅ No secrets in Dockerfile
- ✅ Use environment variables for config

## 📖 Related Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel deployment
- [README.md](./README.md) - Project overview
- [docker-compose.yml](./docker-compose.yml) - Compose config
- [Dockerfile](./Dockerfile) - Build config

## ✅ Deployment Checklist

Pre-Deployment:
- [ ] Docker installed (`docker --version`)
- [ ] Production build tested locally
- [ ] Environment variables configured
- [ ] SSL certificates ready (if using reverse proxy)

Deployment:
- [ ] Image built successfully
- [ ] Container runs without errors
- [ ] Health checks passing
- [ ] Port 3000 accessible
- [ ] Logs clean and informative

Post-Deployment:
- [ ] Site loads at http://localhost:3000
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Memory/CPU acceptable

---

**Docker Status:** ✅ Production Ready

For questions, see README.md or DEPLOYMENT.md
