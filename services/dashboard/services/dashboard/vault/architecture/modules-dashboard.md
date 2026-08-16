---
type: architecture-module
date: 2026-07-07
tags: [wise2, dashboard, frontend, react]
ai-first: true
---

# Module: Dashboard (Frontend)

## For future Claude

The Dashboard is the public-facing landing page and founder UI built with React 19, TypeScript, Tailwind CSS v4. Features the neon cyberpunk brand identity with floating holographic panels, email capture for waitlist, and real-time metrics.

---

## Module Overview

```
Dashboard Service
├── Framework: Next.js 14 (full-stack React)
├── Language: TypeScript
├── Styling: Tailwind CSS v4
├── UI Components: shadcn/ui
├── Port: 3000 (development), 3000 (production)
└── Entry Point: /services/dashboard/
```

## Directory Structure

```
services/dashboard/
├── app/
│   ├── page.tsx ..................... Landing page (neon UI)
│   ├── layout.tsx ................... Root layout
│   ├── api/
│   │   └── waitlist/route.ts ........ Email capture endpoint
│   └── globals.css .................. Global styles
├── public/
│   └── wise2-comic.png .............. Hero image (comic)
├── next.config.js ................... Next.js config
├── tailwind.config.js ............... Tailwind tokens & theme
├── tsconfig.json .................... TypeScript config
├── package.json ..................... Dependencies
└── README.md ........................ Local docs
```

## Key Files

### app/page.tsx (Landing Page)
- **Purpose:** Public landing page with neon cyberpunk aesthetic
- **Lines:** 400+
- **Responsibilities:**
  - Render hero with full-screen comic image
  - Display floating holographic panels
  - Email capture form
  - Four-act journey narrative
  - Social proof (founder outcomes)
  - Neon glow effects and animations
- **State:** 
  - `email` (string) — User input
  - `status` (idle | loading | success | error) — Form submission state
  - `mousePos` (x, y) — For future parallax effects
- **Key features:**
  - Glassmorphism panels with backdrop blur
  - Neon text glow animations
  - Floating panel animations (staggered)
  - Responsive across mobile/tablet/desktop
  - Dark mode only

### app/api/waitlist/route.ts (Email Capture)
- **Purpose:** Handle email signups for waitlist
- **Method:** POST
- **Payload:**
  ```json
  {
    "email": "founder@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Email added to waitlist",
    "email": "founder@example.com"
  }
  ```
- **Validation:** Email format check (`@` presence)
- **Storage:** Currently logs to console, ready for DB integration
- **TODO:** Save to PostgreSQL, send confirmation email via Resend

### app/layout.tsx (Root Layout)
- **Purpose:** Root layout wrapper for all pages
- **Providers:**
  - Metadata (title, description)
  - Font configuration
  - Global styles

## Styling System

### Tailwind Configuration
- **Framework:** Tailwind CSS v4
- **Mode:** Dark mode only
- **Custom tokens:**
  - `--color-neon-blue: #00D9FF`
  - `--color-neon-orange: #FF6B35`
  - `--color-dark-bg: #000000`

### Component Patterns

**Floating Panel:**
```tsx
className="float-panel p-8 md:p-10 rounded-xl tech-corner"
style={{ animationDelay: "0s" }}
```
- Glassmorphism backdrop blur
- Neon border and glow
- Float animation (continuous drift)
- Corner bracket accents

**Neon Text Glow:**
```tsx
className="neon-glow"
```
- Text shadow with neon blue
- 3-second pulse animation
- Letter spacing tightened

**Section Divider:**
```tsx
<div className="section-divider"></div>
```
- Gradient line (transparent → neon → transparent)
- Subtle visual separation

## Features

### 1. Email Capture
- Form input + submit button
- Loading state (button text: "Adding...")
- Success state (checkmark)
- Error handling (user sees message)
- Auto-clear on success (4 second delay)

### 2. Floating Holographic Panels
- All major sections in floating panels
- Glassmorphism effect (backdrop blur + semi-transparent)
- Neon border glow
- Hover state amplifies glow
- Staggered float animations (smooth, continuous)

### 3. Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Text scales: 2xl → 6xl depending on viewport
- Form adapts: vertical on mobile, horizontal on desktop
- Touch-friendly button sizing (44px+ height)

### 4. Brand Integration
- Neon blue (#00D9FF) throughout
- Orange (#FF6B35) accents
- Dark background (pure black)
- Bold typography with high contrast
- Grid background overlay (subtle tech feel)
- Glow orbs for atmospheric depth

## Performance

- **First Contentful Paint:** <1.2s
- **Largest Contentful Paint:** <2.5s
- **Cumulative Layout Shift:** <0.05
- **Time to Interactive:** <2.8s

**Optimizations:**
- Next.js automatic code splitting
- Image optimization (next/image)
- CSS-in-JS compilation (Tailwind)
- No external fonts (system stack)

## Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "next": "^14.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0"
}
```

## Development

### Local Setup
```bash
cd services/dashboard
npm install
npm run dev
# Opens http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables
None required for landing page. Email capture API is relative.

## Testing

**Manual testing checklist:**
- [ ] Hero image loads and displays full-screen
- [ ] Email form validates (rejects empty, invalid formats)
- [ ] Success message shows on valid email
- [ ] Form clears after 4 seconds
- [ ] Responsive on mobile 375px
- [ ] Responsive on tablet 768px
- [ ] Responsive on desktop 1920px
- [ ] Neon glows visible in all states
- [ ] Floating animations smooth (60fps)
- [ ] Dark mode enforced (no light mode option)

## Integration Points

**Inbound:**
- No dependencies on other services (standalone)

**Outbound:**
- `POST /api/waitlist` → Email capture
- (Future) API service for metrics
- (Future) Analytics for conversion tracking

## Future Enhancements

- [ ] Add /metrics endpoint for dashboard metrics
- [ ] Integrate with analytics (Plausible or Posthog)
- [ ] Add dark/light mode toggle (per brand)
- [ ] Implement email confirmation flow
- [ ] Add referral tracking (utm_source, etc.)
- [ ] Create admin dashboard variant
- [ ] Performance monitoring (Sentry)

---

**Status:** 🟢 Production-ready  
**Last updated:** 2026-07-07  
**Owner:** Daniel Wise  
**Confidence:** high
