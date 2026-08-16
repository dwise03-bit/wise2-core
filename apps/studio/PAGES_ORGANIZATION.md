# WISE² Studio - Page Organization

## 📋 Page Hierarchy

### Main Entry Points
- **`/`** → Redirects to `/studio`
- **`/studio`** → Creative Studio (main app with 7 modules via state management)

### Creative Studio Modules (at `/studio`)
All 7 modules accessible via sidebar buttons:
1. **CC** - Command Center (Analytics dashboard)
2. **SL** - Sound Lab (Professional audio production)
3. **LV** - Live Studio (Live streaming control)
4. **JL** - Jingle Lab (Short audio creation)
5. **VL** - Voice Lab (Voice synthesis/cloning)
6. **CF** - Content Factory (Batch content generation)
7. **SH** - Client Showcase (Portfolio/case studies)

### Phase 2 - Professional Audio Production
- **`/soundlab`** → Sound Lab main interface (Phase 2.0)
- **`/soundlab/demo`** → Phase 2.1 integration demo

### Demos & Testing
- **`/demo/meters`** → Meter system demo (Phase 1)
  - Also accessible at `/meter-demo` (legacy path)

### Support Pages
- **`/auth`** → Authentication (login/signup)
- **`/dashboard`** → Dashboard view (if separate from studio)
- **`/pricing`** → Pricing information
- **`/shop`** or **`/webstore`** → Shop/store (consolidate one)

---

## 📁 Directory Structure

```
/apps/studio/app/
├── page.tsx                 # Root (redirects to /studio)
├── layout.tsx               # Root layout
├── studio/
│   └── page.tsx            # Main Creative Studio (ALL 7 MODULES HERE)
├── soundlab/
│   ├── page.tsx            # Sound Lab main (Phase 2.0)
│   └── demo/
│       └── page.tsx        # Phase 2.1 integration demo
├── demo/
│   └── meters/
│       └── page.tsx        # Meter system demo
├── auth/
│   └── page.tsx            # Authentication
├── dashboard/
│   └── page.tsx            # Dashboard
├── pricing/
│   └── page.tsx            # Pricing
└── shop/
    └── page.tsx            # Shop
```

---

## 🚀 Quick Navigation

### For Users
- **Start here**: http://localhost:3005 → redirects to `/studio`
- **Creative Studio**: http://localhost:3005/studio
- **Sound Lab**: http://localhost:3005/soundlab
- **Demos**: http://localhost:3005/demo/meters

### For Developers
- All 7 modules are in ONE page `/studio` (state-based switching)
- Sound Lab is separate at `/soundlab` (Phase 2 feature)
- Demos organized under `/demo/` prefix

---

## ⚠️ Pages to Remove/Consolidate

- **`/creative-studio`** → Duplicate, use `/studio` instead
- **`/live-studio`** → Now part of `/studio` (LV module)
- **`/live-streaming`** → Duplicate/deprecated
- **`/jingle-lab`** → Now part of `/studio` (JL module)
- **`/voice-lab`** → Now part of `/studio` (VL module)
- **`/content-factory`** → Now part of `/studio` (CF module)
- **`/showcase`** → Now part of `/studio` (SH module)
- **`/apps`** → Unclear purpose, review for removal
- **`/meter-demo`** → Keep but consider renaming to `/demo/meters`
- **`/webstore`** → Consolidate with `/shop`
- **`/workspace`** → Unclear purpose, review for removal

---

## 🔄 State Management

### Creative Studio (`/studio`)
Uses **Zustand** (`creativeStudioStore`) for state management:
- Current page (command|sound|live|jingle|voice|factory|showcase)
- UI state (palette open/close, notifications, profile menu)
- User data (credits, viewers, stream status)

### Sound Lab (`/soundlab`)
Uses **React hooks** for state management:
- Audio engine state
- Track/clip data
- Playback state

---

## 📝 Summary

✅ **All 7 Creative Studio modules work through state-based page switching at `/studio`**  
✅ **Sound Lab is properly organized at `/soundlab` with demo at `/soundlab/demo`**  
✅ **Root page now redirects cleanly to `/studio`**  
✅ **Demo pages organized under `/demo/` prefix**  

Next: Remove duplicate/deprecated pages and consolidate shop pages.
