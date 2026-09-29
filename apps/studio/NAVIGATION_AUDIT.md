# Navigation Architecture Audit & Consolidation Plan

## Current Problem: Duplicated & Confusing Structure

### Pages That Exist
```
/                          Home page (Daniel featured)
/studio                    Creative Studio (7 modules: CC, SL, LV, JL, VL, CF, SH)
/studio?module=X           Module switching via query param
/soundlab                  Sound Lab (DUPLICATE - also in /studio)
/soundlab/demo             Demo page (redundant)
/live-studio               Live Studio (DUPLICATE - also in /studio)
/live-streaming            Old name for live-studio? (DUPLICATE)
/creative-studio           Old path? (DUPLICATE)
/dashboard                 Separate dashboard
/auth                      Login/signup
/pricing                   Pricing page
/shop                      Shop/store
/apps                      Unclear purpose
/meter-demo                Demo page
/sitemap                   Navigation sitemap
/demo/meters               Demo (DUPLICATE path?)
```

## The Issue
- ✗ `/soundlab` is both standalone AND in `/studio`
- ✗ `/live-studio` is both standalone AND in `/studio`  
- ✗ `/live-streaming` & `/creative-studio` are old duplicates
- ✗ No clear navigation hierarchy
- ✗ Users confused which path to use
- ✗ Multiple entry points for same feature

## Solution: Unified Navigation Architecture

### Tier 1: Main Entry Points (Top-level URLs)
```
/                  Home page + CTA to Creative Studio
/studio            MAIN APP (all production features)
/dashboard         Analytics & settings (if separate)
```

### Tier 2: Creative Studio Modules (Within /studio via sidebar)
All accessible from `/studio` with left sidebar buttons:
```
/studio?module=cc      Command Center (Analytics)
/studio?module=sl      Sound Lab (Professional Audio)
/studio?module=lv      Live Studio (OBS Streaming)
/studio?module=jl      Jingle Lab (Quick Audio)
/studio?module=vl      Voice Lab (Synthesis)
/studio?module=cf      Content Factory (Batch Gen)
/studio?module=sh      Client Showcase (Portfolio)
/studio?module=gen     Music Generation (Suno features)
```

### Tier 3: Supporting Pages (Keep minimal)
```
/auth              Login / Signup
/pricing           Pricing information
/shop              Purchase credits
/sitemap           Navigation reference (useful for users lost)
```

### Tier 4: REMOVE (Deprecated)
```
/soundlab          DELETE - move to /studio?module=sl
/soundlab/demo     DELETE - demo features go in sidebar
/live-studio       DELETE - move to /studio?module=lv
/live-streaming    DELETE - duplicate of live-studio
/creative-studio   DELETE - use /studio instead
/apps              DELETE - unclear purpose
/meter-demo        DELETE - demo content only
/demo/meters       DELETE - consolidate to /studio
/dashboard         MAYBE - could be /studio?module=dashboard
```

## Navigation Flow (Clean & Logical)

```
HOME (/)
  ↓
  [Enter Studio] button
    ↓
  CREATIVE STUDIO (/studio)
    ├─ Sidebar: Module buttons (CC, SL, LV, JL, VL, CF, SH, Gen)
    ├─ Main area: Active module content
    ├─ Top bar: WISE² branding, user profile, settings
    └─ Every module accessible from sidebar
    
SUPPORT PAGES
  ├─ /auth (Login/Signup) - shown if not authenticated
  ├─ /pricing - from home page or studio menu
  ├─ /shop - from studio credit system
  └─ /sitemap - navigation help
```

## Implementation Steps

1. **Consolidate Sound Lab**
   - Keep `/studio` as main entry
   - Remove `/soundlab` and `/soundlab/demo` (separate routes)
   - Access via `/studio?module=sl` instead

2. **Consolidate Live Studio**
   - Keep `/studio` as main entry
   - Remove `/live-studio` and `/live-streaming`
   - Access via `/studio?module=lv` instead

3. **Clean up old paths**
   - Delete `/creative-studio` (use `/studio` instead)
   - Delete `/apps` (unclear purpose)
   - Delete demo pages (integrate into `/studio`)

4. **Add Music Generation module**
   - Add `/studio?module=gen` for Suno features
   - Consolidate with Sound Lab UI

5. **Update navigation**
   - Home page: Single "Enter Studio" button → `/studio`
   - Studio sidebar: All modules accessible
   - No external `/soundlab` or `/live-studio` routes

## Result: Clean Navigation Tree

```
wise2.net/                    → Home + "Enter Studio" CTA
  └─ /studio                  → Creative Studio (Main App)
      ├─ ?module=cc           → Command Center
      ├─ ?module=sl           → Sound Lab (Professional Audio)
      ├─ ?module=lv           → Live Studio (OBS Streaming)  
      ├─ ?module=jl           → Jingle Lab
      ├─ ?module=vl           → Voice Lab
      ├─ ?module=cf           → Content Factory
      ├─ ?module=sh           → Client Showcase
      └─ ?module=gen          → Music Generation (Suno)

Support:
  ├─ /auth                    → Login/Signup
  ├─ /pricing                 → Pricing page
  ├─ /shop                    → Shop/Credits
  └─ /sitemap                 → Navigation help
```

## Benefits
- ✅ Single entry point (`/studio`)
- ✅ All features accessible from sidebar
- ✅ No duplicate pages
- ✅ Clear navigation hierarchy
- ✅ Less confusion
- ✅ Easier to maintain
- ✅ Mobile-friendly (sidebar collapses)

## Files to Delete
- `app/soundlab/` → move UI to `/studio` module
- `app/live-studio/` → move UI to `/studio` module
- `app/live-streaming/` → delete completely
- `app/creative-studio/` → delete completely
- `app/apps/` → delete completely
- `app/meter-demo/` → delete completely
- `app/demo/` → delete completely

## Files to Update
- `app/page.tsx` → Keep home, single "Enter Studio" link
- `components/CreativeStudioLayout.tsx` → Keep as main `/studio` shell
- Navigation to use `/studio?module=X` query params
- Sidebar buttons → Link to `/studio?module=X`

**Status**: Ready to implement
