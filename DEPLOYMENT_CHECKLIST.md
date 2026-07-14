# WISE² Deployment Checklist

## Pre-Deployment ✅

- [x] Build verification: `npm run build` ✅ Clean
- [x] Environment configuration: `.env.production` ✅ Ready
- [x] Vercel config: `vercel.json` ✅ Ready
- [x] Security headers: Configured ✅
- [x] Performance optimized: Build metrics verified ✅
- [x] Documentation: Complete ✅
- [x] Git history: All commits pushed ✅

## Deployment Methods

### Option 1: Automatic Deployment (Recommended)
Connect GitHub repo to Vercel. Every push to `main` auto-deploys.

**Steps:**
1. Go to https://vercel.com/new
2. Import this GitHub repository
3. Set project name: `wise2`
4. Framework: `Next.js`
5. Build command: `npm run build`
6. Output directory: `.next`
7. Environment variables:
   - `NEXT_PUBLIC_SITE_URL=https://wise2.net`
   - `NEXT_PUBLIC_API_URL=https://api.wise2.net`
   - `NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET`
8. Click Deploy

**Result:** 
- Preview: https://wise2.vercel.app
- Auto-deployed on every GitHub push

### Option 2: Manual Deployment via CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd /Users/danielwise/Projects/wise2-core

# Deploy
vercel --prod \
  --env NEXT_PUBLIC_SITE_URL=https://wise2.net \
  --env NEXT_PUBLIC_API_URL=https://api.wise2.net \
  --env NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
```

### Option 3: Automated Script (Easiest)
```bash
cd /Users/danielwise/Projects/wise2-core
./deploy.sh
```

The script:
- Verifies build
- Checks environment
- Deploys to Vercel
- Verifies live deployment
- Shows next steps

---

## Post-Deployment

### Verify Deployment
```bash
curl -I https://wise2.vercel.app

# Expected response:
# HTTP/1.1 200 OK
# Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### Domain Configuration
1. Go to https://vercel.com/dashboard
2. Select `wise2` project
3. Settings → Domains
4. Add domain: `wise2.net`
5. Follow DNS instructions for your registrar
   - Add CNAME record pointing to `wise2.vercel.app`
   - Or update nameservers to Vercel's

### SSL Certificate (Automatic)
Vercel automatically provisions SSL via Let's Encrypt. Redeploy after domain configuration:
```bash
vercel --prod
```

### Monitoring
1. **Vercel Dashboard:** https://vercel.com/dashboard
2. **Analytics:** https://vercel.com/analytics
3. **Deployments:** https://vercel.com/dashboard/deployments
4. **Error tracking:** Sentry (optional, requires setup)

---

## Performance Verification

After deployment, check:

### 1. Lighthouse Score
- Open https://wise2.vercel.app in Chrome
- DevTools → Lighthouse
- Run audit
- Target: Performance 90+, Accessibility 95+

### 2. Core Web Vitals
- Go to https://web.dev/measure/
- Enter https://wise2.vercel.app
- Check metrics:
  - LCP: <2.5s ✅
  - FID: <100ms ✅
  - CLS: <0.1 ✅

### 3. Speed Test
- Visit https://pagespeed.web.dev/
- Enter https://wise2.vercel.app
- Verify mobile and desktop scores

---

## Security Verification

### 1. Security Headers
```bash
curl -I https://wise2.vercel.app | grep -i "X-"
```

Expected headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block

### 2. HTTPS
```bash
curl -I https://wise2.vercel.app | grep -i "strict"
# Should show: Strict-Transport-Security
```

### 3. SSL Certificate
- Open https://wise2.vercel.app
- Check padlock icon (green)
- Click certificate to verify validity

---

## Rollback Plan

If deployment has issues:

### Option 1: Revert to Previous Commit
```bash
git log --oneline -5
git revert <commit-hash>
git push
# Vercel auto-redeploys previous version
```

### Option 2: Rollback in Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select `wise2`
3. Go to Deployments
4. Click previous successful deployment
5. Click "Promote to Production"

### Option 3: Emergency Downtime
If critical issues:
```bash
# Temporarily take site down
vercel env add NODE_ENV production_down
vercel --prod
# Add maintenance page
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Site loads without errors
- [ ] Animations smooth
- [ ] Mobile responsive
- [ ] No console errors

### Weekly Checks
- [ ] Vercel dashboard logs
- [ ] Performance metrics
- [ ] Error tracking (if configured)
- [ ] Uptime status

### Monthly Checks
- [ ] Lighthouse audit
- [ ] Security scan
- [ ] Dependency updates
- [ ] Analytics review

---

## Post-Launch Enhancements

After going live, consider:

1. **Analytics Integration**
   - Google Analytics: Already configured in code
   - Vercel Analytics: Enable in dashboard
   - Hotjar: User behavior tracking

2. **Error Tracking**
   - Sentry: JavaScript error reporting
   - Vercel Logs: Built-in error logs

3. **Performance Monitoring**
   - Real User Monitoring (RUM)
   - Synthetic monitoring
   - Alert configuration

4. **SEO**
   - Submit sitemap to Google Search Console
   - Monitor search rankings
   - Check Core Web Vitals signals

5. **Backup & Disaster Recovery**
   - GitHub repository is the backup
   - Enable GitHub branch protection
   - Review and approve PRs before merge

---

## Support & Troubleshooting

### Common Issues

**1. Build Fails**
```bash
# Check build locally
npm run build
# Review error message
# Fix issue
git push # Auto-redeploys in Vercel
```

**2. Slow Performance**
```bash
# Check bundle size
npm run analyze
# Check if images optimized
# Clear Vercel cache: Dashboard → Settings → Purge Cache
```

**3. Deploy Stuck**
```bash
# Trigger new deployment
git commit --allow-empty -m "trigger deployment"
git push
# Or manually redeploy in Vercel Dashboard
```

**4. Domain Not Working**
- Wait 24-48 hours for DNS propagation
- Check DNS records in registrar
- Verify CNAME points to vercel.app
- Check Vercel dashboard for domain status

### Support Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project README: `/apps/website/README.md`
- Deployment Guide: `/apps/website/DEPLOYMENT.md`

---

## Final Sign-Off

- [ ] Build successful
- [ ] Environment variables set
- [ ] Vercel project created
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Performance verified
- [ ] Security headers confirmed
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Launch complete ✅

---

**Deployment Status:** Ready for production launch 🚀

For questions, refer to:
- DEPLOYMENT.md - Detailed deployment guide
- README.md - Project documentation
- TESTING.md - Testing procedures
