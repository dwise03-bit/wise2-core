# WISE² Website Deployment Guide

## Production Build

```bash
npm run build
```

**Build Output:**
- Page size: 44.2 kB (optimized)
- First Load JS: 131 kB (shared chunks + page)
- Build time: ~15-20s
- Static prerendering: Enabled for homepage

## Deployment to Vercel

### Prerequisites
- Vercel account connected to GitHub
- Environment variables configured in Vercel dashboard

### Environment Variables (Production)
```
NEXT_PUBLIC_SITE_URL=https://wise2.net
NEXT_PUBLIC_API_URL=https://api.wise2.net
NEXT_PUBLIC_ANALYTICS_ID=G-WISE2NET
```

### Deploy Steps
1. Push changes to main branch
2. Vercel auto-deploys on commit
3. Deployment URL: https://wise2.vercel.app (preview)
4. Production domain: https://wise2.net (configured in vercel.json)

## Production Optimizations

### Performance Features
- ✅ Image optimization (AVIF/WebP formats)
- ✅ Gzip compression enabled
- ✅ Cache headers configured (3600s max-age)
- ✅ Static asset caching (31536000s for _next/static/)
- ✅ Production browser source maps disabled
- ✅ SWC minification enabled
- ✅ Package import optimization enabled

### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: geolocation=(), microphone=(), camera=()

### Caching Strategy
- **Dynamic API routes:** no-cache, no-store, must-revalidate
- **Static assets (_next/static/):** Immutable, 1-year cache
- **HTML pages:** 1-hour cache + stale-while-revalidate (1 day)

## Monitoring

### Recommended Services
- **Analytics:** Google Analytics (configured in code)
- **Error tracking:** Sentry or Rollbar
- **Performance:** Vercel Analytics (built-in)

### Health Check
```bash
curl -I https://wise2.net
# Expected: 200 OK, Cache-Control header present
```

## Database/API Integration

When API is ready, add to environment:
```
NEXT_PUBLIC_API_URL=https://api.wise2.net
```

Update `lib/api.ts` with authentication headers and endpoints.

## Rollback Procedure

In Vercel Dashboard:
1. Go to Deployments
2. Select previous deployment
3. Click "Promote to Production"

## Performance Targets

- **Lighthouse Score:** 90+
- **First Contentful Paint (FCP):** <1.5s
- **Largest Contentful Paint (LCP):** <2.5s
- **Cumulative Layout Shift (CLS):** <0.1

Check with: `npm run analyze` (requires @next/bundle-analyzer)

## Support

For deployment issues:
- Check Vercel build logs
- Verify environment variables
- Clear browser cache (Ctrl+Shift+Delete)
- Test locally with `npm run build && npm start`
