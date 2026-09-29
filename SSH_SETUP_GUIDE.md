# SSH Setup Guide for WISE² Deployment

## Overview
SSH is required for:
1. GitHub Actions to deploy to production server (173.208.147.165)
2. Manual SSH access to server as user `dwise`
3. Automated deployment via `appleboy/ssh-action@master` GitHub Action

## Step 1: Generate SSH Key Pair

On your local machine (not in this cloud session):

```bash
# Generate ED25519 key (recommended)
ssh-keygen -t ed25519 -f ~/.ssh/wise2-deploy -N "" -C "wise2-deploy@github-actions"

# Or RSA key (if ED25519 not supported)
ssh-keygen -t rsa -b 4096 -f ~/.ssh/wise2-deploy -N "" -C "wise2-deploy@github-actions"
```

This creates:
- `~/.ssh/wise2-deploy` (private key - keep secret!)
- `~/.ssh/wise2-deploy.pub` (public key)

## Step 2: Add Public Key to Server

SSH into the production server and add the public key:

```bash
ssh dwise@173.208.147.165

# On the server:
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key
cat >> ~/.ssh/authorized_keys << 'PUBKEY'
ssh-ed25519 AAAA... (paste your public key here)
PUBKEY

chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Verify SSH Access

Test SSH access from your local machine:

```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
# Should connect without password prompt
exit
```

## Step 4: Configure GitHub Secrets

Add the following secrets to GitHub repository:
https://github.com/dwise03-bit/wise2-core/settings/secrets/actions

### Required Secrets:

1. **DEPLOY_HOST**
   - Value: `173.208.147.165`

2. **DEPLOY_USER**
   - Value: `dwise`

3. **DEPLOY_KEY** (CRITICAL - keep private!)
   - Value: Contents of `~/.ssh/wise2-deploy` (private key)
   - Command to copy: `cat ~/.ssh/wise2-deploy | pbcopy` (Mac) or `xclip < ~/.ssh/wise2-deploy` (Linux)

4. **DOCKER_USERNAME**
   - Value: Your Docker Hub username

5. **DOCKER_PASSWORD**
   - Value: Your Docker Hub password or token

6. **STRIPE_SECRET_KEY**
   - Value: Your Stripe secret key (sk_live_...)

7. **STRIPE_WEBHOOK_SECRET**
   - Value: Your Stripe webhook signing secret

8. **STRIPE_PUBLIC_KEY**
   - Value: Your Stripe public key (pk_live_...)

9. **STRIPE_STARTER_PRICE_ID**
   - Value: Your Stripe starter plan price ID

10. **STRIPE_PRO_PRICE_ID**
    - Value: Your Stripe pro plan price ID

11. **SENDGRID_API_KEY**
    - Value: Your SendGrid API key

12. **SENDGRID_FROM_EMAIL**
    - Value: Your SendGrid sender email

13. **DATABASE_URL**
    - Value: `postgresql://wise2:password@postgres:5432/wise2_prod`

14. **APP_URL**
    - Value: `https://wise2.net`

15. **API_BASE_URL**
    - Value: `https://api.wise2.net`

16. **SLACK_WEBHOOK** (Optional)
    - Value: Your Slack webhook URL for deployment notifications

## Step 5: Test Deployment

Once all secrets are configured:

```bash
# Option A: Push to main to trigger automatic deployment
git push origin main

# Option B: Manually trigger deployment workflow
# Go to: https://github.com/dwise03-bit/wise2-core/actions
# Click "Deploy WISE² Customer Journey"
# Click "Run workflow" button
```

Monitor deployment:
- GitHub Actions: https://github.com/dwise03-bit/wise2-core/actions
- Look for "Deploy WISE² Customer Journey" workflow
- Check "Deploy to production" step for SSH connection status

## Troubleshooting

### "Permission denied (publickey)" error

**Check 1: Verify public key is on server**
```bash
ssh dwise@173.208.147.165
cat ~/.ssh/authorized_keys | grep "ssh-ed25519"
```

**Check 2: Fix key permissions**
```bash
ssh dwise@173.208.147.165
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**Check 3: Verify private key permissions locally**
```bash
chmod 600 ~/.ssh/wise2-deploy
ls -la ~/.ssh/wise2-deploy
# Should show: -rw------- 
```

### "Host key verification failed"

GitHub Actions uses `StrictHostKeyChecking=no`. If you're testing manually:

```bash
ssh -o StrictHostKeyChecking=accept-new -i ~/.ssh/wise2-deploy dwise@173.208.147.165
```

### SSH key format issues

If you get "invalid format" in GitHub Actions:

```bash
# Ensure key is in OpenSSH format (not PuTTY format)
ssh-keygen -p -N "" -m pem -f ~/.ssh/wise2-deploy

# Copy to clipboard (Mac)
cat ~/.ssh/wise2-deploy | pbcopy

# Copy to clipboard (Linux)
cat ~/.ssh/wise2-deploy | xclip -selection clipboard
```

## Manual SSH Deployment (Without GitHub Actions)

If you prefer to deploy manually via SSH:

```bash
ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165
cd wise2-core
git pull origin main
cp .env.prod.example .env.prod
# Edit .env.prod with production secrets
./deploy-docker.sh
```

## Security Best Practices

✅ DO:
- Keep private key (.ssh/wise2-deploy) secure
- Use strong SSH key passphrase if stored locally
- Rotate keys periodically
- Restrict key permissions (chmod 600)
- Use different keys for different purposes
- Store GitHub Secrets securely

❌ DON'T:
- Share private key via email or chat
- Commit private key to git
- Use same key for multiple services
- Use weak or empty passphrases
- Log private keys in CI output
- Store secrets in environment files committed to git

## Verify Full SSH Setup

Run this checklist:

- [ ] SSH key pair generated (.ssh/wise2-deploy and .ssh/wise2-deploy.pub)
- [ ] Public key added to server ~/.ssh/authorized_keys
- [ ] SSH access verified: `ssh -i ~/.ssh/wise2-deploy dwise@173.208.147.165`
- [ ] DEPLOY_HOST secret set to 173.208.147.165
- [ ] DEPLOY_USER secret set to dwise
- [ ] DEPLOY_KEY secret set to private key contents
- [ ] Docker secrets configured (DOCKER_USERNAME, DOCKER_PASSWORD)
- [ ] API secrets configured (Stripe, SendGrid)
- [ ] Database URL secret configured
- [ ] Test deployment triggered and successful

## Support

For SSH issues:
1. Verify all steps above completed
2. Check GitHub Actions logs for detailed error messages
3. Test SSH manually: `ssh -i ~/.ssh/wise2-deploy -v dwise@173.208.147.165`
4. Check server SSH logs: `ssh dwise@173.208.147.165 tail -f /var/log/auth.log`
