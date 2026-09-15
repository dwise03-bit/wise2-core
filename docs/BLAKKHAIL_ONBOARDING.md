# BLAKKHAIL.COM Onboarding Guide

**Project:** BLAKKHAIL (Legacy brand under SenCere Creative LLC)  
**Production URL:** https://blakkhail.com  
**Admin Contact:** sencere@wise2.net (ADMIN access)  
**Deployment Server:** 173.208.147.165  
**Last Updated:** 2026-09-15

---

## 1. Quick Start (Mac)

### 1.1 Prerequisites
- macOS 12.0 or later
- Node.js 20+ (`node --version`)
- pnpm 8.15.9 (`pnpm --version`)
- Git (`git --version`)
- SSH key pair (see Section 2)

### 1.2 Clone & Install (5 minutes)

```bash
# Clone the WISE² Core repo (monorepo containing blakkhail.com)
git clone https://github.com/wise2io/wise2-core.git
cd wise2-core

# Install dependencies (pnpm workspace)
pnpm install

# Navigate to website app
cd apps/website
```

### 1.3 Start Local Dev

```bash
# From wise2-core root:
pnpm dev

# Website runs at: http://localhost:3000
# BLAKKHAIL pages at: http://localhost:3000/sencere/blakkhail
```

✅ **You should see the BLAKKHAIL storefront with warm psychedelic vintage aesthetic**

---

## 2. Mac to VPS Connection (WISE²)

### 2.1 SSH Setup

#### Generate SSH key pair (if you don't have one)
```bash
ssh-keygen -t ed25519 -C "your-email@wise2.net"
# Press Enter for default location (~/.ssh/id_ed25519)
# Set a strong passphrase
```

#### Add your key to SSH agent
```bash
ssh-add ~/.ssh/id_ed25519
```

#### Share your public key
```bash
cat ~/.ssh/id_ed25519.pub
# Send to dwise03@gmail.com for server authorization
```

### 2.2 Connect to VPS

```bash
# Once your public key is authorized:
ssh dwise@173.208.147.165

# Verify connection
whoami    # Should print: dwise
pwd       # Should print: /home/dwise
```

### 2.3 VPS Directory Layout

```
/home/dwise/
├── wise2-core/              # Deploy target (git-tracked)
│   ├── apps/website/        # Next.js app (blakkhail.com)
│   ├── docker-compose.prod.yml
│   └── scripts/
│
└── wise2-core-backup/       # Backup cron source (DO NOT DELETE)
```

**CRITICAL:** Never delete `/home/dwise/wise2-core-backup/`. It's symlinked from `/opt/wise2-core` for daily backups.

### 2.4 Deploy blakkhail.com

```bash
# SSH into server
ssh dwise@173.208.147.165

# Pull latest code
cd wise2-core
git pull origin main

# Rebuild website container
docker-compose -f docker-compose.prod.yml up -d website

# Verify deployment
curl https://blakkhail.com
# Should return HTML (200 OK)
```

---

## 3. Project Structure (BLAKKHAIL)

### 3.1 Core Directories

```
wise2-core/
├── apps/website/
│   ├── app/sencere/blakkhail/
│   │   ├── layout.tsx           # Blakkhail layout + metadata
│   │   ├── page.tsx             # Homepage
│   │   ├── login/page.tsx       # Admin login
│   │   └── product/[id]/page.tsx # Product detail
│   │
│   ├── components/sencere/blakkhail/
│   │   ├── config.ts            # Brand config
│   │   ├── brand-tokens.ts      # Design tokens (colors, spacing)
│   │   ├── BlakkhailHeader.tsx  # Navigation
│   │   ├── BlakkhailHero.tsx    # Hero section
│   │   ├── BlakkhailTrust.tsx   # Social proof
│   │   ├── BlakkhailStory.tsx   # Brand narrative
│   │   ├── BlakkhailProducts.tsx # Product grid
│   │   ├── BlakkhailCheckout.tsx# Cart & payment
│   │   ├── BlakkhailFooter.tsx  # Footer
│   │   └── [15+ other components]
│   │
│   └── middleware.ts            # Domain routing (blakkhail.com → /sencere/blakkhail)
│
├── infrastructure/nginx/
│   ├── blakkhail.com.conf       # Nginx config (HTTPS, caching, compression)
│   └── blakkhail.store.conf     # (Reserved for future admin API)
│
└── docker-compose.prod.yml      # Production services
```

### 3.2 Key Files

| File | Purpose |
|------|---------|
| `apps/website/components/sencere/blakkhail/config.ts` | Brand identity (name, motto, contact) |
| `apps/website/components/sencere/blakkhail/brand-tokens.ts` | Color palette, typography, spacing |
| `apps/website/app/sencere/blakkhail/layout.tsx` | SEO metadata, OG tags |
| `infrastructure/nginx/blakkhail.com.conf` | HTTPS, caching, compression rules |

---

## 4. Architecture

### 4.1 Request Flow

```
User visits blakkhail.com
    ↓
nginx (173.208.147.165:443) → blakkhail.com.conf
    ↓
Proxy to 127.0.0.1:3001 (Next.js website)
    ↓
middleware.ts detects host=blakkhail.com
    ↓
Routes request to /sencere/blakkhail
    ↓
Next.js renders BlakkhailHero, BlakkhailProducts, etc.
    ↓
HTML + CSS + JS returned to browser
```

### 4.2 Multi-Brand Routing

BLAKKHAIL is part of the **SenCere Creative ecosystem**:
- **PIFF CITY** (flagship): /sencere/piff-city
- **BLAKKHAIL** (legacy): /sencere/blakkhail
- **VANDALS** (underground): /sencere/vandals

All brands share the same Next.js app. Routing is controlled via:
1. HTTP `Host` header (blakkhail.com vs piff-city.com)
2. Next.js middleware (`apps/website/middleware.ts`)
3. Brand-specific components (`components/sencere/blakkhail/`)

---

## 5. Development Workflow

### 5.1 Local Changes

```bash
# From wise2-core/apps/website:

# Edit a component
nano components/sencere/blakkhail/BlakkhailHero.tsx

# Watch will hot-reload (HMR)
# Visit http://localhost:3000/sencere/blakkhail to see changes

# Type-check
pnpm type-check

# Lint
pnpm lint
```

### 5.2 Common Tasks

#### Update Brand Colors
```typescript
// Edit: components/sencere/blakkhail/brand-tokens.ts
export const tokens = {
  primary: '#050607',        // Navy
  accent: '#00D9FF',         // Cyan
  neon: '#00FF7F',           // Neon green
  gold: '#C4A369',           // Gold
};
```

#### Add a Product
```typescript
// Edit: components/sencere/blakkhail/BlakkhailProducts.tsx
// (Products are currently mock data; integration with Stripe/admin API coming soon)
```

#### Update Hero Copy
```typescript
// Edit: components/sencere/blakkhail/BlakkhailHero.tsx
// Change tagline, description, CTA text
```

#### Modify Navigation
```typescript
// Edit: components/sencere/blakkhail/BlakkhailHeader.tsx
// Update links, menu structure, logo
```

### 5.3 Testing

```bash
# Type-check all TypeScript
pnpm type-check

# Run linter
pnpm lint

# Test in browser
# Local: http://localhost:3000/sencere/blakkhail
# Staging: (TBD)
# Production: https://blakkhail.com
```

---

## 6. Deployment

### 6.1 Deploy Workflow

```bash
# 1. Make changes locally
cd apps/website
nano components/sencere/blakkhail/BlakkhailHero.tsx

# 2. Test locally
# Visit http://localhost:3000/sencere/blakkhail

# 3. Commit & push
git add .
git commit -m "feat: update BLAKKHAIL hero copy"
git push origin main

# 4. SSH to server & deploy
ssh dwise@173.208.147.165
cd wise2-core
git pull origin main

# 5. Rebuild website container
docker-compose -f docker-compose.prod.yml up -d website

# 6. Verify
curl https://blakkhail.com
# Check that your changes are live
```

### 6.2 Deployment Checklist

- [ ] Changes tested locally on http://localhost:3000/sencere/blakkhail
- [ ] No type errors: `pnpm type-check`
- [ ] No lint errors: `pnpm lint`
- [ ] Git committed with clear message
- [ ] Pushed to main branch
- [ ] VPS: `git pull origin main`
- [ ] VPS: `docker-compose -f docker-compose.prod.yml up -d website`
- [ ] Verify at https://blakkhail.com (fresh browser tab or incognito)
- [ ] Check mobile responsiveness
- [ ] Verify all links work

### 6.3 Rollback (if something breaks)

```bash
# SSH to server
ssh dwise@173.208.147.165
cd wise2-core

# Revert to previous commit
git reset --hard HEAD~1
git push --force origin main

# Rebuild
docker-compose -f docker-compose.prod.yml up -d website

# Verify
curl https://blakkhail.com
```

---

## 7. Admin Backend

The BLAKKHAIL admin system is currently **disabled** but structured for future activation.

### 7.1 Current State
- Admin login route exists: `/sencere/blakkhail/login`
- API structure ready in: `packages/api/src/blakkhail.disabled/`
- Database schema ready for products, orders, customers

### 7.2 Future: Activate Admin (Planned)

When ready, enable admin backend:
```bash
# Move API module from disabled to active
mv packages/api/src/blakkhail.disabled packages/api/src/blakkhail

# Rebuild API
docker-compose -f docker-compose.prod.yml up -d api

# Access admin at: https://blakkhail.com/sencere/blakkhail/login
```

---

## 8. Troubleshooting

### 8.1 "Cannot connect to blakkhail.com"

```bash
# Check if nginx is running
ssh dwise@173.208.147.165
sudo systemctl status nginx

# Check if website container is running
docker-compose -f docker-compose.prod.yml ps | grep website

# Check logs
docker-compose -f docker-compose.prod.yml logs website
```

### 8.2 "Changes don't show up after deployment"

```bash
# Clear browser cache (Cmd+Shift+R on Mac)
# Or use incognito mode

# On server, verify container restarted
docker-compose -f docker-compose.prod.yml logs website | tail -20

# Force rebuild without cache
docker-compose -f docker-compose.prod.yml up -d --build website
```

### 8.3 "Local dev broken after npm/pnpm update"

```bash
# Clean install
pnpm clean
rm -rf node_modules
pnpm install

# Restart dev server
pnpm dev
```

### 8.4 "SSH key not authorized"

```bash
# Check public key is correct
cat ~/.ssh/id_ed25519.pub

# Contact dwise03@gmail.com to add your key to ~/.ssh/authorized_keys on server
```

---

## 9. Brand Guidelines

### 9.1 BLAKKHAIL Identity
- **Name:** Blakk Hail
- **Motto:** "Take Control • No Apologies"
- **Established:** 1994
- **Aesthetic:** Warm psychedelic vintage (legacy brand vibe)
- **Location:** SenCere headquarters
- **Parent brand:** SenCere Creative LLC

### 9.2 Color Palette
```
Navy:         #050607  (primary)
Cyan:         #00D9FF  (accent)
Neon Green:   #00FF7F  (highlight)
Gold:         #C4A369  (luxury accent)
```

See `components/sencere/blakkhail/brand-tokens.ts` for all tokens.

### 9.3 Typography
- Display: [Check brand-tokens.ts]
- Body: [Check brand-tokens.ts]
- All fonts defined in Tailwind config

---

## 10. Support & Contacts

| Role | Contact | Purpose |
|------|---------|---------|
| **Owner** | dwise03@gmail.com | Architecture decisions, VPS access, deployments |
| **Admin** | sencere@wise2.net | Brand strategy, product decisions, SenCere ecosystem |
| **Discord** | Channel 1526930658738573316 | Deployment notifications, updates |

### Questions?
1. Check this guide (Cmd+F to search)
2. Read comments in code (`components/sencere/blakkhail/*.tsx`)
3. Contact owner

---

## 11. Next Steps

1. **Clone repo & run locally** (Section 1.2)
2. **Set up SSH access** (Section 2.1-2.2)
3. **Make a test change** (Section 5.1)
4. **Deploy to production** (Section 6.1)
5. **Read the code** (Key components in Section 3)
6. **Ask questions** (Section 10)

Welcome to BLAKKHAIL! 🚀
