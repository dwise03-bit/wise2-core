# Web Design Builder - Template Guide

## Overview

The Web Design Builder includes 5 professionally designed templates to jumpstart your design. Each template is fully customizable and comes with predefined layouts, colors, and sections.

## 1. Landing Page Template

**Best For:** Product launches, service promotions, lead generation

**Sections:**
- Hero Section (80px padding, bold headline, CTA button)
- Features Section (3-column grid for feature cards)
- Call-to-Action Section (dark background, prominent button)

**Color Scheme:**
- Primary: #2563eb (Blue)
- Secondary: #1e40af (Dark Blue)
- Accent: #dbeafe (Light Blue)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)

**Customization Tips:**
1. Replace "Welcome to Our Product" with your headline
2. Add your own CTA button text
3. Create 3 feature cards in the Features section
4. Update colors in Style Panel > Colors
5. Add images to feature cards

**Example Customization:**
```
Hero Section:
- Headline: "Transform Your Workflow"
- Subtext: "The all-in-one platform for modern teams"
- Button: "Get Started Free"

Features:
- Feature 1: "Real-time Collaboration"
- Feature 2: "Unlimited Storage"
- Feature 3: "24/7 Support"

CTA Section:
- Headline: "Ready to get started?"
- Button: "Start Free Trial"
```

## 2. Portfolio Template

**Best For:** Designers, photographers, creatives, artists

**Sections:**
- Header with name/title
- Portfolio Gallery (3-column grid for projects)
- Contact Section (call to action)

**Color Scheme:**
- Primary: #8b5cf6 (Purple)
- Secondary: #7c3aed (Dark Purple)
- Accent: #ede9fe (Light Purple)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)

**Customization Tips:**
1. Update header with your name/title
2. Add 6-9 project images in gallery
3. Add project titles under each image
4. Customize contact section with your info
5. Add links to live projects

**Gallery Layout:**
```
3-column grid (responsive):
[Project 1] [Project 2] [Project 3]
[Project 4] [Project 5] [Project 6]
[Project 7] [Project 8] [Project 9]

Mobile: 1 column
Tablet: 2 columns
Desktop: 3 columns
```

**Add Hover Effects:**
1. Select image
2. Go to Style Panel > Effects
3. Add Box Shadow: `0 10px 25px rgba(0,0,0,0.2)`
4. Add Transform: `scale(1.05)` on hover

## 3. Services Template

**Best For:** Agencies, consultants, service providers

**Sections:**
- Services Hero (headline and tagline)
- Service Cards (3-column grid)
- Pricing Plans (tier comparison)

**Color Scheme:**
- Primary: #06b6d4 (Cyan)
- Secondary: #0891b2 (Dark Cyan)
- Accent: #cffafe (Light Cyan)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)

**Service Card Template:**
- Icon/Badge
- Service Name
- Description (2-3 lines)
- "Learn More" link

**Pricing Tiers:**
```
┌─────────┬─────────┬─────────┐
│ Starter │ Popular │  Pro    │
├─────────┼─────────┼─────────┤
│  $29    │  $79    │  $199   │
│  /mo    │  /mo    │  /mo    │
│         │         │         │
│ Feature │ Feature │ Feature │
│ Feature │ Feature │ Feature │
│ Feature │ Feature │ Feature │
│         │         │         │
│ Button  │ Button  │ Button  │
└─────────┴─────────┴─────────┘
```

**Customization Tips:**
1. Define 3 service offerings
2. Create detailed description for each
3. Set up 2-3 pricing tiers
4. Add features to each tier
5. Use icons or badges for each service

## 4. About Template

**Best For:** Personal brand, company story, team bios

**Sections:**
- Hero Section (title "About Us")
- Story Section (company/personal narrative)
- Team Section (team members or values)

**Color Scheme:**
- Primary: #ec4899 (Pink)
- Secondary: #db2777 (Dark Pink)
- Accent: #fbcfe8 (Light Pink)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)

**Story Section Content:**
- Who you are
- What you do
- Why it matters
- Mission statement
- Unique value proposition

**Team Section Ideas:**
- Team member cards with photos
- Key values/pillars
- Timeline of achievements
- Client logos

**Customization Tips:**
1. Write compelling story (150-300 words)
2. Add professional headshots
3. Include team credentials
4. Add social media links
5. Include company milestones

## 5. Contact Template

**Best For:** Lead generation, inquiry collection, support pages

**Sections:**
- Contact Hero (headline "Get in Touch")
- Contact Form (name, email, message)
- Contact Information (address, phone, email)

**Color Scheme:**
- Primary: #14b8a6 (Teal)
- Secondary: #0d9488 (Dark Teal)
- Accent: #ccfbf1 (Light Teal)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)

**Form Fields:**
- Full Name (text input)
- Email (email input)
- Subject (text input)
- Message (textarea)
- Submit Button

**Form Customization:**
```tsx
// Style the form container
- Width: 500px (max-width)
- Margin: 0 auto (center)
- Padding: 40px
- Background: #f0fdfa (light)
- Border Radius: 8px

// Style input fields
- Padding: 12px
- Border: 1px solid #d1d5db
- Border Radius: 6px
- Font Size: 14px
- Focus: Blue border + shadow

// Style button
- Background: #14b8a6
- Color: white
- Padding: 12px 24px
- Border Radius: 6px
- Hover: Darker shade
```

**Contact Information Section:**
```
Address: [Your Address]
Phone: [Your Phone]
Email: [Your Email]

Or connect with us:
[Social Links]
```

## Customizing Any Template

### Step 1: Choose Template
1. Open Web Design Builder
2. Select template from template selector
3. Click "Use This Template"

### Step 2: Change Colors
1. Select any element
2. Style Panel > Colors
3. Update:
   - Text Color
   - Background Color
   - Project Colors (primary, secondary, etc.)

### Step 3: Update Content
1. Select text element
2. Edit content directly
3. Or use Style Panel to edit

### Step 4: Add Images
1. Drag "Image" component from library
2. Set src URL to image path
3. Adjust width/height to fit layout

### Step 5: Adjust Spacing
1. Select container
2. Style Panel > Layout
3. Adjust:
   - Padding (internal space)
   - Margin (external space)
   - Gap (space between children)

### Step 6: Make Responsive
1. Select element
2. Style Panel > Responsive
3. Set Mobile overrides (for screens < 640px)
4. Set Tablet overrides (for screens < 1024px)

## Advanced Customization

### Creating Custom Color Schemes

**Monochrome:**
```
Primary: #4b5563
Secondary: #2d3436
Accent: #dfe6e9
Background: #ffffff
Text: #2d3436
```

**Colorful:**
```
Primary: #6366f1
Secondary: #ec4899
Accent: #fbbf24
Background: #f8fafc
Text: #1e293b
```

**Professional:**
```
Primary: #1e293b
Secondary: #64748b
Accent: #64748b
Background: #ffffff
Text: #334155
```

### Creating Sections

**Hero Section (Full Width):**
- Width: 100%
- Padding: 60px 24px
- Display: flex
- Flex Direction: column
- Justify Content: center
- Align Items: center

**Content Section (Centered):**
- Width: 100%
- Max Width: 800px
- Margin: 0 auto
- Padding: 40px 24px

**Grid Section (3 Columns):**
- Display: grid
- Grid Template Columns: repeat(3, 1fr)
- Gap: 24px
- Responsive: `repeat(1, 1fr)` for mobile

### Adding Animations

**Element Entrance:**
1. Select element
2. Style Panel > Animations
3. Choose type (fade, slideIn, scaleIn, etc.)
4. Set duration (300-800ms typical)
5. Set delay (stagger elements)

**Animation Sequence:**
```
Element 1: Fade, delay 0ms
Element 2: Fade, delay 100ms
Element 3: Fade, delay 200ms
Element 4: Fade, delay 300ms
```

## Template Export & Reuse

### Export Custom Template
1. Design your custom layout
2. Export as HTML/CSS
3. Save as template base
4. Reuse for future projects

### Share Template with Team
1. Export HTML/CSS
2. Upload to shared folder
3. Team can import and customize

## Browser Compatibility

All templates work in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Tips

- Keep images under 2MB per image
- Use web-safe fonts (Arial, Georgia, etc.)
- Limit animations to non-critical elements
- Use CSS instead of images where possible
- Compress images before uploading

## Template Modifications Checklist

- [ ] Update all text content
- [ ] Replace placeholder images
- [ ] Adjust colors to brand
- [ ] Update contact information
- [ ] Add internal links
- [ ] Test responsive views
- [ ] Preview animations
- [ ] Export and test in browser
- [ ] Deploy to web server

---

**Pro Tip:** Start with a template, customize it to your brand, then save it as your personal template base for future projects!
