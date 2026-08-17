# GitHub Secrets Setup for WISE² Deployment

## Overview

GitHub Secrets are encrypted environment variables used by GitHub Actions workflows. They're essential for secure deployment automation.

---

## Quick Setup Checklist

### Step 1: Navigate to Secrets

1. Go to your repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Step 2: Add All Required Secrets

Copy and paste each secret into GitHub. Generate random values for passwords using:

```bash
openssl rand -base64 32
```

#### Deployment Secrets

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `DEPLOY_HOST` | `173.208.147.165` | ✅ Yes | Production server IP |
| `DEPLOY_USER` | `dwise` | ✅ Yes | SSH username |
| `DEPLOY_KEY` | [private key content] | ✅ Yes | See below |
| `DOCKER_USERNAME` | Your Docker Hub username | ⚠️ Recommended | For pushing images |
| `DOCKER_PASSWORD` | Docker Hub access token | ⚠️ Recommended | Not password! |

#### Database Secrets (Generate Random)

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `POSTGRES_ADMIN_PASSWORD` | Random 32 char | ✅ Yes | pg admin password |
| `POSTGRES_APP_PASSWORD` | Random 32 char | ✅ Yes | app db password |
| `MONGODB_PASSWORD` | Random 32 char | ✅ Yes | MongoDB password |
| `REDIS_PASSWORD` | Random 32 char | ✅ Yes | Redis password |

#### API & Security Secrets (Generate Random)

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `JWT_SECRET` | Random 32 char | ✅ Yes | JWT signing key |
| `OPEN_WEBUI_SECRET_KEY` | Random 32 char | ✅ Yes | WebUI secret |
| `GRAFANA_PASSWORD` | Random 32 char | ✅ Yes | Grafana admin password |

#### Frontend Secrets

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.wise2.net` | ✅ Yes | API base URL |
| `NEXT_PUBLIC_WS_URL` | `wss://api.wise2.net` | ✅ Yes | WebSocket URL |
| `NEXT_PUBLIC_LOGIN_URL` | `https://wise2.net/command-center/login` | ✅ Yes | Login URL |

#### Third-Party Services (Optional)

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `STRIPE_SECRET_KEY` | Your Stripe secret | ❌ Optional | For payments |
| `STRIPE_PUBLIC_KEY` | Your Stripe public key | ❌ Optional | For payments |
| `GOOGLE_CLIENT_ID` | Your Google OAuth ID | ❌ Optional | For social login |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret | ❌ Optional | For social login |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth ID | ❌ Optional | For social login |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth secret | ❌ Optional | For social login |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | ❌ Optional | For AI features |
| `OPENAI_API_KEY` | Your OpenAI API key | ❌ Optional | For AI features |
| `ELEVENLABS_API_KEY` | Your ElevenLabs API key | ❌ Optional | For voice features |

#### Notifications (Optional)

| Name | Value | Required | Notes |
|------|-------|----------|-------|
| `SLACK_WEBHOOK` | Your Slack webhook URL | ❌ Optional | Deployment notifications |

---

## How to Get Each Secret

### Deploy Key

Already generated! Copy from:
```bash
cat ~/.ssh/wise2-deploy
```

### Docker Hub Credentials

1. Go to [Docker Hub](https://hub.docker.com)
2. Login to your account
3. **Account Settings** → **Security**
4. Click **New Access Token**
5. Name: `wise2-github`
6. Copy the token and use as `DOCKER_PASSWORD`

### Generate Random Passwords

```bash
# Generate a secure random password
openssl rand -base64 32

# Example output:
# XxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx
```

### Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. **Developers** → **API Keys**
3. Copy **Secret Key** and **Publishable Key**

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client ID**
4. Select **Web application**
5. Copy **Client ID** and **Client Secret**

### GitHub OAuth

1. Go to **Settings** → **Developer settings** → **OAuth Apps**
2. **New OAuth App**
3. Copy **Client ID** and **Client Secret**

### Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com)
2. **API Keys**
3. Copy your API key

### Slack Webhook

1. Go to your Slack workspace
2. **Settings** → **Integrations** → **Incoming Webhooks**
3. **Add New Webhook to Workspace**
4. Copy the **Webhook URL**

---

## Verification

After adding all secrets, verify they're set:

```bash
# Go to GitHub
Settings → Secrets and variables → Actions

# You should see all secrets listed (values hidden)
```

---

## Security Best Practices

✅ **DO:**
- Store secrets in GitHub, not in code
- Use unique secrets for each environment
- Rotate secrets periodically
- Use strong random values (32+ chars)
- Keep private keys secure

❌ **DON'T:**
- Commit secrets to git
- Share secrets in chat/email
- Use the same secret for multiple services
- Hardcode secrets in environment files (git-tracked)

---

## Troubleshooting

### "Secret not found" error in workflow

1. Verify secret name matches exactly (case-sensitive)
2. Verify it's added to correct repository
3. Wait a few seconds for GitHub to propagate changes

### "Invalid SSH key" error

1. Make sure you copied the entire private key (including BEGIN/END lines)
2. Verify key has newlines (not all on one line)
3. Try generating a new key and updating the secret

---

## Next Steps

1. ✅ Add all required secrets
2. ⏳ Verify secrets are in GitHub
3. ⏳ Test deployment via GitHub Actions
4. ⏳ Monitor first deployment in Actions tab

---

**Ready to deploy?** Create your first commit and push to `main` to trigger the deployment workflow!
