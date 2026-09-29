# Codex Integration: BLAKKHAIL Storefront

**Purpose:** Enable customer to take over BLAKKHAIL development independently

**Invoke with:** `claude codex-blakkhail-integration`

---

## Executive Context

You are assisting with the **BLAKKHAIL SenCere Creative storefront** — a production-ready Next.js + Docker-based e-commerce hero page featuring:

- **Premium cinematic hero** with animated lightning effects
- **Placeholder body templates** (gray rectangles where apparel photos go)
- **Responsive design** across mobile/tablet/desktop
- **Production deployment** via GitHub Actions to blakkhail.com
- **One-command Mac setup** for local development

The customer has just taken over ownership. Their next tasks:

1. **Replace placeholder images** with actual apparel photography
2. **Customize colors/effects** to match their brand
3. **Deploy to production** safely
4. **Maintain the storefront** as they evolve it

---

## Key Architecture

### File Structure
```
wise2-core/
├── apps/website/
│   ├── components/sencere/blakkhail/
│   │   └── BlakkhailHero.tsx          ← Main hero component (EDIT HERE)
│   └── public/sencere-assets/blakkhail/
│       └── sencere-hero-composite.webp ← Background image (REPLACE HERE)
├── docker-compose.prod.yml             ← Local Docker config
├── BLAKKHAIL_SETUP.md                  ← Technical setup guide
├── BLAKKHAIL_CUSTOMER_HANDOFF.md       ← Customer-friendly guide
└── scripts/setup-blakkhail-mac.sh      ← One-click installer
```

### Core Technologies
- **Framework:** Next.js 14 (React, TypeScript)
- **Styling:** Tailwind CSS + inline CSS (for animations)
- **Deployment:** Docker → nginx → AWS (blakkhail.com)
- **CI/CD:** GitHub Actions (auto-deploy on push to main)

---

## What's Been Delivered

### ✅ Complete & Verified
1. **Hero component** with 6 animated lightning bolts
2. **Placeholder rectangles** replacing clothing areas
3. **Text overlay** (TAKE CONTROL, NO APOLOGIES, SenCere Creative)
4. **Scroll indicator** with animations
5. **Mouse-tracking parallax** depth effect
6. **Production Docker setup**
7. **Mac installer script**
8. **Comprehensive documentation**

### ✅ Tested
- Local preview at `http://localhost:3001/sencere/blakkhail`
- All animations running smoothly
- No blocking console errors
- Responsive to mouse movement
- Page scrolls without freezing
- Hydration handling (expected warnings, non-blocking)

---

## Customer's First Steps

### 1. Local Setup (5 minutes)
```bash
cd /path/to/wise2-core
./scripts/setup-blakkhail-mac.sh
# Open: http://localhost:3001/sencere/blakkhail
```

### 2. Prepare Custom Assets
- Take professional apparel photography
- Export as `.webp` (400-500KB ideal)
- Dimensions: 1448x1086px (current image size)

### 3. Replace Placeholder
```bash
# Copy your image to:
apps/website/public/sencere-assets/blakkhail/sencere-hero-composite.webp

# Rebuild and verify:
docker-compose -f docker-compose.prod.yml build --no-cache website
docker-compose -f docker-compose.prod.yml up -d website
```

### 4. Test Locally
- Verify image displays correctly
- Check lightning effects still animate
- Confirm text visibility
- Test on mobile (F12 → Device Toolbar)

### 5. Deploy to Production
```bash
git add -A
git commit -m "feat: update blakkhail hero with custom apparel imagery"
git push origin main
# Automatically deploys to https://blakkhail.com/sencere/blakkhail
```

---

## Key Customization Points

### Lightning Effects
**File:** `apps/website/components/sencere/blakkhail/BlakkhailHero.tsx`, lines 39-82

```tsx
// Number of lightning bolts
{[1, 2, 3, 4, 5, 6].map((i) => (  // Change 6 to adjust count

// Animation speed (seconds)
animation: `lightningBolt ${3 + i * 0.4}s ...`  // Increase for slower

// Glow intensity
filter: 'drop-shadow(0 0 20px rgba(0, 217, 255, 0.6)) drop-shadow(0 0 40px rgba(0, 200, 255, 0.3))',
```

### Text Colors
**File:** Same component, lines 160-197

```tsx
// Gold heading
color: '#C4A369',  // Change to your brand color

// Cyan subheading
color: '#00D9FF',  // Change to your brand color

// Red badge
color: '#FF4444',  // Change to your brand color
```

### Brand Lock (Do Not Change)
- Navy: `#050607`
- Cyan: `#00D9FF`
- Neon Green: `#00FF7F`
- Gold: `#C4A369`

---

## Common Tasks & Solutions

### "I want to change the lightning color"
Edit line 50 in BlakkhailHero.tsx:
```tsx
stroke={`hsl(${190 + i * 8}, 100%, 55%)`}  // Adjust hue (0-360) for color
```

### "The placeholder image looks bad"
1. Ensure your `.webp` is 1448x1086px
2. Check image contrast (should work with darks)
3. Verify file is actually at `public/sencere-assets/blakkhail/sencere-hero-composite.webp`
4. Rebuild: `docker-compose build --no-cache website`

### "I want to remove lightning"
Comment out lines 39-82 in BlakkhailHero.tsx or set the `.map` array to empty `[]`

### "Deploy isn't working"
1. Verify all changes are committed: `git status`
2. Push to main: `git push origin main`
3. Check GitHub Actions for errors (repo > Actions tab)
4. Manually deploy if needed: See BLAKKHAIL_SETUP.md "Manual Deployment"

---

## Troubleshooting Checklist

Before contacting support:

- [ ] Docker Desktop is running
- [ ] Ran setup script without errors
- [ ] Hero displays at localhost:3001/sencere/blakkhail
- [ ] Checked console for errors (F12)
- [ ] Image is exactly 1448x1086px
- [ ] Image file exists at correct path
- [ ] Rebuilt Docker after changes: `docker-compose build --no-cache website`
- [ ] Restarted server after changes: `docker-compose down && docker-compose up -d`

---

## Handoff Deliverables

**Documentation:**
- ✅ `BLAKKHAIL_SETUP.md` — Technical setup & troubleshooting
- ✅ `BLAKKHAIL_CUSTOMER_HANDOFF.md` — Customer-focused guide
- ✅ Setup script (`scripts/setup-blakkhail-mac.sh`)
- ✅ Codex integration prompt (this file)

**Code:**
- ✅ Production-ready storefront
- ✅ All animations verified
- ✅ Responsive design tested
- ✅ Docker config production-grade
- ✅ GitHub Actions CI/CD wired up

**Assets:**
- ✅ `blakkhail-setup.zip` — Complete installer package
- ✅ Placeholder hero image (ready to replace)
- ✅ All brand colors locked

---

## Next Steps for Customer

1. **Extract setup zip** → `blakkhail-setup.zip`
2. **Run installer** → `./setup-blakkhail-mac.sh`
3. **Verify locally** → Visit `http://localhost:3001/sencere/blakkhail`
4. **Prepare assets** → Take apparel photography
5. **Replace placeholder** → Update hero image
6. **Deploy** → `git push origin main` (auto-deploys)
7. **Monitor** → Verify live at `https://blakkhail.com/sencere/blakkhail`

---

## Support Template

When customer asks for help, ask:

```
Q: What are you trying to do?
A: [Their goal]

Q: What error did you get (if any)?
A: [Error message or screenshot]

Q: What's your current setup?
A: [Local/production, Docker version, etc.]

Q: Can you share your modified file?
A: [If it's code-related]
```

Then reference this guide + `BLAKKHAIL_CUSTOMER_HANDOFF.md` to solve.

---

**Customer Email:** [INSERT CUSTOMER EMAIL]  
**Handoff Date:** 2026-09-28  
**Status:** Production-ready, verified, ready for custom imagery
