# 🎬 BLAKKHAIL Storefront - Customer Handoff

**Status:** Production-ready, locally verified, ready for takeover  
**Date:** 2026-09-28  
**Version:** 1.0 (Placeholder Heroes Edition)

---

## 📦 What You're Getting

A fully-functional BLAKKHAIL storefront with:
- **Cinematic hero section** with animated lightning effects
- **Placeholder body templates** (ready for custom apparel photos)
- **Responsive design** that works on all devices
- **Production deployment** ready at `blakkhail.com`
- **One-command Mac setup** for local development

---

## 🚀 Quick Start (60 seconds)

### 1. Download & Extract
```bash
# Download the blakkhail-setup.zip file
# Double-click to extract or:
unzip blakkhail-setup.zip
cd blakkhail-setup
```

### 2. Start Docker Desktop
Open **Applications → Docker.app**  
Wait 30 seconds for it to start

### 3. Run Setup
```bash
./setup-blakkhail-mac.sh
```

### 4. Access
Open your browser: **http://localhost:3001/sencere/blakkhail**

---

## 📸 What You'll See

```
┌─────────────────────────────────────────┐
│  [SenCere Creative]                     │
│                                         │
│        TAKE CONTROL                     │
│        NO APOLOGIES                     │
│                                         │
│  Legacy apparel. Original designs.      │
│  Built for the culture.                 │
│                                         │
│              ↓ SCROLL ↓                 │
└─────────────────────────────────────────┘
```

- ⚡ Lightning bolts animating on sides
- 👥 Placeholder rectangles (where models/apparel will go)
- 💎 Premium text styling with glows
- 🎯 Responsive, production-grade effects

---

## 🛠️ Key Files

Inside `blakkhail-setup.zip`:

```
blakkhail-setup/
├── setup-blakkhail-mac.sh      # One-click installer
└── README.md                   # Full documentation
```

---

## 📝 Common Tasks

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs website
```

### Stop Server
```bash
docker-compose -f docker-compose.prod.yml down
```

### Edit Hero Component
File: `apps/website/components/sencere/blakkhail/BlakkhailHero.tsx`

Key sections:
- **Lightning effects:** Lines 39-82 (6 animated bolts)
- **Placeholder rectangles:** Background image at lines 104-123
- **Text overlay:** Lines 153-213
- **Animations:** Lines 249-353

### Replace Placeholder Images
1. Prepare your hero image as `.webp` (~400-500KB)
2. Place at: `apps/website/public/sencere-assets/blakkhail/sencere-hero-composite.webp`
3. Rebuild: `docker-compose -f docker-compose.prod.yml build --no-cache website`

---

## 🔧 Troubleshooting

### "Docker daemon not running"
→ Open Docker Desktop from Applications folder

### "Port 3001 already in use"
→ Kill existing container:
```bash
docker ps | grep wise2-website
docker stop <container-id>
```

### "502 Bad Gateway"
→ Server is still starting, wait 10 seconds and refresh

### "Can't connect to localhost"
→ Verify Docker is running:
```bash
docker ps
```

---

## 🎨 Customization Guide

### Change Text Colors
Edit `BlakkhailHero.tsx`:
- Gold `#C4A369` → your color
- Cyan `#00D9FF` → your color
- Red `#FF4444` → your color

### Adjust Lightning Intensity
Lines 48-50:
```tsx
animation: `lightningBolt ${3 + i * 0.4}s ...` // Increase duration to slow down
opacity: 0.8,  // Reduce to make subtler
```

### Remove/Add Effects
- **Lightning bolts:** Edit line 41 `[1, 2, 3, 4, 5, 6]` (6 = number of bolts)
- **Animations:** Comment out `@keyframes` sections (lines 249-353)

### Brand Colors (LOCKED)
- Navy: `#050607`
- Cyan: `#00D9FF`
- Neon Green: `#00FF7F`
- Gold: `#C4A369`

---

## 📊 Verification Checklist

Before going live, verify:

- [ ] Local setup runs without errors (`./setup-blakkhail-mac.sh`)
- [ ] Hero loads at `http://localhost:3001/sencere/blakkhail`
- [ ] Lightning effects animate smoothly
- [ ] Text displays correctly (TAKE CONTROL, NO APOLOGIES)
- [ ] Placeholder rectangles visible
- [ ] Page scrolls without freezing
- [ ] Responsive on mobile (resize browser to 375px width)
- [ ] No console errors (F12 → Console tab)

---

## 🚀 Deployment

### To Production (blakkhail.com)

1. **Prepare your hero image** (custom apparel photo)
2. **Update GitHub** with your changes
3. **Deploy via CI/CD**:
   ```bash
   git push origin main
   ```
   (Automatically deploys to blakkhail.com via GitHub Actions)

### Manual Deployment (if needed)

```bash
# On your production server:
cd /path/to/wise2-core
git pull origin main
docker-compose -f docker-compose.prod.yml up -d website --build
```

---

## 📞 Support

### Getting Help
1. Check the logs: `docker-compose logs website`
2. Try restarting Docker Desktop
3. Run setup script again: `./setup-blakkhail-mac.sh`

### Reporting Issues
Include:
- Error message from console
- Screenshot of the issue
- Output from `docker ps`

---

## 💡 Next Steps

1. ✅ Run local setup (`./setup-blakkhail-mac.sh`)
2. ✅ Verify hero displays correctly
3. ✅ Prepare your custom hero image
4. 📝 Update placeholder with your apparel photos
5. 🎨 Adjust colors/effects to match your brand
6. 🚀 Deploy to production

---

## 🔐 Credentials

**Local Testing:**
- URL: `http://localhost:3001/sencere/blakkhail`
- No auth required for storefront

**Admin Access (if needed):**
- Email: `dwise03@gmail.com`
- Password: `BlakkhailAdmin2026`

---

## 📄 License & Ownership

- **Storefront Code:** Ready for production
- **Brand Assets:** Locked (do not modify colors/fonts without approval)
- **Customizable:** Hero images, text content, layout adjustments

---

**Questions?** Refer to `README.md` in the setup folder for detailed documentation.

**Ready to launch?** Good luck with BLAKKHAIL! 🎬
