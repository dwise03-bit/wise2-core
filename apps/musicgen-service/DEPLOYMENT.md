# MusicGen Inference Server - Deployment Guide

## Quick Start

### Local Development (Minimal Setup)

```bash
# 1. Navigate to service directory
cd apps/musicgen-service

# 2. Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create configuration
cp .env.example .env

# 5. Run development server
python musicgen_server.py
```

Server available at: `http://localhost:5000`

### Docker Development

```bash
# 1. Build image
docker build -t musicgen-service:dev .

# 2. Run container
docker run -it --gpus all \
  -p 5000:5000 \
  -e DEVICE=cuda \
  -v $(pwd)/models:/app/models \
  musicgen-service:dev
```

### Docker Compose

```bash
# 1. Start service
docker-compose up -d

# 2. View logs
docker-compose logs -f musicgen-service

# 3. Stop service
docker-compose down
```

## Production Deployment

### Prerequisites

1. **Hardware**
   - NVIDIA GPU (Tesla T4 or better)
   - 16GB+ VRAM recommended
   - 50GB+ disk space for models
   - 8+ CPU cores

2. **Software**
   - NVIDIA CUDA 12.1+
   - Docker 20.10+
   - NVIDIA Docker runtime

3. **Infrastructure**
   - Load balancer (nginx/HAProxy)
   - Reverse proxy configuration
   - SSL/TLS certificates
   - Monitoring stack

### Step 1: Prepare Server

```bash
# Install CUDA drivers and Docker
# (Instructions vary by OS - see NVIDIA/Docker docs)

# Verify NVIDIA Docker
docker run --rm --gpus all nvidia/cuda:12.1-base nvidia-smi

# Create application user
sudo useradd -m -s /bin/bash musicgen
sudo usermod -aG docker musicgen
```

### Step 2: Clone Repository

```bash
# Clone repo as musicgen user
sudo -u musicgen git clone https://github.com/wise2-inc/wise2-core.git
cd wise2-core/apps/musicgen-service
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env for production
# Set:
# - MUSICGEN_HOST=0.0.0.0
# - MUSICGEN_PORT=5000
# - DEVICE=cuda
# - USE_FP16=true
# - DEBUG=false
# - GUNICORN_WORKERS=4
nano .env
```

### Step 4: Build Docker Image

```bash
# Build optimized image
docker build -t musicgen-service:1.0.0 .

# Test locally
docker run -it --gpus all \
  -p 5000:5000 \
  --env-file .env \
  -v /data/musicgen/models:/app/models \
  musicgen-service:1.0.0
```

### Step 5: Setup Reverse Proxy

**nginx configuration:**

```nginx
upstream musicgen {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;  # For multiple workers
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name musicgen.wise2.net;

    ssl_certificate /etc/letsencrypt/live/musicgen.wise2.net/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/musicgen.wise2.net/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://musicgen;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;

        # Timeouts for long-running generations
        proxy_connect_timeout 30s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://musicgen;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name musicgen.wise2.net;
    return 301 https://$server_name$request_uri;
}
```

### Step 6: Deploy with Docker Compose

**docker-compose.prod.yml:**

```yaml
version: '3.8'

services:
  musicgen:
    image: musicgen-service:1.0.0
    container_name: musicgen-prod
    restart: always
    
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

    environment:
      - MUSICGEN_HOST=0.0.0.0
      - MUSICGEN_PORT=5000
      - DEVICE=cuda
      - USE_FP16=true
      - DEBUG=false
      - GUNICORN_WORKERS=4

    ports:
      - "5000:5000"

    volumes:
      - /data/musicgen/models:/app/models
      - /data/musicgen/cache:/app/cache
      - /data/musicgen/logs:/app/logs

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

    networks:
      - wise2-network

    # Resource limits
    mem_limit: 20g
    cpus: "8"

    logging:
      driver: "json-file"
      options:
        max-size: "100m"
        max-file: "10"

networks:
  wise2-network:
    driver: bridge
```

**Deploy:**

```bash
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-compose.prod.yml logs -f
```

### Step 7: Setup Monitoring

**Prometheus scrape config:**

```yaml
scrape_configs:
  - job_name: 'musicgen'
    metrics_path: '/metrics'
    static_configs:
      - targets: ['musicgen.wise2.net:443']
    scheme: https
```

**Health monitoring script:**

```bash
#!/bin/bash
# /usr/local/bin/check-musicgen.sh

URL="https://musicgen.wise2.net/health"
TIMEOUT=10

response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT $URL)

if [ "$response" = "200" ]; then
    echo "OK"
    exit 0
else
    echo "FAIL: HTTP $response"
    exit 1
fi
```

**Crontab for monitoring:**

```bash
*/5 * * * * /usr/local/bin/check-musicgen.sh || systemctl restart musicgen
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes 1.20+
- NVIDIA GPU operator installed
- Container registry access

### Deployment Manifest

**musicgen-deployment.yaml:**

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: musicgen-config
data:
  MUSICGEN_HOST: "0.0.0.0"
  MUSICGEN_PORT: "5000"
  DEVICE: "cuda"
  USE_FP16: "true"
  DEBUG: "false"

---

apiVersion: apps/v1
kind: Deployment
metadata:
  name: musicgen
spec:
  replicas: 2
  selector:
    matchLabels:
      app: musicgen

  template:
    metadata:
      labels:
        app: musicgen

    spec:
      containers:
      - name: musicgen
        image: registry.wise2.net/musicgen-service:1.0.0
        imagePullPolicy: IfNotPresent

        ports:
        - containerPort: 5000
          name: http

        envFrom:
        - configMapRef:
            name: musicgen-config

        resources:
          requests:
            memory: "10Gi"
            cpu: "4"
            nvidia.com/gpu: "1"
          limits:
            memory: "16Gi"
            cpu: "8"
            nvidia.com/gpu: "1"

        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10

        readinessProbe:
          httpGet:
            path: /status
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 10

        volumeMounts:
        - name: models
          mountPath: /app/models

      volumes:
      - name: models
        persistentVolumeClaim:
          claimName: musicgen-models-pvc

      nodeSelector:
        accelerator: nvidia

---

apiVersion: v1
kind: Service
metadata:
  name: musicgen
spec:
  selector:
    app: musicgen
  type: LoadBalancer
  ports:
  - protocol: TCP
    port: 5000
    targetPort: 5000

---

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: musicgen-models-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: fast-ssd
  resources:
    requests:
      storage: 50Gi
```

**Deploy:**

```bash
kubectl apply -f musicgen-deployment.yaml
kubectl get pods -l app=musicgen
kubectl logs -f deployment/musicgen
```

## Scaling Strategies

### Horizontal Scaling (Multiple Instances)

```bash
# Scale replicas
kubectl scale deployment musicgen --replicas=4

# Or with docker-compose
docker-compose -f docker-compose.prod.yml up -d --scale musicgen=3
```

### Vertical Scaling (Larger GPU)

```bash
# Change GPU in deployment
nodeSelector:
  gpu-type: tesla-v100  # Change from tesla-t4
```

### Queue-Based Scaling with Celery

```python
# In docker-compose.yml
celery-worker:
  image: musicgen-service:1.0.0
  command: celery -A musicgen_tasks worker --loglevel=info
  environment:
    - BROKER_URL=redis://redis:6379/0
  depends_on:
    - redis
  deploy:
    replicas: 4
```

## Backup & Recovery

### Backup Models

```bash
# Backup model cache
rsync -avz /data/musicgen/models/ backup-server:/backups/musicgen-models/

# Create snapshot
lvcreate -L10G -s -n musicgen-snap /dev/vg0/musicgen-lv
```

### Recovery Procedure

```bash
# 1. Stop service
docker-compose -f docker-compose.prod.yml down

# 2. Restore models
rsync -avz backup-server:/backups/musicgen-models/ /data/musicgen/models/

# 3. Start service
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
curl https://musicgen.wise2.net/status
```

## Troubleshooting

### High Memory Usage

```bash
# Check memory
docker stats musicgen-prod

# Solution: Reduce batch size in .env
BATCH_SIZE=2  # From 4

# Restart
docker-compose -f docker-compose.prod.yml restart
```

### Slow Generations

```bash
# Check GPU utilization
nvidia-smi

# Check if CPU is bottleneck
top -p $(pgrep -f gunicorn)

# Solutions:
# 1. Increase GUNICORN_WORKERS
# 2. Increase GPU memory allocation
# 3. Enable FP16 (if not already)
```

### Model Download Issues

```bash
# Pre-download models
docker run -it --rm \
  -v /data/musicgen/models:/app/models \
  musicgen-service:1.0.0 \
  python -c "from transformers import AutoModel; AutoModel.from_pretrained('facebook/musicgen-large')"

# Or use HuggingFace CLI
transformers-cli download facebook/musicgen-large
```

### Disk Space Issues

```bash
# Check disk usage
du -sh /data/musicgen/*

# Clear old cache
docker-compose -f docker-compose.prod.yml exec musicgen \
  curl -X POST http://localhost:5000/api/v1/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"max_age_seconds": 86400}'
```

## Monitoring Commands

```bash
# Check service status
curl https://musicgen.wise2.net/status

# Check health
curl https://musicgen.wise2.net/health

# View logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100

# Check resource usage
docker stats musicgen-prod

# Check GPU
nvidia-smi

# Generate test audio
curl -X POST https://musicgen.wise2.net/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "test music", "duration": 5}'
```

## Performance Tuning

### For Throughput (More concurrent generations)

```bash
GUNICORN_WORKERS=8
BATCH_SIZE=4
MAX_QUEUE_SIZE=200
```

### For Latency (Faster individual generation)

```bash
GUNICORN_WORKERS=2
BATCH_SIZE=1
USE_FP16=true
```

### For Memory Efficiency

```bash
USE_FP16=true
MUSICGEN_MODEL=facebook/musicgen-medium  # Smaller model
BATCH_SIZE=1
```

## Rollout & Rollback

### Blue-Green Deployment

```bash
# Deploy new version to blue
docker build -t musicgen-service:1.1.0 .
docker-compose -f docker-compose.blue.yml up -d

# Test blue environment
curl http://localhost:5001/health

# Switch traffic to blue
# (Update nginx upstream)

# Keep green as rollback
```

### Rollback Procedure

```bash
# If issues with new version
docker-compose -f docker-compose.green.yml up -d

# Update nginx to point to green
# Old version still running and ready
```

## Support & Maintenance

### Regular Tasks

- Weekly: Check logs for errors
- Monthly: Update models and dependencies
- Quarterly: Test disaster recovery
- Annually: Capacity planning and upgrade planning

### Emergency Contacts

- On-call: dwise03@gmail.com
- Escalation: wise2-team@example.com

---

**Deployment Guide v1.0 - MusicGen Inference Server**
