# GitHub Secrets Quick Reference Card

**Add these 16 secrets to**: https://github.com/dwise03-bit/wise2-core/settings/secrets/actions

Copy each secret name and paste into GitHub's secret creation form.

---

## 🚀 Deployment Infrastructure (3 secrets)

```
DEPLOY_HOST = 173.208.147.165

DEPLOY_USER = dwise

DEPLOY_KEY = (paste entire contents of ~/.ssh/wise2-deploy private key file)
```

---

## 🐳 Docker Hub (2 secrets)

```
DOCKER_USERNAME = (your Docker Hub username)

DOCKER_PASSWORD = (your Docker Hub Personal Access Token from https://hub.docker.com/settings/security)
```

---

## 🗄️ Database (1 secret)

```
DATABASE_URL = postgresql://user:password@173.208.147.165:5432/wise2
```

---

## 📧 Email (SendGrid) (2 secrets)

```
SENDGRID_API_KEY = (from https://app.sendgrid.com/settings/api_keys)

SENDGRID_FROM_EMAIL = noreply@wise2.net
```

---

## 💳 Payment (Stripe) (3 secrets)

```
STRIPE_SECRET_KEY = sk_live_xxxxxxxxxxxxxxxxxxxx (from https://dashboard.stripe.com/apikeys)

STRIPE_PUBLIC_KEY = pk_live_xxxxxxxxxxxxxxxxxxxx (from https://dashboard.stripe.com/apikeys)

STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxxxxxxxxxx (from https://dashboard.stripe.com/webhooks)
```

---

## 🤖 AI Services (2 secrets, optional but recommended)

```
OPENAI_API_KEY = sk-xxxxxxxxxxxxxxxxxxxx (from https://platform.openai.com/api-keys)

ANTHROPIC_API_KEY = sk-ant-xxxxxxxxxxxxxxxxxxxx (from https://console.anthropic.com)
```

---

## 🔐 Application Secrets (2 secrets)

Generate random 32+ character strings:

```bash
openssl rand -base64 32
```

```
JWT_SECRET = (32+ random chars generated above)

SESSION_SECRET = (32+ random chars generated above)
```

---

## ✅ Verification Checklist

After adding all 16 secrets:

- [ ] Go to https://github.com/dwise03-bit/wise2-core/settings/secrets/actions
- [ ] Confirm all 16 secrets appear in the list
- [ ] Click each secret to verify it was saved (GitHub shows "●●●●●●●●" for security)
- [ ] Copy the value of DEPLOY_KEY to verify it includes `-----BEGIN PRIVATE KEY-----` at start

---

## 🔄 Next Steps

1. Add all 16 secrets to GitHub
2. Run locally:
   ```bash
   # On your machine (not cloud session)
   ssh-keygen -t ed25519 -f ~/.ssh/wise2-deploy -N ""
   ssh dwise@173.208.147.165
   # Add your public key to ~/.ssh/authorized_keys
   exit
   ```
3. Test SSH:
   ```bash
   ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
   ```
4. GitHub Actions deploys automatically on next push to main (already pushed ✅)

---

## 🆘 Troubleshooting

**"How do I find my Docker Hub Personal Access Token?"**
- Go to https://hub.docker.com/settings/security
- Click "New Access Token"
- Name it "wise2-deploy"
- Select "Read & Write" permissions
- Copy token (won't show again)

**"How do I get my Stripe keys?"**
- Go to https://dashboard.stripe.com/apikeys
- You'll see "Publishable key" and "Secret key"
- Toggle "Viewing test data" OFF to see live keys
- Copy each one

**"What if I see 'workflow not found'?"**
- Workflows are in `.github/workflows/`
- They're already committed ✅
- GitHub will detect them automatically

**"Can I test without all 16 secrets?"**
- Yes, partially, but deployment won't work
- Some secrets are optional (OpenAI, Anthropic)
- Core secrets needed: DEPLOY_HOST, DEPLOY_USER, DEPLOY_KEY, DOCKER_USERNAME, DOCKER_PASSWORD, DATABASE_URL

---

**Questions?** See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for full details.
