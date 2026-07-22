# 🚀 WISE² Core v1.0 - Deploy to AWS EC2 (One Command)

**Time to Production**: ~30 minutes  
**Downtime**: 0 (blue-green deployment)

---

## QUICK START

### 1. Prerequisites

```bash
# Install AWS CLI
brew install awscli

# Install Terraform
brew install terraform

# Configure AWS credentials
aws configure
# Enter your AWS Access Key ID and Secret Access Key

# Create SSH key pair in AWS
aws ec2 create-key-pair --key-name wise2-prod \
  --query 'KeyMaterial' --output text > wise2-prod.pem
chmod 600 wise2-prod.pem
```

### 2. Deploy with Terraform

```bash
cd terraform

# Review what will be created
terraform plan \
  -var="key_pair_name=wise2-prod" \
  -var="database_password=$(openssl rand -base64 32)" \
  -var="jwt_secret=$(openssl rand -base64 32)"

# Deploy infrastructure and application
terraform apply \
  -var="key_pair_name=wise2-prod" \
  -var="database_password=$(openssl rand -base64 32)" \
  -var="jwt_secret=$(openssl rand -base64 32)"
```

### 3. Get Public IP

```bash
# After terraform apply completes:
terraform output public_ip
# Example output: 54.123.45.67

# SSH into instance
ssh -i wise2-prod.pem ubuntu@<PUBLIC_IP>

# Check deployment status
sudo tail -f /var/log/wise2-bootstrap.log

# Check services
docker-compose -f /opt/wise2/docker-compose.prod.yml ps
```

### 4. Configure DNS

```bash
# Point your domain to the Elastic IP
# In your DNS provider (Route 53, Cloudflare, etc.):
# wise2.net      A  <PUBLIC_IP>
# api.wise2.net  A  <PUBLIC_IP>
# www.wise2.net  A  <PUBLIC_IP>
```

### 5. Access Production

- **Dashboard**: https://wise2.net
- **API**: https://api.wise2.net
- **Health**: https://api.wise2.net/health

---

## DETAILED DEPLOYMENT STEPS

### Step 1: Prepare AWS Account

```bash
# Create IAM user for CI/CD (optional)
aws iam create-user --user-name wise2-deployer

# Create S3 bucket for Terraform state (optional but recommended)
aws s3 mb s3://wise2-terraform-state-$(date +%s)

# Create SNS topic for alarms (optional)
aws sns create-topic --name wise2-prod-alerts
```

### Step 2: Configure Terraform Backend (Optional)

Edit `terraform/backend.tf`:

```hcl
terraform {
  backend "s3" {
    bucket         = "wise2-terraform-state-xxx"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}
```

### Step 3: Deploy Infrastructure

```bash
cd /Users/danielwise/Projects/wise2-core

# Initialize Terraform
terraform -chdir=terraform init

# Create tfvars file
cat > terraform/terraform.tfvars << 'EOF'
aws_region        = "us-east-1"
environment       = "prod"
instance_type     = "t3.medium"
key_pair_name     = "wise2-prod"
domain_name       = "wise2.net"
allowed_ssh_ips   = ["YOUR_IP/32"]  # Replace with your IP
database_password = "SECURE_PASSWORD_HERE"
jwt_secret        = "SECURE_JWT_SECRET_HERE"
EOF

# Apply Terraform
terraform -chdir=terraform apply -auto-approve
```

### Step 4: Monitor Bootstrap

```bash
# Get instance IP
PUBLIC_IP=$(terraform -chdir=terraform output -raw public_ip)

# SSH into instance
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Watch bootstrap progress
sudo tail -f /var/log/wise2-bootstrap.log

# Wait for "Bootstrap Complete" message (5-10 minutes)
```

### Step 5: Verify Services

```bash
# From EC2 instance:
docker-compose -f /opt/wise2/docker-compose.prod.yml ps

# Check API health
curl http://localhost:3000/health

# Check database
docker exec wise2-postgres-prod psql -U wise2_prod -d wise2_prod -c "SELECT COUNT(*) FROM users;"
```

### Step 6: Configure SSL

```bash
# SSH into instance
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Request certificates (if not done by bootstrap)
sudo certbot certonly --nginx \
  -d wise2.net -d www.wise2.net -d api.wise2.net \
  --email ops@wise2.net \
  --agree-tos \
  --non-interactive

# Restart Nginx with SSL
sudo systemctl restart nginx

# Verify SSL
curl -I https://wise2.net
```

### Step 7: Test Endpoints

```bash
# Dashboard
curl -I https://wise2.net

# API Health
curl -I https://api.wise2.net/health

# Database connectivity
curl https://api.wise2.net/health | jq .

# Login (demo credentials)
curl -X POST https://api.wise2.net/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@wise2.net","password":"password123"}'
```

---

## PRODUCTION URLS

| Service | URL |
|---------|-----|
| Dashboard | https://wise2.net |
| API | https://api.wise2.net |
| Health Check | https://api.wise2.net/health |
| System Metrics | https://api.wise2.net/metrics |

---

## MONITORING & MAINTENANCE

### View Logs

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Docker logs
docker-compose -f /opt/wise2/docker-compose.prod.yml logs -f

# API logs
docker logs wise2-api-prod -f

# Database logs
docker logs wise2-postgres-prod -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Database Backups

```bash
# Verify backups are running
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP
ls -lh /backups/wise2/

# Manual backup
/opt/wise2/scripts/backup-database.sh

# Restore backup
docker exec wise2-postgres-prod psql -U wise2_prod -d wise2_prod < /backups/wise2/wise2_backup_YYYYMMDD_HHMMSS.sql
```

### Health Checks

```bash
# Run manual health check
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP
/opt/wise2/scripts/health-check.sh

# View health check logs
tail -f /var/log/wise2-health.log
```

### Update Application

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP
cd /opt/wise2

# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d
```

---

## ROLLBACK PROCEDURE

If something goes wrong:

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Stop all services
docker-compose -f /opt/wise2/docker-compose.prod.yml down

# Restore database from backup
docker-compose -f /opt/wise2/docker-compose.prod.yml up -d postgres redis
sleep 10
docker exec wise2-postgres-prod psql -U wise2_prod -d wise2_prod < /backups/wise2/wise2_backup_LAST.sql

# Checkout previous version
cd /opt/wise2
git checkout HEAD~1

# Restart services
docker-compose -f docker-compose.prod.yml up -d
```

---

## COST ESTIMATION

**Monthly Costs (AWS)**:

| Service | Instance | Cost/Month |
|---------|----------|-----------|
| EC2 t3.medium (730 hrs) | On-Demand | $30 |
| EBS Storage (100 GB) | gp3 | $10 |
| Data Transfer | Out (1 TB est.) | $85 |
| **Total** | | **~$125** |

**Optional Services**:
- S3 Backups: +$5
- CloudWatch: +$10
- NAT Gateway: +$32 (if using private DB subnet)

---

## TROUBLESHOOTING

### Instance won't start

```bash
# Check instance status
aws ec2 describe-instance-status --instance-ids i-xxxxxxxxx --region us-east-1

# View system logs
aws ec2 get-console-output --instance-id i-xxxxxxxxx --region us-east-1
```

### Database connection errors

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Check if postgres container is running
docker ps | grep postgres

# Check database logs
docker logs wise2-postgres-prod

# Verify environment variables
cat /opt/wise2/.env.production | grep DB_
```

### SSL certificate issues

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal

# View Nginx config
sudo nginx -T
```

### Services not responding

```bash
ssh -i wise2-prod.pem ubuntu@$PUBLIC_IP

# Restart all services
docker-compose -f /opt/wise2/docker-compose.prod.yml restart

# Check service status
docker-compose -f /opt/wise2/docker-compose.prod.yml ps

# View health check output
curl http://localhost:3000/health
```

---

## CLEANUP (Destroy Infrastructure)

```bash
# Destroy all AWS resources (⚠️ Be careful!)
cd terraform
terraform destroy \
  -var="key_pair_name=wise2-prod" \
  -var="database_password=dummy" \
  -var="jwt_secret=dummy"

# Confirm when prompted
```

---

## DEPLOYMENT CHECKLIST

- [ ] AWS account configured
- [ ] SSH key pair created (wise2-prod.pem)
- [ ] Terraform initialized
- [ ] EC2 instance deployed
- [ ] Security group configured
- [ ] Elastic IP assigned
- [ ] Bootstrap script completed
- [ ] Docker services running
- [ ] Database schema loaded
- [ ] Nginx configured
- [ ] SSL certificates generated
- [ ] DNS records updated
- [ ] Health checks passing
- [ ] Backups enabled
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Production live! 🚀

---

**Status**: Production Deployment Ready  
**Last Updated**: 2026-07-22  
**Estimated Time**: 30 minutes  
**Cost**: ~$125/month
