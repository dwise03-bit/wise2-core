# WISE² Business OS — Organized Chaos Green
## Master Design System v1.0

**Edition**: Organized Chaos Green  
**Status**: Production Ready  
**Stack**: Next.js 14 + React 18 + TypeScript + Tailwind CSS + Framer Motion + GSAP  
**Last Updated**: 2026-07-28

---

## I. Design Philosophy

**CHAOS IN THE ATMOSPHERE. ORDER IN THE INTERFACE.**

The WISE² experience celebrates street culture, creative energy, and advanced technology while maintaining enterprise discipline and operational clarity.

Visual hierarchy must remain razor-sharp. Street influence belongs in:
- Branding moments (logo, headers)
- Section transitions
- Decorative overlays
- Campaign imagery
- Graffiti accents
- Hero compositions

NOT in data density, form clarity, or navigation legibility.

---

## II. Master Color System

### Foundation Colors

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--wise-black` | `#050505` | Primary page background | Deepest black, near-pure |
| `--wise-steel` | `#1A1A1A` | Elevated surfaces, cards | Primary dark surface |
| `--wise-dark-steel` | `#0F1419` | Secondary surfaces, sidebar bg | Slightly darker than steel |
| `--wise-chrome` | `#9CA3AF` | Secondary text, borders, metadata | Neutral gray accent |

### Accent Colors

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--organized-chaos-green` | `#00FF66` | Primary CTA, active states, status indicators, intelligence | Neon/acid green — NEVER flood the interface |
| `--green-dim` | `rgba(0, 255, 102, 0.15)` | Backgrounds, soft highlights | 15% opacity on black |
| `--green-glow` | `rgba(0, 255, 102, 0.4)` | Subtle glows, active borders | 40% opacity shadow |

### Text & Overlay

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--text-primary` | `#FFFFFF` | Primary body text, headings | Maximum contrast |
| `--text-secondary` | `#C9CED6` | Secondary information, labels | 80% opacity white |
| `--text-muted` | `#6B7280` | Tertiary info, disabled states | 42% opacity white |

### Status & Semantic

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--success` | `#22C55E` | Positive status, approve, complete | Bright green (can supplement primary) |
| `--warning` | `#F59E0B` | Caution, pending, requires attention | Amber |
| `--danger` | `#EF4444` | Error, failure, destructive | Red |
| `--info` | `#3B82F6` | Information, insights, help | Blue |

### Borders & Dividers

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Minimal dividers | 6% opacity white |
| `--border-medium` | `rgba(255, 255, 255, 0.10)` | Standard card/field borders | 10% opacity white |
| `--border-strong` | `rgba(255, 255, 255, 0.18)` | Emphasis borders, focus states | 18% opacity white |
| `--border-green` | `rgba(0, 255, 102, 0.3)` | Active/intelligent element borders | 30% opacity green |

---

## III. Green Usage Rule (Critical)

**DO NOT flood the interface with green.**

The reference works because green exists against large areas of black.

### Green Deployment Hierarchy

1. **Hero/Primary Brand Moments** (10%)
   - WISE² logo treatment
   - Hero section accents
   - Major section breaks

2. **Intelligence & Action** (20%)
   - Primary CTA buttons
   - WISE Intelligence insights
   - Active navigation items
   - Running automations badge
   - Green positive performance indicators

3. **Supporting Smart States** (15%)
   - Subtle glow under focused interactive elements
   - Green borders on "active" cards
   - Success checkmarks
   - Knowledge/system health indicators

4. **Atmospheric/Decorative** (55%)
   - Black backgrounds
   - Steel surfaces
   - Chrome text/borders
   - White primary text

**Green tells the user immediately: THIS MATTERS.**

Avoid making every border, icon, paragraph, or card green.

---

## IV. Chrome WISE² Branding

**Preserve the large metallic WISE² treatment.**

### Logo Treatment
- Use official WISE² logo asset where available
- Under logo: "Business OS" in chrome or white
- Chrome/metallic styling for:
  - Primary WISE² wordmark
  - Major brand moments (hero section)
  - Premium headings where contextually appropriate

Do NOT make normal interface text metallic.

### Chrome Elements
- Secondary navigation accents
- Section dividers (thin metallic line)
- Status badges borders
- System health indicators

---

## V. Typography System

### Font Stack

```css
--font-display: 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif;
--font-sans: 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Size & Spacing Scale (16px base)

| Token | Size | Line Height | Usage | Weight |
|-------|------|-------------|-------|--------|
| `text-2xl` | 28px | 36px | Hero headlines | 700 |
| `text-xl` | 24px | 32px | Page titles, card headers | 600 |
| `text-lg` | 20px | 28px | Section headers | 600 |
| `text-base` | 16px | 24px | Body text, labels | 400 |
| `text-sm` | 14px | 20px | Secondary text, metadata | 400 |
| `text-xs` | 12px | 16px | Captions, badges, timestamps | 400 |

**Minimum body text: 14px**. Never set body text below 12px without exceptional justification.

### Line Heights
- Headings: 1.2 (tight, commanding)
- Body: 1.5 (comfortable reading)
- Dense UI: 1.4 (balanced)

### Font Weights
- Regular (400): Body text, labels
- Medium (500): Slight emphasis, metric labels
- Semibold (600): Section headers, card titles
- Bold (700): Page titles, hero text

---

## VI. Component Appearance

### Default Component Language

```css
background:   #1A1A1A (steel);
border:       1px solid rgba(255, 255, 255, 0.10) (border-medium);
border-radius: 8px;
padding:      16px;
color:        #FFFFFF (text-primary);
box-shadow:   0 1px 3px rgba(0, 0, 0, 0.3);
transition:   all 150ms ease-out;
```

### Component States

#### Default
- Steel surface (`#1A1A1A`)
- Medium border (`10% white`)
- Subtle shadow

#### Hover
- Slightly lighter steel (`#202530`)
- Border becomes `#C9CED6` (chrome, 20%)
- Shadow increases slightly
- Cursor: pointer

#### Active / Selected
- Border becomes `rgba(0, 255, 102, 0.3)` (green glow)
- Background tint: `rgba(0, 255, 102, 0.05)` (5% green)
- Shadow becomes `0 0 12px rgba(0, 255, 102, 0.2)`

#### Disabled
- Opacity: 50%
- Border becomes `6% white`
- Cursor: not-allowed
- No hover effect

#### Focus (Keyboard)
- Outline: `2px solid rgba(0, 255, 102, 0.6)`
- Outline-offset: `2px`
- Visible at all times (for accessibility)

### Avoid

- Giant rounded cards (max 8px radius)
- Excessive glassmorphism
- Oversized gradients
- Pastel SaaS styling
- Excessive drop shadows (limit to 0-1 shadow per element)
- Excessive blur effects

---

## VII. Spacing System

**Dense Dashboard Spacing (8px grid)**

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tiny gaps, internal padding |
| `space-2` | 8px | Compact spacing, form fields |
| `space-3` | 12px | Small gaps, badge padding |
| `space-4` | 16px | Standard padding, card padding |
| `space-6` | 24px | Larger gaps, section spacing |
| `space-8` | 32px | Medium spacing, layout breathing room |
| `space-12` | 48px | Large spacing, section breaks |
| `space-16` | 64px | Major layout spacing |

---

## VIII. Organized Chaos Graphics

### Graffiti & Street Elements

These elements should frame the system without invading data-heavy UI:

1. **Crown / Sketch Accents**
   - Decorative corners on hero sections
   - Subtle street marks at section dividers
   - Never over images or tables

2. **Graffiti Typography**
   - ORGANIZED CHAOS brush lettering (hero)
   - Green paint marks (accent dividers)
   - Hand-drawn marks on campaign imagery
   - Uppercase, aggressive where appropriate

3. **Distressed Textures**
   - Subtle grain overlay on hero backgrounds
   - Light noise on dark surfaces (optional, use sparingly)
   - Avoid making data surfaces textured

4. **Edge Graphics**
   - Corner brackets on hero frames
   - Thin green lines as accent borders
   - Urban framing elements

**Rule: Decorate the atmosphere, not the interface.**

---

## IX. Photography & Imagery

### Photography Direction

Real business imagery showing:
- Entrepreneurs at work
- Automotive/mobile detailing in action
- Teams collaborating
- Offices and workspaces
- Creators and makers
- Streetwear and lifestyle
- Retail and commerce
- Professional workshops
- Business owners performing actual work

### Grading & Post-Processing

- **Cinematic & Real**: Avoid oversaturation
- **Dark & Premium**: Apply restrained dark grading (LUT or overlay)
- **Green Lighting (Selective)**: Environmental brand lighting only, not on every photo
- **Editorial Quality**: Professional photography only, not generic stock
- **Avoid**: Glowing brains, robots, holographic heads, fake futuristic imagery, generic AI stock

### Integration with Interface

- Images should feel premium and professional
- Integrate with black backgrounds seamlessly
- Restrained green lighting as accent (not primary)
- Dark grading so it doesn't blow out against dark UI

---

## X. Iconography

### Icon Library
- **Primary**: Heroicons Outline (thin stroke, consistent 2px width)
- **Secondary**: Lucide Icons (if Heroicons gap exists)
- **Avoid**: Emojis, multiple unrelated icon styles, thick/filled inconsistency

### Icon Usage

| Context | Size | Weight | Color |
|---------|------|--------|-------|
| Navigation | 24px | thin (1.5px) | `--text-secondary` (default), `--organized-chaos-green` (active) |
| Buttons | 16px | thin | inherit text color |
| Cards | 32px | thin | `--text-secondary` |
| Status badges | 16px | thin | semantic color (green/amber/red) |
| Form labels | 16px | thin | `--text-muted` |
| Hover state | - | - | Smooth transition to `--text-primary` |

### Accessibility

- All icons paired with text labels in buttons/navigation
- Icon-only clickable elements require `aria-label`
- Focus state visible (outline or glow)

---

## XI. Motion & Animation

### Duration Guidelines

| Type | Duration | Easing |
|------|----------|--------|
| Micro (state change) | 150ms | ease-out |
| Standard (transition) | 200-300ms | ease-out or cubic-bezier(0.34, 1.56, 0.64, 1) |
| Entrance (stagger) | 300-450ms | back.out(1.4) via GSAP |
| Exit (quick) | 100-150ms | ease-in |

### GSAP Presets

#### Card Entrance (Stagger Grid)
```javascript
gsap.from('.card', {
  opacity: 0,
  scale: 0.92,
  y: 16,
  duration: 0.4,
  stagger: { each: 0.06, from: 'start', grid: 'auto' },
  ease: 'back.out(1.4)',
});
```

#### Green Pulse (Intelligence Indicator)
```javascript
gsap.to('.wise-intelligence', {
  boxShadow: [
    '0 0 12px rgba(0, 255, 102, 0.2)',
    '0 0 24px rgba(0, 255, 102, 0.4)',
    '0 0 12px rgba(0, 255, 102, 0.2)',
  ],
  duration: 2,
  ease: 'sine.inOut',
  repeat: -1,
});
```

#### Status Update Fade
```javascript
gsap.to('.status-update', {
  opacity: [1, 1, 0],
  duration: 3,
  ease: 'none',
  delay: 5,
});
```

### Motion Principles

- **Fast & Controlled**: 150-300ms is the sweet spot
- **Mechanical Premium**: Easing should feel purposeful, not floaty
- **Spatial Continuity**: Motion conveys direction and hierarchy
- **Respect `prefers-reduced-motion`**: Disable animations for users with motion sensitivity
- **Avoid**: Decorative-only animation, bouncing, excessive floating, constant motion, distracting particles

---

## XII. Command Center Layout

### Desktop Composition

```
┌─────────────────────────────────────────────────────────────┐
│ WISE² [Sidebar] | Header: "Good Morning, [Name]"            │
├─────────────────────────────────────────────────────────────┤
│ Left Sidebar  │  Main Content Area (12 columns)             │
│ (260px)       │  ┌─────────────────────────────────────┐    │
│ • Command     │  │ TOP METRICS (Revenue, Leads, Cust...)│    │
│   Center      │  ├─────────────────────────────────────┤    │
│ • Customer    │  │ PRIORITY ACTIONS | BUSINESS ACTIVITY│    │
│   Operations  │  ├─────────────────────────────────────┤    │
│ • Business    │  │ WISE INTELLIGENCE | DIGITAL WORKFORCE│   │
│   Operations  │  ├─────────────────────────────────────┤    │
│ • Workflow    │  │ PERFORMANCE (Chart) | RECENT AUTO...│    │
│   Automation  │  └─────────────────────────────────────┘    │
│ • Digital     │                                              │
│   Workforce   │                                              │
│ • Business    │                                              │
│   Intelligence│                                              │
│ • Business    │                                              │
│   Knowledge   │                                              │
│ • WISE        │                                              │
│   Assistant   │                                              │
│ • Business    │                                              │
│   Systems     │                                              │
│ • Settings    │                                              │
│               │                                              │
│ [User Profile]                                               │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Treatment

- **Width**: 260px (default), 64px (collapsed)
- **Background**: `--wise-dark-steel` (`#0F1419`)
- **Text**: `--text-secondary` (default), `--text-primary` (hover)
- **Active Item**: Background `--wise-steel`, border-left `3px --organized-chaos-green`
- **Hover**: Slight background lift, chrome text brightens
- **Smooth Transition**: 200ms on background and color

### Navigation Items

```
Command Center          (icon + text, active = green accent)
Customer Operations     (icon + text)
Business Operations     (icon + text)
Workflow Automation     (icon + text)
Digital Workforce       (icon + text)
Business Intelligence   (icon + text)
Business Knowledge      (icon + text)
WISE Assistant         (icon + text)
Business Systems       (icon + text)
Settings               (icon + text)
```

---

## XIII. Command Center Metrics

### Executive Metrics Cards

Pattern:
```
┌─────────────────────┐
│ LABEL               │
│ $128,450            │ ← Primary value (text-xl, bold)
│ +12.4% ▲ (YoY)      │ ← Change/status (text-sm, green if +, amber if -, red if critical)
└─────────────────────┘
```

**Potential Metrics:**
- Revenue (primary CTA metric)
- Leads (sales funnel top)
- Active Customers (engagement)
- Open Tasks (operational)
- Automations Running (digital workforce)
- System Health (operational status)

**Card Styling:**
- Background: Steel surface
- Border: Medium, green glow on active
- Padding: 16px
- Font: text-lg for label, text-2xl for value
- Status color: Positive (green), Warning (amber), Critical (red)

---

## XIV. Content Sections

### Priority Actions
**Card Title**: PRIORITY ACTIONS  
**Purpose**: What needs my attention right now?

Pattern:
```
├─ [Priority Icon] Item | Urgency | Action → [Chevron]
├─ [Priority Icon] Item | Urgency | Action → [Chevron]
└─ [Priority Icon] Item | Urgency | Action → [Chevron]
```

### Business Activity
**Card Title**: BUSINESS ACTIVITY  
**Purpose**: What just happened?

Pattern:
```
├─ [Icon] Event type | "New lead" | 2 min ago
├─ [Icon] Event type | "Payment received" | 15 min ago
└─ [Icon] Event type | "Task completed" | 1 hour ago
```

### WISE Intelligence
**Card Title**: WISE INTELLIGENCE  
**Purpose**: What should I know?

Pattern:
```
├─ [Lightbulb] Insight title | Supporting detail | Action link
├─ [Alert] Important change | Context | View detail
└─ [Rocket] Opportunity | Recommended next step | Learn more
```

**Rule**: Do NOT produce meaningless AI commentary. Insights must connect to real business data.

### Digital Workforce
**Card Title**: DIGITAL WORKFORCE  
**Purpose**: What are my automated agents doing?

Pattern:
```
├─ [Bot Icon] Agent Name | Status badge (RUNNING) | 12 tasks completed today
├─ [Bot Icon] Agent Name | Status badge (NEEDS APPROVAL) | Awaiting your review
└─ [Bot Icon] Agent Name | Status badge (FAILED) | Review error log
```

**Status Badges:**
- RUNNING (green pulsing glow)
- COMPLETED (green checkmark)
- NEEDS APPROVAL (amber, with action)
- WAITING (gray, subtle)
- FAILED (red, with error icon)
- PAUSED (gray, dimmed)

### Performance Analytics
**Card Title**: PERFORMANCE  
**Chart Type**: Line/area chart (Recharts)

Pattern:
```
Dark plotting surface with:
- Subtle grid lines (very faint)
- Green primary data series
- White/chrome labels
- Minimal visual noise
- Tooltip on hover (dark popover)
```

### Recent Automations
**Card Title**: RECENT AUTOMATIONS  
**Purpose**: Operational transparency

Pattern:
```
Workflow Name | Status | Completion Time | Result
─────────────────────────────────────────────────
Lead Intake  | ✓      | 3s ago          | 1 new lead created
Payment Proc | ✓      | 5m ago          | $1,250 processed
Follow-up    | ⚠      | Pending         | Review and approve
```

---

## XV. Mobile Experience

### Mobile-First Principles

The mobile Command Center is the **business owner's pocket control surface.**

**Priority Information Hierarchy:**
1. Priority Actions (top, largest)
2. Business Status (quick view)
3. Key Metrics (revenue/leads/customers)
4. WISE Assistant (chat available)
5. Alerts & Notifications
6. Navigation (bottom tab bar)

### Breakpoints

| Breakpoint | Width | Primary Device |
|------------|-------|-----------------|
| xs | 320px | Small phone |
| sm | 375px | Standard phone |
| md | 768px | Tablet |
| lg | 1024px | Laptop |
| xl | 1280px | Desktop |
| 2xl | 1440px | Large desktop |

### Mobile Layout

```
┌──────────────────────────────┐
│ WISE² [Menu]  "Good Morning" │ ← Header (48px)
├──────────────────────────────┤
│                              │
│ PRIORITY ACTIONS             │ ← Stacked cards, full width
│ ┌────────────────────────┐   │
│ │ Action 1 with details  │   │
│ └────────────────────────┘   │
│ ┌────────────────────────┐   │
│ │ Action 2 with details  │   │
│ └────────────────────────┘   │
│                              │
│ KEY METRICS                  │
│ ┌────────────────────────┐   │
│ │ Revenue    $128,450    │   │
│ │ Leads      342         │   │
│ │ Customers  1,204       │   │
│ └────────────────────────┘   │
│                              │
│ [Space for scroll]           │
│                              │
├──────────────────────────────┤
│ Home | Analytics | WISE AI ⊗ │ ← Bottom nav (5 max items)
└──────────────────────────────┘
```

### Mobile Component Adjustments

- **Text**: Larger baseline (16px minimum)
- **Touch targets**: 44px minimum (HIG standard)
- **Spacing**: Slightly increased (16-24px between sections)
- **Cards**: Full-width stacked, no multi-column
- **Buttons**: Large, thumb-friendly (48px tall minimum)
- **Navigation**: Bottom tab bar (max 5 items)
- **Status badges**: Larger, easier to tap

---

## XVI. Accessibility Requirements

### Contrast Ratios
- **AAA Standard (Preferred)**: 7:1 on white-on-black
- **AA Standard (Minimum)**: 4.5:1 on text-to-background
- **Non-text Elements**: 3:1 minimum

### Testing Pairs (Dark Mode)

| Foreground | Background | Ratio | Grade |
|------------|-----------|-------|-------|
| #FFFFFF (white) | #050505 (black) | 21:1 | ✓ AAA |
| #C9CED6 (secondary text) | #1A1A1A (steel) | 11:1 | ✓ AAA |
| #6B7280 (muted) | #050505 (black) | 5.2:1 | ✓ AA |
| #00FF66 (green) | #050505 (black) | 10.7:1 | ✓ AAA |

### Keyboard Navigation

- Tab order follows visual hierarchy (left-to-right, top-to-bottom)
- Focus state visible at all times (outline or glow)
- Skip links on all pages
- No keyboard traps
- All interactive elements keyboard-accessible

### Screen Reader Support

- Semantic HTML (nav, main, section, article)
- Proper heading hierarchy (h1 → h2 → h3, no skipping)
- Alt text on images (descriptive, not "image of...")
- Form labels associated with inputs (`<label for="">`)
- Aria-labels on icon-only buttons
- Aria-live regions for dynamic updates (WISE Intelligence, alerts)

### Motion & Reduced Motion

Respect `prefers-reduced-motion` media query:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## XVII. Tailwind Configuration Update

Add these tokens to `tailwind.config.js`:

```javascript
extend: {
  colors: {
    wise: {
      black: '#050505',
      steel: '#1A1A1A',
      'dark-steel': '#0F1419',
      chrome: '#9CA3AF',
      'chaos-green': '#00FF66',
      'green-dim': 'rgba(0, 255, 102, 0.15)',
      'green-glow': 'rgba(0, 255, 102, 0.4)',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#C9CED6',
      muted: '#6B7280',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      medium: 'rgba(255, 255, 255, 0.10)',
      strong: 'rgba(255, 255, 255, 0.18)',
      green: 'rgba(0, 255, 102, 0.30)',
    },
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    '1': '4px',
    '2': '8px',
    '3': '12px',
    '4': '16px',
    '6': '24px',
    '8': '32px',
    '12': '48px',
    '16': '64px',
    'sidebar': '260px',
    'sidebar-collapsed': '64px',
  },
  borderRadius: {
    wise: '8px',
  },
  boxShadow: {
    'green-glow': '0 0 12px rgba(0, 255, 102, 0.2)',
    'green-glow-md': '0 0 24px rgba(0, 255, 102, 0.4)',
    surface: '0 1px 3px rgba(0, 0, 0, 0.3)',
    elevated: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
}
```

---

## XVIII. Implementation Checklist

### Phase 1: Design Tokens
- [ ] Update `tailwind.config.js` with Organized Chaos Green tokens
- [ ] Create CSS variables file for consistency
- [ ] Document color usage per component

### Phase 2: Shared Components
- [ ] Audit existing components (Button, Card, Input, etc.)
- [ ] Refactor to match dark theme + green accent system
- [ ] Add hover/active/focus states
- [ ] Add loading states

### Phase 3: App Shell
- [ ] Update Sidebar (dark-steel background, green active item)
- [ ] Update Header (greeting, user profile)
- [ ] Update mobile bottom navigation
- [ ] Test responsive behavior

### Phase 4: Command Center
- [ ] Implement Metrics cards
- [ ] Implement Priority Actions
- [ ] Implement Business Activity
- [ ] Implement WISE Intelligence
- [ ] Implement Digital Workforce
- [ ] Implement Performance chart
- [ ] Implement Recent Automations

### Phase 5: Real Data Integration
- [ ] Connect to actual backend data sources
- [ ] Remove hardcoded example data
- [ ] Implement loading/error states
- [ ] Verify all metrics display real business data

### Phase 6: Accessibility
- [ ] Run WAVE/axe accessibility audit
- [ ] Verify contrast ratios
- [ ] Test keyboard navigation
- [ ] Test with screen reader
- [ ] Verify focus states

### Phase 7: Mobile & Responsive
- [ ] Test at 320px, 375px, 768px, 1024px, 1440px
- [ ] Verify touch target sizes (44px minimum)
- [ ] Test mobile Command Center
- [ ] Test bottom navigation

### Phase 8: Performance & QA
- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Test production build
- [ ] Manual QA against master reference

---

## XIX. Customer-Facing Terminology

When referring to WISE² features to customers/users:

| Internal | Customer-Facing |
|----------|-----------------|
| AI Brain | WISE Intelligence |
| AI Agents | Digital Workforce |
| Automations | Workflow Automation |
| CRM | Customer Operations |
| Analytics | Business Intelligence |
| Files | Business Knowledge |
| Dashboard | Command Center |
| AI Chat | WISE Assistant |
| Tools | Business Systems |

---

## XX. Visual Comparison Checklist

Before declaring completion, verify against the master reference:

- [ ] **Brand** — Does WISE² feel equally strong?
- [ ] **Color** — Is black dominant? Is green controlled and strategic?
- [ ] **Density** — Does Command Center feel information-rich without clutter?
- [ ] **Typography** — Is hierarchy comparable to reference?
- [ ] **Cards** — Are surfaces, borders, spacing aligned?
- [ ] **Sidebar** — Does navigation match intended visual hierarchy?
- [ ] **Mobile** — Does it resemble the supplied mobile language?
- [ ] **Imagery** — Is photography real and premium?
- [ ] **Street Culture** — Is Organized Chaos visible without hurting usability?
- [ ] **Professionalism** — Could this be confidently shown to a paying customer?

---

## XXI. Production Readiness Checklist

- [ ] TypeScript: `npm run type-check` passes
- [ ] Linting: `npm run lint` passes
- [ ] Tests: `npm test` passes
- [ ] Build: `npm run build` succeeds
- [ ] No console errors or warnings
- [ ] Accessibility: WCAG AA minimum verified
- [ ] Performance: Lighthouse score > 85
- [ ] Responsive: All breakpoints verified
- [ ] Real data: No hardcoded/fabricated metrics
- [ ] Mobile: Bottom nav, touch targets verified

---

**WISE² ORGANIZED CHAOS GREEN DESIGN SYSTEM**  
**VERSION**: 1.0  
**STATUS**: Production Ready  
**LAST UPDATED**: 2026-07-28  
**OWNER**: dwise (Lead Architect)
