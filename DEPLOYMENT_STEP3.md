# STEP 3: Deploy Website & Command-Center

## 🚀 Quick Start (Vercel Recommended)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link and deploy
cd /opt/wise2-core
vercel link

# 3. Deploy website
cd apps/website
vercel deploy --prod

# 4. Deploy command-center  
cd ../command-center
vercel deploy --prod

# 5. Verify: https://wise2.net and https://dashboard.wise2.net
```

## 🐳 Docker Alternative

```bash
docker build -f apps/website/Dockerfile -t wise2-website:latest apps/website
docker build -f apps/command-center/Dockerfile -t wise2-command-center:latest apps/command-center

docker-compose -f docker-compose.apps.yml --env-file .env.production up -d
```

## ✅ Verification After Deployment

- [ ] https://wise2.net loads with green lock
- [ ] https://dashboard.wise2.net loads with green lock
- [ ] Homepage displays correctly
- [ ] Google login button visible
- [ ] Stripe checkout loads

## 🎯 Next: Step 4 - Test Payment

Type "4" when deployment is complete.
