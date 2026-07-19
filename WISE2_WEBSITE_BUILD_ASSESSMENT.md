# WISE² Website Build Assessment

**Date**: 2026-07-18  
**Status**: Ready for Phase 1 Development  
**Scope**: Premium responsive website for WISE² (Creative + Business Dev Agency)

---

## 1. MOCKUP INVENTORY & PAGE MAPPING

### Extracted Assets
✅ **8 High-Resolution Mockups** (1.8MB - 2.6MB each)

| # | Filename | Dimensions | Size | Primary Use | Secondary Use |
|---|----------|-----------|------|-------------|----------------|
| 01 | Homepage_Hero_Trucks | 1672×941 | 1.8MB | **HOME - Hero Section** | Reference for truck imagery + green lighting |
| 02 | Homepage_Featured_Worlds | 1536×1024 | 2.1MB | **HOME - Featured Worlds** | Reference for world cards + grid layout |
| 03 | Our_Worlds_Ecosystem_Map | 1536×1024 | 2.2MB | **OUR WORLDS** | Complete page reference |
| 04 | Homepage_Full_Layout | 1536×1024 | 2.5MB | **HOME - Full Layout** | Complete page reference + footer |
| 05 | Services_Overview | 1536×1024 | 2.0MB | **SERVICES** | Complete page reference |
| 06 | About_Founders_Page | 1024×1536 | 1.9MB | **ABOUT** | Founder profiles + values section |
| 07 | Process_Page | 1536×1024 | 2.0MB | **PROCESS** | 7-step process flow |
| 08 | Simple_Intake_Page | 1024×1536 | 1.9MB | **INTAKE** | Form layout + confirmation |

### Summary
- ✅ No duplicates or conflicts
- ✅ Clear 1:1 mapping to site pages
- ✅ All 8 major pages represented
- ✅ High-quality reference imagery
- ✅ Comprehensive layout coverage

---

## 2. RECOMMENDED BUILD ORDER

### PHASE 1 (Foundation + Entry Points)
**Duration**: 2-3 days | **Priority**: CRITICAL

1. **Project Setup & Global Design System**
   - Create Next.js project structure
   - Set up Tailwind with custom color tokens
   - Create global CSS variables
   - Build typography system
   - Test color system in browser

2. **Navigation & Footer** (Reusable)
   - Header with logo + nav links
   - Mobile hamburger menu
   - Footer with links + social
   - Sticky header on scroll

3. **Homepage** (pages/index.tsx)
   - Hero section (mockup 01)
   - Featured Worlds section (mockup 02)
   - Services overview (snippet of 05)
   - CTA sections
   - Full page integration (ref mockup 04)

4. **Intake Page** (pages/intake.tsx)
   - Contact form with all fields
   - Budget/service dropdowns
   - File upload component
   - Confirmation message
   - Mobile-optimized form

5. **Shared Components**
   - SectionHeading component
   - Button variants (CTA, secondary)
   - Card wrapper component
   - Container wrapper

**Deliverable**: Fully functional homepage + intake page

---

### PHASE 2 (Content Pages)
**Duration**: 2-3 days

1. **Our Worlds** (pages/worlds.tsx)
   - Interactive ecosystem/grid layout
   - World cards with images
   - "ENTER" buttons
   - World detail page stubs
   - Reference mockup 03

2. **Services** (pages/services.tsx)
   - Service grid layout
   - 13 service categories
   - Icons + descriptions
   - Hover states
   - Inquiry CTA per service
   - Reference mockup 05

3. **About** (pages/about.tsx)
   - Headline + core values
   - Founder cards (Darrin + Danny)
   - 6 core values display
   - Team/bio placeholders
   - Reference mockup 06

4. **Process** (pages/process.tsx)
   - 7-step process flow
   - Visual progression
   - Step descriptions
   - Primary message callout
   - Reference mockup 07

5. **Work** (pages/work.tsx)
   - Portfolio grid
   - Project card component
   - Case study page stub
   - Filtering/sorting (optional)

6. **Contact** (pages/contact.tsx)
   - Contact form
   - Email/phone display
   - Social links
   - Consultation CTA
   - Footer integration

**Deliverable**: All major pages built

---

### PHASE 3 (Refinement & Launch)
**Duration**: 2 days

1. **Animation & Interactivity**
   - Framer Motion subtle effects
   - Scroll animations
   - Hover states refinement
   - Loading states

2. **Performance & Accessibility**
   - Image optimization
   - Lazy loading
   - SEO meta tags
   - Keyboard navigation
   - ARIA labels

3. **Testing & Deployment**
   - Responsive testing (mobile, tablet, desktop)
   - Cross-browser testing
   - Form validation testing
   - Performance audit
   - Deploy to production

---

## 3. PROPOSED NEXT.JS FOLDER STRUCTURE

```
wise2-website/
├── public/
│   ├── images/
│   │   ├── mockups/          (extracted reference images)
│   │   ├── heroes/           (hero backgrounds)
│   │   ├── worlds/           (world preview images)
│   │   ├── projects/         (portfolio images)
│   │   ├── founders/         (Darrin + Danny)
│   │   └── icons/            (service icons)
│   ├── videos/
│   └── fonts/
│
├── src/
│   ├── app/                  (Next.js 13+ app directory)
│   │   ├── page.tsx          (home)
│   │   ├── layout.tsx        (global layout)
│   │   ├── globals.css       (global styles)
│   │   ├── intake/
│   │   │   └── page.tsx
│   │   ├── worlds/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── services/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── process/
│   │   │   └── page.tsx
│   │   ├── work/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   │
│   ├── components/
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── SectionHeading.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── WorldCard.tsx
│   │   ├── ServiceCard.tsx
│   │   ├── FounderCard.tsx
│   │   ├── ProcessStep.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── IntakeForm.tsx
│   │   ├── ContactForm.tsx
│   │   └── CTA.tsx
│   │
│   ├── data/
│   │   ├── content.ts        (all editable text content)
│   │   ├── worlds.ts         (world definitions)
│   │   ├── services.ts       (service categories)
│   │   ├── process.ts        (7-step process)
│   │   ├── projects.ts       (portfolio projects)
│   │   └── founders.ts       (founder info)
│   │
│   ├── styles/
│   │   ├── variables.css     (CSS custom properties)
│   │   ├── typography.css
│   │   ├── animations.css
│   │   └── responsive.css
│   │
│   └── utils/
│       ├── colors.ts         (color tokens)
│       └── constants.ts      (brand constants)
│
├── tailwind.config.ts        (Tailwind + custom theme)
├── tsconfig.json
├── next.config.js
├── package.json
└── .env.local                (API endpoints, if needed)
```

---

## 4. COLOR SYSTEM (CSS Variables + Tailwind)

```typescript
// Tailwind Theme Extension
{
  colors: {
    bg: {
      primary: '#030504',
      secondary: '#090D0A',
      card: 'rgba(6, 12, 8, 0.88)',
      forest: '#102219',
    },
    accent: {
      green: '#8CFF00',
      greenSecondary: '#45B900',
      greenBorder: 'rgba(140, 255, 0, 0.45)',
    },
    text: {
      primary: '#F3F5F3',
      muted: '#A7AEA9',
    },
  }
}
```

---

## 5. TYPOGRAPHY SYSTEM

### Font Pairings (Choose 1)

**Option A (Recommended)**
- **Headings**: Bebas Neue (bold, condensed, futuristic)
- **Body**: Inter (clean, modern, readable)

**Option B**
- **Headings**: Teko (strong condensed)
- **Body**: Space Grotesk (tech-forward)

**Option C**
- **Headings**: Anton (maximum impact)
- **Body**: Manrope (geometric, approachable)

### Type Scale
```
H1: 48px (hero headings)
H2: 36px (section headings)
H3: 28px (subsections)
H4: 24px (cards, smaller sections)
Body: 16px (main text)
Caption: 14px (metadata)
Small: 12px (labels)
```

---

## 6. COMPONENT LIBRARY CHECKLIST

### Essential Components (Phase 1)
- [ ] Navigation (desktop + mobile)
- [ ] Footer
- [ ] Hero section
- [ ] Button (primary, secondary, ghost)
- [ ] Card wrapper
- [ ] Container
- [ ] Section heading
- [ ] CTA block
- [ ] Simple form inputs (text, email, tel)

### Component Library (Phase 2)
- [ ] World card
- [ ] Service card
- [ ] Founder card
- [ ] Process step
- [ ] Project card
- [ ] Icon component
- [ ] Badge
- [ ] Dropdown/Select
- [ ] File upload
- [ ] Textarea
- [ ] Radio group
- [ ] Confirmation modal

### Advanced Components (Phase 3)
- [ ] Animated counter
- [ ] Parallax section
- [ ] Scroll reveal
- [ ] Hover glow effect
- [ ] Neon border animation
- [ ] Image lazy loader
- [ ] Carousel (worlds/projects)

---

## 7. CRITICAL BRAND RULES

✅ **DO**
- Use neon acid green (#8CFF00) sparingly for impact
- Dark transparent cards with thin green borders
- Cinematic nighttime city atmosphere
- Rainy, wet pavement reflections
- Professional industrial aesthetic
- Clean futuristic interface elements
- Use Darrin (left) and Danny (right) in reference images

❌ **DO NOT**
- Use crowns or crown symbols anywhere
- Invent new versions of the W² logo
- Use rainbow neon
- Use bright white (#FFFFFF) page backgrounds
- Use generic corporate stock photography
- Overcrowd layouts
- Add weapons unless in approved project images
- Replace Darrin/Danny with random models

---

## 8. RESPONSIVE BREAKPOINTS

```typescript
// Tailwind breakpoints
{
  mobile: '320px',      // sm: 640px
  tablet: '768px',      // md: 768px
  desktop: '1024px',    // lg: 1024px
  wide: '1280px',       // xl: 1280px
  ultrawide: '1536px',  // 2xl: 1536px
}
```

**Mobile-First Strategy**
1. Design mobile layout first
2. Enhance tablet experience
3. Optimize desktop experience
4. Test all transitions

---

## 9. MISSING ASSETS & INFORMATION NEEDED

### Images to Provide/Source
- [ ] Darrin profile photo (high-res)
- [ ] Danny profile photo (high-res)
- [ ] Black truck images (2x, with green lighting)
- [ ] Rainy nighttime city backgrounds
- [ ] Service category icons (13 total)
- [ ] Project hero images (for Work page)
- [ ] World preview images (9 worlds)

### Content to Define
- [ ] Exact founder bios (Darrin + Danny)
- [ ] Company founding year/history
- [ ] Client testimonials (if using)
- [ ] Project case studies (3-5)
- [ ] Social media URLs
- [ ] Contact email + phone
- [ ] Team member names (if expanding About)

### Configuration
- [ ] Analytics tracking ID
- [ ] Form submission endpoint
- [ ] Email confirmation template
- [ ] Newsletter signup integration
- [ ] Blog/resources section (if needed)

---

## 10. TECH STACK CONFIRMATION

✅ **Frontend Framework**: Next.js 14+ (App Router)  
✅ **Language**: TypeScript  
✅ **Styling**: Tailwind CSS  
✅ **Components**: Reusable React components  
✅ **Animation**: Framer Motion (subtle only)  
✅ **Forms**: Native HTML + optional React Hook Form  
✅ **Hosting**: Vercel (recommended for Next.js)  
✅ **SEO**: Next.js built-in + metadata API  
✅ **Performance**: Image optimization, lazy loading, code splitting  

---

## 11. BUILD ORDER TIMELINE

| Phase | Duration | Status | Deliverable |
|-------|----------|--------|-------------|
| **PHASE 1** | 2-3 days | Ready | Homepage + Intake page |
| **PHASE 2** | 2-3 days | Pending | All content pages |
| **PHASE 3** | 2 days | Pending | Animation + launch |

**Total Estimated Time**: 6-8 days to full launch

---

## 12. NEXT STEPS

### Immediate Actions (Today)
1. ✅ Copy all mockup images to `public/images/mockups/`
2. ✅ Create Next.js project with Tailwind
3. ✅ Set up folder structure
4. ✅ Create Tailwind config with custom colors
5. ✅ Build Navigation + Footer components
6. ✅ Build global layout

### Phase 1 Build (Day 1-2)
1. Build Homepage with hero section
2. Build Intake form page
3. Integrate all mockups as references
4. Test responsive layouts
5. Deploy to Vercel

### Phase 2 Build (Day 3-4)
1. Build 6 remaining pages
2. Create all content components
3. Populate with placeholder content
4. Test navigation flow

### Phase 3 Refinement (Day 5-6)
1. Add animations
2. Optimize performance
3. Final responsive testing
4. Deploy to production

---

## STATUS: READY FOR PHASE 1 DEVELOPMENT ✅

**Assessment Complete**
- ✅ All mockups accounted for
- ✅ No conflicts or duplicates
- ✅ Clear page mapping
- ✅ Build order defined
- ✅ Folder structure designed
- ✅ Tech stack confirmed
- ✅ Color system ready
- ✅ Component checklist created

**Proceeding to Phase 1 Build**

