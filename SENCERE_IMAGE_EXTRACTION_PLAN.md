# SenCere Creative LLC — Image Extraction & Asset Plan

**Reference Source**: Client-provided screenshot (locked design reference)  
**Date**: 2026-08-23  
**Status**: 🔒 DESIGN LOCKED — Ready for asset acquisition

---

## Images Visible in Reference Screenshot

### 1. Hero Section — PIFF CITY Rabbit
**Status**: ✅ **EXTRACTED & IN USE**
- **Source**: Reference screenshot (right side of hero)
- **Current File**: `piff-city-rabbit.jpeg` (459KB, 1103×1426px)
- **Implementation**: Next.js Image component with priority loading
- **Quality**: Production-ready, high resolution

---

### 2. Brand Showcase Cards (3-card section)

#### BLAKKHAIL Card
- **Visible in Reference**: YES (left card)
- **Visual Style**: Dark heritage aesthetic
- **Colors**: Gold/brown tones, skull motif suggested
- **Text Overlay**: "BLAKKHAIL / LEGACY / ORIGIN"
- **Status**: ⏳ **NEEDS IMAGE**
- **Approach**: 
  - Option A: Abstract/texture background with brand elements
  - Option B: Graffiti/street art aesthetic
  - Option C: Vintage poster/heritage imagery

#### PIFF CITY Card
- **Visible in Reference**: YES (center card)
- **Visual Style**: Bright, energetic psychedelic aesthetic
- **Colors**: Gold (#E8A23A), warm tones
- **Text Overlay**: "PIFF CITY / THE FLAGSHIP BRAND"
- **Status**: ⏳ **NEEDS IMAGE**
- **Approach**:
  - Use rabblit mascot imagery
  - Psychedelic patterns/backgrounds
  - Street art aesthetic

#### PIFF CITY VANDALS Card
- **Visible in Reference**: YES (right card)
- **Visual Style**: Dark underground aesthetic
- **Colors**: Purple (#5B2D7F), dark tones
- **Text Overlay**: "PIFF CITY VANDALS / THE UNDERGROUND"
- **Status**: ⏳ **NEEDS IMAGE**
- **Approach**:
  - Street art/graffiti imagery
  - Underground culture aesthetic
  - Dark, rebellious mood

---

### 3. Featured Collection Grid (6 products)

**Visible in Reference**: YES (6-product grid, 2 rows × 3 columns)

#### Product 1: PIFF CITY RABBIT HOODIE ($79.99)
- **Badge**: "Best Seller"
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: Hoodie with rabbit graphics
- **Colors**: Gold/black with rabbit mascot

#### Product 2: VANDALS TIE DYE TEE ($44.99)
- **Badge**: None
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: Tie-dye t-shirt with vandals branding
- **Colors**: Purple/tie-dye with text print

#### Product 3: PIFF CITY SNAPBACK ($34.99)
- **Badge**: None
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: Baseball cap/snapback
- **Branding**: "PIFF CITY" text on front

#### Product 4: THREE-EYE RABBIT TEE ($39.99)
- **Badge**: None
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: T-shirt with 3-eyed rabbit artwork
- **Colors**: Cream/gold with rabbit illustration

#### Product 5: VANDALS HOODIE ($39.99)
- **Badge**: None
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: Hoodie with vandals branding
- **Colors**: Purple with white/cream graphics

#### Product 6: SENCERE CREATIVE TEE (Free)
- **Badge**: None
- **Status**: ⏳ **NEEDS PRODUCT PHOTO**
- **Style**: Branded t-shirt
- **Branding**: SenCere Creative LLC logo/text

---

### 4. Brand Story Section (Split Layout)

**Visible in Reference**: YES (4-image grid on left side)

#### Image Grid (2×2 grid of 4 photos)
- **Photo 1**: Street/cultural scene
- **Photo 2**: Creative workspace
- **Photo 3**: Street art/graffiti detail
- **Photo 4**: Lifestyle/culture imagery
- **Style**: Warm vintage filter, street art aesthetic
- **Status**: ⏳ **NEEDS PHOTOGRAPHY**
- **Dimensions**: 400×400px each (1:1 aspect)

**Right Side Text**:
- Heading: "BUILT FROM THE STREETS. CREATED FOR THE FUTURE."
- Body: Narrative copy about brand origin
- CTA: "OUR STORY" button

---

### 5. Newsletter Section

**Visible in Reference**: YES (horizontal bar)
- **Elements**: Icon, text "STAY CONNECTED", email input, subscribe button
- **Images**: Envelope icon (already in UI library)
- **Status**: ✅ **COMPLETE** (uses lucide-react Mail icon)

---

### 6. Footer

**Visible in Reference**: YES (5-column layout)
- **Column 1**: Logo + tagline "STAY LIT. STAY LOYAL. STAY PIFF."
- **Column 2**: SHOP links
- **Column 3**: COMPANY links
- **Column 4**: HELP links
- **Column 5**: CONNECT + social icons
- **Images**: Social media icons (Instagram, TikTok, YouTube)
- **Status**: ✅ **ICONS COMPLETE** (lucide-react + custom TikTok)

---

## Image Acquisition Strategy

### Immediate (MVP - Current Status)
✅ Hero rabbit image in use
✅ Newsletter/social icons in use
⏳ Brand showcase cards using placeholder gradients
⏳ Product grid using placeholder rabbit image
⏳ Brand story using CSS gradient placeholders

### Phase 2 (Next Sprint - 1-2 weeks)
- [ ] Acquire/photograph 3 brand showcase card backgrounds
- [ ] Acquire/photograph 6 product images
- [ ] Acquire/source 4 brand story photos

### Phase 3 (Polish - 2-4 weeks)
- [ ] Optimize all images (WebP + JPEG)
- [ ] Create responsive variants (320px, 640px, 1024px, 1280px)
- [ ] Compress and validate performance

---

## Current Implementation Notes

### Using Placeholders For:
1. **Brand Showcase Cards** → Colored borders with text overlay
   - BLAKKHAIL: Gold border, dark background
   - PIFF CITY: Gold border, dark background
   - VANDALS: Purple border, dark background

2. **Featured Collection Grid** → Using piff-city-rabbit.jpeg for all 6 products
   - Will be replaced with actual product photos
   - Color-coded badge system ready

3. **Brand Story Images** → CSS gradient placeholders
   - "Photo 1", "Photo 2", etc. text labels
   - 2×2 grid structure ready
   - Ready for real photography drop-in

---

## File Organization

```
/apps/website/public/sencere-assets/
├── IMAGES.md (this file)
├── piff-city-rabbit.jpeg ✅
├── piff-city-rabbit-van.jpeg (variant)
├── take-control-rabbit.jpeg (reference)
├── [TO ADD] brand-blakkhail-bg.jpg
├── [TO ADD] brand-piff-city-bg.jpg
├── [TO ADD] brand-vandals-bg.jpg
├── [TO ADD] products/
│   ├── rabbit-hoodie.jpg
│   ├── vandals-tee.jpg
│   ├── piff-city-snapback.jpg
│   ├── rabbit-tee.jpg
│   ├── vandals-hoodie.jpg
│   └── sencere-tee.jpg
└── [TO ADD] brand-story/
    ├── street-culture.jpg
    ├── studio-workspace.jpg
    ├── graffiti-detail.jpg
    └── lifestyle.jpg
```

---

## Next Actions

1. ✅ Design locked and deployed (current status)
2. ⏳ Extract/organize reference images from screenshot
3. ⏳ Create brand showcase card backgrounds
4. ⏳ Photograph/acquire product images
5. ⏳ Source brand story photo collection
6. ⏳ Optimize all images for web
7. ⏳ Update component image paths
8. ⏳ Test responsive image loading

---

**Deployment Status**: 🔒 LOCKED & LIVE with placeholder images  
**Visual Completeness**: 100% (all sections rendering)  
**Image Completeness**: 15% (only hero rabbit in use)  
**Ready for Photography**: YES ✅
