# CC Craft & Create — Brand Specification

**Status**: LOCKED  
**Date**: 2026-08-21  
**Version**: 1.0  

---

## Brand Identity

### Slogan
> **THE MATHIS: C + C = WISE**
> When It Comes to Crafting and Creating

### Taglines
- **Primary**: Crafted for the Moment. Created for the Memory.
- **Secondary**: You Dream It. I'll Create It!

### Brand Personality

| Trait | Expression |
|-------|-----------|
| Creative | Visually stunning, artistic designs |
| Warm | Personal touch, human connection |
| Professional | High quality, reliable, trustworthy |
| Local | Community-focused, accessible |
| Versatile | Products for any occasion |
| Community-Minded | Supports events, causes, nonprofits |
| Trustworthy | On-time, reliable, made with care |
| Detail-Focused | Every element intentional, polished |

---

## Color Palette

### Core Colors

| Color | Hex | Usage | CSS Variable |
|-------|-----|-------|--------------|
| Purple (Primary) | #6D2DBD | Headers, buttons, accents | `--cc-purple` |
| Lavender (Secondary) | #B785D3 | Backgrounds, hover states | `--cc-lavender` |
| Light Lilac (Tertiary) | #F3E8FF | Light backgrounds, cards | `--cc-lilac` |
| Gold (Accent) | #D4AF37 | CTA buttons, special elements | `--cc-gold` |
| Dark (Text/Contrast) | #29233D | Text, dark backgrounds | `--cc-dark` |
| White (Background) | #FFFFFF | Primary background | `--cc-white` |

### Color Usage Rules

**Headers & Navigation**:
- H1, H2, H3: Use `--cc-purple` or `--cc-dark`
- Nav links: `--cc-dark` on hover change to `--cc-purple`

**Buttons**:
- Primary CTA (ORDER NOW, SHOP, ADD TO CART): `--cc-gold` background, `--cc-dark` text
- Secondary: `--cc-purple` background, `--cc-white` text
- Hover: Darken by 10%

**Cards & Containers**:
- Background: `--cc-white`
- Border: `--cc-lavender`
- Hover: Light `--cc-lilac` background

**Backgrounds**:
- Primary: `--cc-white`
- Secondary: `--cc-lilac`
- Accent sections: Subtle `--cc-lavender` wash

---

## Typography

### Font Stack

```css
/* Headers */
--font-headers: 'Lora', serif;

/* Body */
--font-body: 'Poppins', sans-serif;

/* Accents/Script */
--font-script: 'Great Vibes', cursive;
```

### Font Loading (Next.js)

```typescript
import { Lora, Poppins } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'] });
```

### Type Scale

| Element | Font | Size | Weight | Line-Height |
|---------|------|------|--------|-------------|
| H1 | Lora Bold | 48px | 700 | 1.2 |
| H2 | Lora Bold | 36px | 700 | 1.25 |
| H3 | Lora Bold | 28px | 700 | 1.3 |
| H4 | Lora Bold | 24px | 700 | 1.35 |
| Body Large | Poppins | 18px | 400 | 1.6 |
| Body | Poppins | 16px | 400 | 1.6 |
| Body Small | Poppins | 14px | 400 | 1.5 |
| Button | Poppins | 16px | 600 | 1.5 |
| Accent | Great Vibes | 24px | 400 | 1.4 |

### Typography Usage

**H1** (Hero, page titles):
```
Crafted for the Moment. Created for the Memory.
```

**H2** (Section headers):
```
Shop All Products
Browse by Occasion
Our Story
```

**H3** (Product titles, subsections):
```
Personalized Drink Labels
Party Packages
Custom Business Branding
```

**Body** (Product descriptions, copy):
```
Every detail is designed with love, care and purpose, 
because every moment deserves to be special.
```

**Script (Accent)** (Special elements, taglines):
```
You Dream It. I'll Create It!
```

---

## Logo & Branding Assets

### Logo Placement

**Header**: Place in top-left corner
- Size: 50px height (responsive: 40px mobile)
- Margin: 16px left, 16px top

**Footer**: Place in center
- Size: 40px height
- Margin: 16px bottom

### Logo Usage Rules

- ✅ Use on white backgrounds
- ✅ Use on purple/lavender backgrounds (white version)
- ✅ Use on gold backgrounds (dark version)
- ❌ Never distort, skew, or rotate
- ❌ Never change colors
- ❌ Minimum size: 30px height

---

## Layout & Spacing

### Grid System

- **Desktop**: 12-column grid, 1200px max-width
- **Tablet**: 8-column grid, 768px
- **Mobile**: 4-column grid, 375px
- **Gutter**: 24px (desktop), 16px (mobile)

### Spacing Scale

```
4px   (micro)
8px   (xs)
12px  (sm)
16px  (md)
24px  (lg)
32px  (xl)
48px  (2xl)
64px  (3xl)
```

### Component Spacing

- **Section margins**: 64px top/bottom (desktop), 32px (mobile)
- **Card margins**: 16px
- **Button padding**: 12px 24px
- **Input padding**: 12px 16px

---

## Components

### Buttons

**Primary CTA**:
```
Background: #D4AF37 (gold)
Text: #29233D (dark)
Font: Poppins 600, 16px
Padding: 12px 24px
Border-radius: 8px
Hover: #C49D2B (darker gold)
```

**Secondary**:
```
Background: #6D2DBD (purple)
Text: #FFFFFF (white)
Font: Poppins 600, 16px
Padding: 12px 24px
Border-radius: 8px
Hover: #5A238F (darker purple)
```

### Cards

```
Background: #FFFFFF (white)
Border: 1px solid #B785D3 (lavender)
Border-radius: 8px
Padding: 24px
Shadow: 0 2px 8px rgba(0,0,0,0.1)
Hover: Background #F3E8FF (lilac), shadow deepens
```

### Navigation

```
Font: Poppins 600, 16px
Text: #29233D (dark)
Hover: #6D2DBD (purple)
Active: #6D2DBD (purple) + underline
Spacing: 24px between items
```

### Forms

```
Input border: 1px solid #B785D3 (lavender)
Input focus: border #6D2DBD (purple), shadow
Label: Poppins 600, 14px, #29233D (dark)
Placeholder: #99839C (muted)
```

---

## Homepage Layout

### Section 1: Hero
- **Background**: `--cc-white`
- **Hero image**: CC brand showcase image
- **Headline**: "Crafted for the Moment. Created for the Memory."
- **Subheadline**: "Custom products for every occasion, every person, every purpose."
- **CTA**: Gold button "ORDER YOURS TODAY"

### Section 2: Value Props (3-column)
1. **High-Quality Printing** — Vibrant colors, sharp details
2. **Fast Turnaround** — Quick delivery, no waiting
3. **Made with Love** — Personal touch, handcrafted care

### Section 3: Featured Products (4-column grid)
Show top 4 products with images, prices, "Add to Cart"

### Section 4: By Occasion (6-column grid)
- Birthdays
- Baby Showers
- Graduations
- Memorials
- Holidays
- Events

### Section 5: About CC
- **Image**: Photo of CC
- **Headline**: "Nurse. Entrepreneur. Creator."
- **Copy**: CC's story
- **CTA**: "Learn More"

### Section 6: Customer Reviews (3-column)
Testimonials from happy customers

### Section 7: Call to Action
- **Headline**: "Your Dream. Our Creation."
- **CTA**: "START YOUR ORDER"

---

## Mobile Responsiveness

### Breakpoints

```css
--mobile: 375px to 767px
--tablet: 768px to 1023px
--desktop: 1024px+
```

### Mobile Adjustments

- **Typography**: Reduce H1 by 20%, body by 10%
- **Spacing**: Reduce margins/padding by 50%
- **Grid**: 1-2 columns (max)
- **Images**: Full-width, optimized for mobile
- **Navigation**: Hamburger menu on mobile
- **Buttons**: Full-width on mobile for thumb access

---

## Imagery & Photography

### Image Requirements

- **Product photos**: High-quality, well-lit, on white background
- **Showcase photos**: Lifestyle, in-use context (people enjoying products)
- **About photo**: Professional headshot of CC
- **Hero image**: Brand showcase image (use provided PNG)

### Image Optimization

- **Format**: WebP with PNG fallback
- **Compression**: 80% quality for faster loading
- **Sizes**: Responsive srcset (320px, 640px, 1200px)
- **Alt text**: Descriptive for accessibility

---

## Voice & Copy

### Tone

- **Warm** — Personal, friendly, approachable
- **Professional** — Reliable, trustworthy, quality-focused
- **Creative** — Artistic, imaginative, inspiring
- **Local** — Community-oriented, accessible

### Key Messaging

- "Every detail is designed with love, care and purpose"
- "Because every moment deserves to be special"
- "Crafted for the Moment. Created for the Memory."
- "Made with love, just for you"

### Example Copy

**Product Description**:
> "Our personalized drink labels add the perfect touch to any celebration. High-quality printing ensures vibrant colors and sharp details that'll make your event unforgettable."

**About CC**:
> "CC is a nurse, entrepreneur and creative at heart. She specializes in custom products for every occasion, business and community event. Every detail is designed with love, care and purpose, because every moment deserves to be special."

---

## SEO & Meta Tags

### Homepage Meta

```html
<title>CC Craft & Create — Custom Personalized Products</title>
<meta name="description" content="Custom personalized products for every occasion. Fast turnaround, high-quality printing, made with love." />
<meta name="keywords" content="personalized products, custom design, party labels, memorials, business branding" />
<meta name="og:title" content="CC Craft & Create — Crafted for the Moment. Created for the Memory." />
<meta name="og:description" content="Custom products for birthdays, graduations, memorials, holidays, and more." />
<meta name="og:image" content="/og-image.png" />
```

---

## Implementation Checklist

- [ ] Set up Tailwind CSS color tokens
- [ ] Import Google Fonts (Lora, Poppins, Great Vibes)
- [ ] Create CSS variables in `globals.css`
- [ ] Build reusable Button components
- [ ] Build Card components
- [ ] Build Navigation component
- [ ] Build Form inputs
- [ ] Test on mobile (375px), tablet (768px), desktop (1200px)
- [ ] Verify all colors match specification
- [ ] Verify typography matches specification
- [ ] Get CC approval on homepage mockup
- [ ] Final QA before launch

---

**IMPORTANT**: This brand specification is **LOCKED**. All design decisions must conform to these guidelines. Any deviations require explicit approval from CC.
