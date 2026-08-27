# SenCere Creative LLC — Image Assets Manifest

**Status**: 🔒 LOCKED DESIGN - Image specifications per reference screenshot

---

## Hero Section

### PIFF CITY Rabbit (Primary Hero Image)
- **File**: `piff-city-rabbit.jpeg` ✅ **IN USE**
- **Dimensions**: 1103 × 1426px
- **Usage**: Hero section right side (2-col layout)
- **Description**: 3-eyed rabbit mascot with psychedelic/street art aesthetic
- **Variants**:
  - `piff-city-rabbit-van.jpeg` (psychedelic palette variant)
  - `take-control-rabbit.jpeg` (original reference)

---

## Brand Showcase Section (OUR BRANDS. ONE MOVEMENT.)

### Card Background Images Needed
- **BLAKKHAIL** (Legacy Brand)
  - Style: Dark, heritage aesthetic, skull/vintage motif
  - Colors: Gold (#D4842F), dark earth tones
  - Status: ⏳ **NEEDED**

- **PIFF CITY** (Flagship Brand)
  - Style: Gold/orange psychedelic, rabbit motif
  - Colors: Gold (#E8A23A), warm tones
  - Status: ⏳ **NEEDED** (consider using piff-city-rabbit.jpeg or variant)

- **PIFF CITY VANDALS** (Underground Brand)
  - Style: Purple/dark, street art, rebellious aesthetic
  - Colors: Purple (#5B2D7F), dark tones
  - Status: ⏳ **NEEDED**

---

## Featured Collection Section

### Product Images (6-column grid)
Currently using: Placeholder rabbit image for all products

**Needed**:
1. PIFF CITY RABBIT HOODIE — apparel product photo
2. VANDALS TIE DYE TEE — apparel with tie-dye
3. PIFF CITY SNAPBACK — hat/cap product
4. THREE-EYE RABBIT TEE — t-shirt with rabbit print
5. VANDALS HOODIE — purple hoodie
6. SENCERE CREATIVE TEE — branded tee

**Status**: ⏳ **NEEDS REAL PRODUCT PHOTOGRAPHY**

---

## Brand Story Section

### Photo Collage (4-image grid)
Currently using: Placeholder divs with gradient backgrounds

**Needed**:
- `brand-story-1.jpg` — Street photography / graffiti scene
- `brand-story-2.jpg` — Creative workspace / studio
- `brand-story-3.jpg` — Street art / mural detail
- `brand-story-4.jpg` — Culture / lifestyle imagery

**Style**: Warm vintage filter, street art aesthetic
**Status**: ⏳ **NEEDS PHOTOGRAPHY**

---

## Available Assets (Existing)

| File | Size | Type | Usage |
|------|------|------|-------|
| `piff-city-rabbit.jpeg` | 459K | Hero | ✅ Hero section |
| `piff-city-rabbit-van.jpeg` | 376K | Variant | Reference |
| `take-control-rabbit.jpeg` | 389K | Reference | Reference |
| `9225D3F1-4402-4023-A274-689371BD1062.jpeg` | 603K | Promotional | Unused |
| `BCE35696-FD46-4874-A79E-C9650744D351.jpeg` | 517K | Promotional | Unused |
| Various `.png` files (2-2.4MB) | ~8MB | Mockups | Unused |

---

## Image Organization Checklist

### Immediate (MVP)
- [x] Rabbit hero image → piff-city-rabbit.jpeg ✅
- [ ] Brand story placeholders → Use gradient overlays with text
- [ ] Featured collection → Use product color-coded placeholders

### Phase 2 (Brand Showcase)
- [ ] Photograph/acquire BLAKKHAIL brand background
- [ ] Photograph/acquire PIFF CITY brand background
- [ ] Photograph/acquire VANDALS brand background

### Phase 3 (Full Assets)
- [ ] Product photography (6 items)
- [ ] Brand story photo collage (4 images)
- [ ] Social media assets
- [ ] Marketing photography

---

## Image Optimization Specs

**All images should:**
- Be WebP + JPEG fallback for modern browsers
- Have responsive sizes: 320px, 640px, 1024px, 1280px variants
- Be optimized with: `next/image` Image component
- Include alt text matching locked design descriptions
- Use lazy loading for below-fold content

**Dimensions per section:**
- Hero: 1000-1200px width (2-col layout)
- Brand cards: 400×400px (square, 1:1 aspect ratio)
- Product grid: 300×400px (3:4 aspect ratio, portrait)
- Brand story: 400×400px (square tiles)

---

## Implementation Priority

1. **LIVE NOW** ✅
   - piff-city-rabbit.jpeg (hero)
   
2. **NEXT SPRINT** 🔄
   - Brand story image placeholders (use CSS gradients with overlay text)
   - Product image placeholders (color-coded by category)
   
3. **BACKLOG** 📋
   - Brand showcase background photography
   - Actual product photography
   - Brand story photo collage

---

**Notes**: Current design uses placeholder images for brand showcase and product grid. Full asset implementation can happen iteratively without blocking the live deployment.
