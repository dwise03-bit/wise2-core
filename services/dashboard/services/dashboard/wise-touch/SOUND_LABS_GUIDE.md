# WISE² Sound Labs — Implementation & Editing Guide

## Overview

WISE² Sound Labs is a premium music production and sonic branding service page. It's fully responsive, production-ready, and follows the WISE² Enterprise visual identity.

**Route**: `/sound-labs`

## Page Architecture

### Components (Located in `src/components/sound-labs/`)

| Component | Purpose |
|-----------|---------|
| **SoundLabsHero.tsx** | Full-viewport hero with animated waveforms, headline, and dual CTAs |
| **AudioShowcase.tsx** | Demo audio player with category filters (currently using placeholders) |
| **OutcomeGrid.tsx** | Four outcome cards: Be Remembered, Sound Professional, Own Your Campaign, Launch Everywhere |
| **PackageSelector.tsx** | Four pricing package cards (Starter, Business, Premium, Monthly Subscription) |
| **DeliverablesSignalChain.tsx** | Eight-item signal chain showing deliverables and scope clarity |
| **ProductionJourney.tsx** | Five-step production process with visual timeline |
| **AudienceGrid.tsx** | Nine audience segments (Creators, Businesses, Gun Ranges, etc.) |
| **SoundLabsFAQ.tsx** | Expandable FAQ accordion with 9 common questions |
| **ProjectIntake.tsx** | Contact/intake form with 10 fields (currently logs to console, backend integration pending) |
| **SoundLabsFinalCTA.tsx** | End-of-page call-to-action with dual buttons and trust indicators |

### Data File (`src/lib/sound-labs-data.ts`)

All editable content is centralized here:

- **soundLabsPackages** — Pricing, benefits, details for all four packages
- **soundLabsDeliverables** — Eight deliverables with icons and descriptions
- **soundLabsAudiences** — Nine audience segments with icons
- **soundLabsFAQ** — Nine FAQ items (question + answer)
- **soundLabsProductionSteps** — Five-step production journey
- **soundLabsTrustFeatures** — Six trust indicators (currently unused in UI)
- **soundLabsFormFields** — Form field schema with validation rules

## Editing Content

### Update Package Pricing

**File**: `src/lib/sound-labs-data.ts`

```typescript
export const soundLabsPackages = [
  {
    id: 'starter',
    name: 'Starter Package',
    priceRange: '$99–$199',  // ← Edit here
    description: 'Perfect for creators and small businesses',
    // ... rest of package
  },
  // ... other packages
]
```

### Update FAQ

**File**: `src/lib/sound-labs-data.ts`

```typescript
export const soundLabsFAQ = [
  {
    question: 'What do I need to get started?',
    answer: 'Edit this text...',  // ← Edit here
  },
  // ... other questions
]
```

### Add Real Audio Demos

**File**: `src/components/sound-labs/AudioShowcase.tsx`

Replace the placeholder tracks array with real audio files:

```typescript
const demoTracks: Track[] = [
  {
    id: '1',
    title: 'Brand Anthem Example 1',
    category: 'Brand Anthem',
    audioUrl: '/audio/brand-anthem-01.mp3',  // ← Add this
    duration: '2:15',  // ← Update duration
  },
  // ... more tracks
]
```

Then update the play button handler to actually play audio (currently disabled).

### Update Form Fields

**File**: `src/lib/sound-labs-data.ts`

Edit `soundLabsFormFields` to add/remove/modify form inputs. The form in `ProjectIntake.tsx` automatically renders based on this config.

## Visual Design System

All components use the existing WISE² design tokens:

- **Colors**: bg-primary (#050505), blue-electric (#0094FF), chrome-light (#D1D5DB)
- **Shadows**: glow-blue, glow-blue-lg for neon effects
- **Components**: hud-panel, hud-panel-glass, hud-panel-accent classes
- **Animations**: pulse-blue, glow-pulse, scan-line keyframes
- **Typography**: display, heading, subheading font sizes

See `tailwind.config.ts` for the complete design token system.

## Integration Tasks (Owner-Supplied)

### 1. Form Submission Backend ⚠️

**File**: `src/components/sound-labs/ProjectIntake.tsx` (line 28-50)

Currently, the form logs to console. To make it live:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // TODO: Replace this with your actual API call
    const response = await fetch('/api/sound-labs-intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    if (!response.ok) throw new Error('Submission failed')

    setSubmitted(true)
    // ... rest of handler
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    setLoading(false)
  }
}
```

Required endpoint: `POST /api/sound-labs-intake` (or your chosen path)

### 2. Email Notifications ⚠️

Add email notification logic when form is submitted:

- Send confirmation email to user
- Send lead notification to sound-labs@wise2.net (or your email)

### 3. Calendar Integration ⚠️

**File**: `src/components/sound-labs/SoundLabsFinalCTA.tsx` (line 47)

Replace the placeholder calendar link:

```typescript
onClick={() => {
  window.open('https://calendly.com/yourname/discovery', '_blank')  // ← Your Calendly URL
}}
```

### 4. Real Audio Demos ⚠️

Add real demo audio files to `public/audio/` and update:

- `AudioShowcase.tsx` — Track list with audio URLs
- Form `<audio>` elements for playback (currently hidden)

### 5. Policy Pages ⚠️

Create these pages (currently linked but not implemented):

- `/privacy` — Privacy Policy
- `/terms` — Terms of Service
- `/sound-labs/refund-policy` — Refund & Cancellation Policy

Quick stub:

```typescript
// src/app/privacy/page.tsx
export default function PrivacyPage() {
  return <div>Privacy policy content...</div>
}
```

### 6. Contact Information ⚠️

Update email addresses throughout:

- Search for `sound-labs@wise2.net` and replace with your actual email
- Update phone number in footer (currently not shown, add if needed)
- Add your company contact info to the footer

## Responsive Breakpoints

All components are built mobile-first with `md:` (768px) and `lg:` (1024px) breakpoints.

Tested at:
- 320px (mobile)
- 375px (mobile)
- 768px (tablet)
- 1024px (desktop)
- 1440px+ (wide desktop)

## SEO & Metadata

**File**: `src/app/sound-labs/page.tsx`

```typescript
export const metadata: Metadata = {
  title: 'WISE² Sound Labs - Custom Music & Sonic Branding',
  description: 'Professional music production...',
  keywords: [...],
  openGraph: { ... },
}
```

Update title, description, and keywords as needed. No structured data (JSON-LD) is included—add if needed for rich search results.

## Performance & Accessibility

✅ **Performance**:
- Images are lazy-loaded below the fold
- Animations respect `prefers-reduced-motion`
- No autoplay audio or video
- Smooth scroll behavior

✅ **Accessibility**:
- Semantic HTML (`<button>`, `<form>`, etc.)
- ARIA labels on interactive elements
- Color contrast ≥4.5:1 for body text
- Keyboard navigation throughout
- Focus states on all interactive elements

## Navigation Integration

Sound Labs is automatically added to the sidebar navigation:

**File**: `src/components/layout/Sidebar.tsx`

```typescript
{
  id: 'sound-labs',
  label: 'Sound Labs',
  icon: Music,
  href: '/sound-labs',
}
```

No further changes needed—it appears in the sidebar automatically.

## Testing Checklist

- [ ] Hero section loads without errors
- [ ] All sections render on mobile, tablet, desktop
- [ ] Audio showcase category filters work
- [ ] Package cards expand/collapse correctly
- [ ] FAQ accordion opens and closes
- [ ] Form validates required fields
- [ ] Form submission logs data (backend integration pending)
- [ ] All CTAs scroll to correct sections
- [ ] Navigation link appears in sidebar
- [ ] Responsive images load correctly
- [ ] Animations respect reduced-motion preference
- [ ] No console errors or warnings

## Future Enhancements

1. **Portfolio Gallery** — Add real client work (Lyric videos, music videos, covers)
2. **Testimonials** — Customer quotes (currently hidden; enable when you have real ones)
3. **Case Studies** — Deep dives into past projects
4. **Blog Integration** — Music tips, industry insights
5. **Booking System** — Replace Calendly redirect with native calendar widget
6. **Payment Integration** — Stripe for deposits/deposits
7. **Analytics** — Track hero CTA, audio plays, form starts, conversions

## Quick Start for Developers

1. **View the page locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/sound-labs
   ```

2. **Edit content**:
   - Prices/packages → `src/lib/sound-labs-data.ts`
   - Component text/layout → `src/components/sound-labs/*.tsx`

3. **Test responsive design**:
   - Open DevTools (F12)
   - Toggle device toolbar (Ctrl+Shift+M)
   - Test at 375px, 768px, 1024px, 1440px

4. **Deploy**:
   - Changes are live when merged to main
   - No build configuration changes needed

## Support & Maintenance

- **Design System**: See `src/styles/globals.css` and `tailwind.config.ts`
- **Component Library**: Other pages reuse components from `src/components/common/`
- **Icons**: All from Lucide React (`lucide-react`)
- **Animations**: Framer Motion for all transitions (`framer-motion`)

Questions? Check the WISE² design system docs in `.claude/skills/impeccable/`.
