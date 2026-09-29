# SENCERE CREATIVE LLC — Brand Identity Master v1.0
## LOCKED REFERENCE: Pixel-Perfect Design Specification

**Last Updated**: 2026-08-23  
**Status**: CANONICAL REFERENCE — All implementation must match exactly  
**Reference Source**: Client-provided screenshot

---

## 1. BRAND HIERARCHY

```
SENCERE CREATIVE LLC (Parent Company)
├── PIFF CITY (Flagship Brand) — "THE FLAGSHIP BRAND"
│   └── Primary focus: lifestyle, culture, future
├── BLAKKHAIL (Legacy Brand) — "LEGACY / ORIGIN"
│   └── Foundation, history, the real
└── PIFF CITY VANDALS (Underground) — "THE UNDERGROUND"
    └── Rebels, art, vandals
```

---

## 2. COLOR PALETTE (Extracted from Reference)

### Primary Colors
- **Gold/Orange**: #E8A23A (main accent)
- **Darker Gold**: #D4842F (secondary accent)
- **Burnt Orange**: #C56F24 (tertiary)
- **Charcoal Black**: #1a1a1a (primary background)
- **Off-Black**: #0f0f0f (secondary background)
- **Cream/Tan**: #F5E6D3 (text highlight)

### Secondary Colors
- **Purple** (Vandals brand): #5B2D7F or similar dark purple
- **Green** (Cannabis leaf references): #6B8E23 (olive green, subtle)
- **Light Gray Text**: #D4D4D4
- **Medium Gray**: #999999
- **Dark Gray**: #666666

### Palette Strategy
- Warm psychedelic vintage aesthetic
- Cannabis/counterculture cultural references (integrated subtly)
- High contrast for readability
- Gold accents tie all brands together

---

## 3. TYPOGRAPHY (Extracted)

### Display Font (Headlines)
- **Family**: Script/brush style (like "Sencere Creative LLC" logotype)
- **Used for**: Main brand name, large headings
- **Weight**: Bold/Black
- **Characteristics**: Hand-drawn, energetic, flowing

### Primary Font (Body/Navigation)
- **Family**: Modern sans-serif (appears to be similar to Helvetica/Arial or custom)
- **Used for**: Navigation, body copy, labels
- **Sizes**:
  - H1 (Main heading): ~48-56px, bold
  - H2 (Section heading): ~32-40px, bold
  - H3 (Subsection): ~20-24px, bold
  - Body text: ~14-16px, regular
  - Small text: ~12-13px, regular
  - Navigation: ~14px, bold, uppercase
  - Product price: ~16px, bold

### Text Styling
- Heavy use of UPPERCASE for headers and CTAs
- Mixed case for body copy
- Letter spacing: 0.1-0.15em for uppercase text
- Line height: 1.4-1.6 for body, 1.0-1.2 for headings

---

## 4. LAYOUT STRUCTURE (Page Sections)

### Header/Navigation
- **Height**: ~60-70px
- **Layout**: Logo left, nav menu center, utilities right (search, account, cart)
- **Tagline**: "THE CREATOR. THE DESIGN. THE MOVEMENT." (top)
- **Background**: #1a1a1a
- **Navigation items**: HOME, SHOP, COLLECTIONS, ABOUT, THE MOVEMENT, LOOKBOOK, CONTACT
- **Utilities**: SEARCH icon, ACCOUNT icon, CART icon with count badge

### Hero Section
- **Layout**: Two-column grid (left: text, right: image)
- **Left Column**:
  - "SENCERE CREATIVE LLC" heading (script style)
  - Tagline: "OWN THE CULTURE. CREATE THE FUTURE."
  - Description paragraph (small, ~14px)
  - Two CTAs: "SHOP NOW" and "EXPLORE THE COLLECTION"
  
- **Right Column**:
  - Large PIFF CITY rabbit artwork (illustration style)
  - Decorative elements: graffiti/street art aesthetic
  - Brand circle overlay (top-right)

### Trust Points Row
- **5 columns**: CREATOR OWNED | EXCLUSIVE DROPS | PREMIUM QUALITY | GLOBAL SHIPPING | SECURE CHECKOUT
- **Icons**: Custom icons (crown, bolt, globe, lock)
- **Text**: Bold uppercase titles + description
- **Layout**: Flexbox, equal spacing

### Brand Showcase Section
- **Title**: "OUR BRANDS. ONE MOVEMENT."
- **Layout**: 3-column grid
- **Cards**: 
  - BLAKKHAIL (dark/heritage aesthetic)
  - PIFF CITY (gold/flagship aesthetic)
  - PIFF CITY VANDALS (purple/underground aesthetic)
- **Card content**: Brand name, tagline, description, CTA button
- **Dimensions**: ~300px width per card

### Featured Collection
- **Title**: "FEATURED COLLECTION"
- **Subtitle**: "LIMITED PIECES. MAXIMUM IMPACT."
- **Layout**: 6-column product grid (2 rows of 3)
- **Product cards**:
  - Image (aspect ratio ~1:1)
  - Badge ("Best Seller" or "Custom" label)
  - Product name
  - Price ("$XX.XX")
  - Optional shipping time
  - **Dimensions**: ~200px × ~300px per card

### Brand Story Section
- **Title**: "BUILT FROM THE STREETS. CREATED FOR THE FUTURE."
- **Layout**: Split (left: images, right: text)
- **Images**: Photo collage, street photography style
- **Text**: Narrative copy, bold uppercase pull-quotes
- **Background**: Dark with overlaid imagery

### Newsletter Signup
- **Layout**: Horizontal bar or section
- **Elements**:
  - Icon (envelope)
  - Text: "STAY CONNECTED"
  - Subtext: "Get exclusive drops, news, and updates."
  - Email input field
  - "SUBSCRIBE" button (gold background)

### Footer
- **Columns**: 
  1. Logo + tagline ("STAY LIT. STAY LOYAL. STAY PIFF.")
  2. SHOP (Products, Apparel, Collections, Hats, Accessories)
  3. COMPANY (About, Our Story, Brand Statement, Lookbook, Contact)
  4. HELP (FAQ, Shipping & Returns, Returns, Contact)
  5. SOCIAL + Newsletter

- **Layout**: 5 columns with footer widgets
- **Background**: #0f0f0f
- **Text**: Small, gray (#999), organized lists
- **Social icons**: Instagram, TikTok, YouTube, Discord

---

## 5. COMPONENT SPECIFICATIONS

### Buttons
- **Primary CTA**: Gold background (#E8A23A), black text, bold uppercase
- **Secondary CTA**: Black background, gold border (#E8A23A), gold text
- **Hover state**: Slight darken or border highlight
- **Dimensions**: ~120-150px width, ~45-50px height
- **Typography**: 14px, bold, uppercase
- **Padding**: ~12px 24px

### Product Cards
- **Background**: Transparent or #0f0f0f
- **Border**: None or subtle gold border on hover
- **Image**: Full width, aspect ratio ~1:1
- **Badge**: Top-right corner, "Best Seller" / "Custom" label
- **Price**: Bold, gold color, ~16px
- **Shipping info**: Small gray text, ~12px
- **Hover effect**: Image slight zoom or overlay

### Brand Cards (3-column section)
- **Background**: Dark (#1a1a1a or #0f0f0f)
- **Aspect ratio**: ~1:1
- **Image**: Full background
- **Content**: Centered text overlay
- **Border**: Subtle gold border
- **CTA**: "EXPLORE" or "SHOP" button

### Input Fields
- **Style**: Dark background, gold border on focus
- **Text color**: Light gray
- **Padding**: ~12px
- **Border radius**: Minimal or none

---

## 6. SPACING & GRID

### Grid System
- **Base unit**: 8px
- **Container max-width**: ~1536px
- **Column gap**: 32-48px
- **Row gap**: 24-32px

### Section Spacing
- **Top/bottom padding**: 40-60px per section
- **Margin between sections**: 20-40px

### Component Spacing
- **Icon + text**: 8-12px gap
- **Card padding**: 16-24px
- **Button padding**: 12px 24px

---

## 7. IMAGERY & VISUAL STYLE

### PIFF CITY Rabbit
- **Style**: Psychedelic illustration/line art
- **Color**: Tan/cream with gold accents, blue/purple eyes
- **Elements**: Three eyes (supernatural/mystical), peace sign, decorative patterns
- **Context**: Embedded in surreal/street art environment
- **Dimensions**: Large, prominent (right side of hero)

### Photography Style
- **Street art aesthetic**: Graffiti, murals, urban photography
- **Brand photography**: Product shots, lifestyle images
- **Color treatment**: Warm, vintage-filtered or vibrant
- **Mood**: Creative, rebellious, artistic

### Decorative Elements
- Geometric patterns
- Floral/vine elements (subtle)
- Cannabis leaf motifs (tasteful, integrated)
- Graffiti/street art overlays
- Circular badges and borders

---

## 8. RESPONSIVE BREAKPOINTS

### Desktop (1280px+)
- Full multi-column layouts
- Hero: 2-column grid
- Product grid: 6 columns (2 rows)
- Brand showcase: 3 columns
- Navigation: Full horizontal menu

### Tablet (768px-1279px)
- Hero: 1 column (stacked)
- Product grid: 4 columns (1.5 rows)
- Brand showcase: 2 columns
- Navigation: Simplified or hamburger menu

### Mobile (< 768px)
- All single column
- Hero: Stacked vertically
- Product grid: 2 columns
- Brand showcase: 1 column, carousel or stacked
- Navigation: Hamburger menu
- Font sizes: Slightly reduced

---

## 9. INTERACTIONS & ANIMATIONS

### Hover States
- Links: Gold underline or text color change
- Buttons: Slight scale (1.05x) or opacity change
- Product cards: Image zoom or overlay fade-in
- Brand cards: Border highlight

### Transitions
- Duration: 200-300ms
- Easing: ease-in-out
- Properties: color, border, transform, opacity

### Lazy Loading
- Images: Lazy load below fold with fade-in animation
- Scroll animations: Subtle fade-in as sections come into view

---

## 10. IMPLEMENTATION CHECKLIST

- [ ] Update Tailwind config with exact color palette
- [ ] Create CSS variables for consistent theming
- [ ] Build Hero component with rabbit image
- [ ] Implement Trust Points row
- [ ] Create Brand Showcase 3-card section
- [ ] Build Featured Collection grid
- [ ] Add Brand Story split section
- [ ] Newsletter signup form
- [ ] Footer with all columns
- [ ] Mobile responsive adjustments
- [ ] Test all hover states
- [ ] Verify typography across breakpoints
- [ ] Optimize images for web

---

## 11. FILE REFERENCES

**Assets to Create/Update:**
- `/apps/website/components/sencere/Hero.tsx` — Full redesign
- `/apps/website/components/sencere/BrandShowcase.tsx` — New
- `/apps/website/components/sencere/FeaturedCollection.tsx` — New
- `/apps/website/components/sencere/BrandStory.tsx` — New
- `/apps/website/components/sencere/Newsletter.tsx` — New
- `/apps/website/styles/sencere.css` — Brand-specific styles
- `/apps/website/public/sencere-assets/` — All images and illustrations
- `tailwind.config.js` — Color palette updates

---

**NEXT STEP**: Implement components pixel-by-pixel following this master specification.
