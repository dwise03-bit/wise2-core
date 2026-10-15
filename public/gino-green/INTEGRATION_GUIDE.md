# Style Gallery — Image Integration Guide

## Once Images Arrive

When smiles2 sends the 4 product images, follow these steps:

### Step 1: Place Images
```
public/gino-green/images/
├── queens-lifestyle.jpg
├── urban-minimal.jpg
├── elevated-casual.jpg
└── global-movement.jpg
```

### Step 2: Update HTML

In `public/gino-green-demo.html`, find each gallery item and replace the SVG placeholder with the actual image URL.

**Current (placeholder):**
```html
<img src="data:image/svg+xml,%3Csvg..." alt="Queens lifestyle" 
     class="gallery-image" 
     style="background: linear-gradient(135deg, #285c2c 0%, #142019 100%);">
```

**Updated (with image):**
```html
<img src="/gino-green/images/queens-lifestyle.jpg" 
     alt="Queens lifestyle - G Train energy with 999 signature sweatshirt and raw cotton vintage tee" 
     class="gallery-image">
```

### Gallery Items to Update

| Item | Current SVG | New URL | Alt Text |
|------|-------------|---------|----------|
| **Queens Lifestyle** | Line ~897 | `/gino-green/images/queens-lifestyle.jpg` | Queens lifestyle - G Train energy with 999 signature sweatshirt and raw cotton vintage tee |
| **Urban Minimal** | Line ~912 | `/gino-green/images/urban-minimal.jpg` | Urban minimal - Clean city looks with 999 graphic tee and premium backpack |
| **Elevated Casual** | Line ~927 | `/gino-green/images/elevated-casual.jpg` | Elevated casual - 999 embroidered cap and signature pieces for everyday luxury |
| **Global Movement** | Line ~942 | `/gino-green/images/global-movement.jpg` | Global movement - Complete 999 capsule collection |

### Step 3: Test
1. Clear browser cache (Cmd+Shift+R)
2. Verify images load at proper aspect ratio
3. Test hover overlays display correctly
4. Check responsive layout on mobile
5. Verify alt text displays on image error

### Step 4: Deploy
```bash
git add public/gino-green/images/
git commit -m "feat: Add product images to Style Gallery"
git push
```

## HTML Structure Reference

Each gallery item follows this pattern:
```html
<div class="gallery-item">
  <img src="[IMAGE_URL]" alt="[DESCRIPTION]" class="gallery-image">
  <div class="gallery-overlay">
    <div class="gallery-title">[STYLE NAME]</div>
    <div class="gallery-description">[PRODUCT DESCRIPTION]</div>
    <div class="gallery-products">
      <span class="product-tag">PRODUCT 1</span>
      <span class="product-tag">PRODUCT 2</span>
      <span class="product-tag">PRODUCT 3</span>
    </div>
    <a href="#special-drop" class="gallery-cta">SHOP LOOK ↗</a>
  </div>
</div>
```

## CSS Applied
- `aspect-ratio: 0.75` (3:4 portrait)
- `object-fit: cover` (fills container, centered crop)
- Hover scale transform on image
- Overlay fade-in with gradient
- Responsive grid layout

## Image Requirements
- **Format:** JPG or WebP (optimized for web)
- **Dimensions:** 1200×1600px minimum (3:4 aspect ratio)
- **File size:** <500KB per image (compress before upload)
- **Quality:** Sharp, vibrant, lifestyle photography
- **Content:** Products in context (on-model or styled lookbook)

---

**Timeline:** Once images received → 15 min integration → Ready to deploy
