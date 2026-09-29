# 📋 WISE².net Brand Brief

**Document Version**: 1.0  
**Created**: 2026-09-21  
**Status**: SPECIFICATION COMPLETE ✅  
**Purpose**: Guide all design rebuilds using TasteSkill, Impeccable, and Awesome Design  

---

## Section 1: Brand Identity

### Purpose
**wise2.net is the flagship operating system for founders and operators building their business.**

Not a consumer product. Not a design agency. Not a SaaS with marketing fluff.

A **serious, builder-focused platform** for business automation, AI, infrastructure, and real-world results.

### Tagline
**"Intelligent Tools for Real-World Businesses"**

Alternative: **"BUILD DIFFERENT"** (from logo)

### Hero Message
```
BUILDING EMPIRES.
CHANGING CULTURE.      ← #00FF7F neon green
TOGETHER.
```

### Brand Personality
- Professional (not playful)
- Action-oriented (not contemplative)
- Builder-focused (not consumer-friendly)
- Enterprise-grade (not startup)
- No-nonsense (not marketing-heavy)
- Accessible (not gatekept)

---

## Section 2: Color Palette (LOCKED)

**Source**: Brand Lock v2.0 (2026-09-13) — IMMUTABLE

| Name | Hex | Usage | Role |
|------|-----|-------|------|
| **Navy Primary** | `#050607` | Primary background, authority | Main container, text authority |
| **Charcoal Secondary** | `#0a0f1a` | Secondary background, depth | Card backgrounds, layering |
| **Cyan Primary CTA** | `#00D9FF` | Primary action buttons, focus states | Calls-to-action, interactive elements |
| **Neon Green Success** | `#00FF7F` | Success, active, hero accent | Status indicators, hero tagline |
| **Gold Secondary** | `#C4A369` | Premium accent, secondary CTA | Secondary actions, quality signals |
| **Light Gray Text** | `#D1D5DB` | Body text, readability | Default text color, high contrast |
| **Dark Gray UI** | `#1f2937` | Subtle text, disabled states | Secondary text, disabled UI |

### Implementation Rule
**DO NOT:**
- Use cream/warm backgrounds (2026 AI tell)
- Use purple gradients (2024 AI tell)
- Use Inter font alone (generic default)
- Use untouched Tailwind colors
- Use rounded-full on everything (pill aesthetic)

**DO:**
- Use navy + cyan + neon green as the core
- Use high contrast for accessibility (WCAG AA minimum)
- Use these colors deliberately, not as defaults
- Mark intentional choices if deviating

---

## Section 3: Typography

### Font Stack (LOCKED)

**Headings (Display)**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
font-weight: 700;
letter-spacing: -0.02em;
text-transform: uppercase;
```

**Body Text**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
font-weight: 400;
letter-spacing: 0em;
line-height: 1.6;
```

**Monospace (Code/Technical)**:
```css
font-family: 'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
font-weight: 400;
```

### Type Scale

| Usage | Size | Weight | Line Height |
|-------|------|--------|-------------|
| Hero H1 | 56–72px | 900 (black) | 1.1 |
| Section H2 | 36–48px | 700 (bold) | 1.2 |
| Subsection H3 | 24–32px | 600 (semibold) | 1.3 |
| Card Title H4 | 18–20px | 600 | 1.4 |
| Body Text | 14–16px | 400 | 1.6 |
| Small/Caption | 12px | 400 | 1.5 |
| Tagline | 12px | 700 | 1.4 |

### DO NOT Use
- ❌ Serifs (Cormorant, Instrument Serif, Playfair, Fraunces)
- ❌ Multiple display typefaces (one font + one accent max)
- ❌ Lowercase headings (use uppercase + tracking)
- ❌ Thin or light weights for body text
- ❌ Small line-height on body (min 1.6)

---

## Section 4: Reference & Inspiration

### Primary Reference: Stripe

**Why**: Serious, builder-focused, minimal-but-intentional, high-trust design

**What to Learn**:
- High contrast, dark backgrounds, bright CTAs
- Serious sans-serif, no decorative fonts
- Functional layouts, no unnecessary motion
- Clear hierarchy (hero → features → proof → action)
- Professional without being sterile

**What NOT to Copy**:
- Don't use their exact colors (use WISE² locked palette)
- Don't use their serif displays (use system sans-serif + uppercase + tracking)
- Don't use their exact spacing (establish your own scale)

### Secondary References
- **Linear** — Dense information architecture, high contrast, builder UI
- **Vercel** — Minimal, intentional, strong CTAs
- **AWS Console** — Enterprise-grade, accessibility-first

### What NOT to Reference
- ❌ Notion (cream + serif default)
- ❌ Figma (subtle colors, hard to read at distance)
- ❌ Webflow (decorative, design-focused, not builder)

---

## Section 5: Audience

### Primary Users
- **Founders** — Building their business OS, automating workflows
- **Operators** — Running the business day-to-day, need visibility
- **Executives** — Need dashboards, reports, strategic insights

### Context
- Users are **busy** — they scan, don't read
- Users are **skeptical** — too many AI products failing
- Users are **serious** — not here for design innovation, want results
- Users are **technical** — can handle dense information if organized well

### Not the Audience
- ❌ Consumers (this is B2B)
- ❌ Designers (they're using this, not reading design)
- ❌ Non-technical users (assume builder literacy)

---

## Section 6: Layout Intent

### Information Architecture

```
Homepage
├── Hero (message + dual CTA)
├── Value Prop (3–4 core features)
├── Social Proof (logos, testimonials, metrics)
├── Feature Deep-Dive (dense sections, grid)
├── Pricing/Offerings
├── Call to Action (final push)
└── Footer (links, legal)
```

### Design Principles

1. **High Contrast, No Subtlety**
   - Text must be readable at a glance
   - Cyan on navy. Neon on navy. White on navy.
   - No gray-on-gray or low-contrast color combos

2. **Intentional Density**
   - Founders expect information density
   - Not a consumer product → don't hide features
   - Generous whitespace to separate sections

3. **Clear Hierarchy**
   - H1 = biggest, most important message
   - H2 = section dividers
   - H3/H4 = subsection details
   - Body = supporting information
   - No more than 3 text weights per page

4. **Functional CTAs**
   - Primary CTA = Cyan (#00D9FF) background, dark text
   - Secondary CTA = Outlined (white or cyan border)
   - Success state = Neon green (#00FF7F)
   - All CTAs are UPPERCASE + letter-spacing

5. **Grid Over Organic**
   - Organized layout (grid-based, not organic curves)
   - Aligned edges, consistent gutters
   - No "artistic" layouts (that's the AI tell)

---

## Section 7: Component Palette

### Buttons

**Primary CTA** (Main action)
```
Background: #00D9FF (Cyan)
Text: #050607 (Navy), bold, uppercase
Padding: 12px 24px
Border-radius: 4px (sharp corners, not rounded)
Letter-spacing: 0.12em
Hover: Darken cyan 20%, slight lift (translate -2px)
```

**Secondary CTA** (Alternative action)
```
Background: transparent
Border: 1px #D1D5DB (light gray)
Text: #D1D5DB, bold, uppercase
Hover: Border + text → #00D9FF
```

**Success State** (Completed action)
```
Background: #00FF7F (Neon green)
Text: #050607 (Navy)
Same padding + radius as primary
```

### Cards

**Default Card**
```
Background: rgba(10, 15, 26, 0.5)  [charcoal with transparency]
Border: 1px rgba(0, 217, 255, 0.2) [subtle cyan outline]
Padding: 24px
Border-radius: 4px
```

**Success Card** (positive status)
```
Border-left: 4px #00FF7F
Add light green tint if needed (rgba(0, 255, 127, 0.05))
```

**Critical Card** (error/warning)
```
Border-left: 4px #FF4444 (red)
Use sparingly, only for errors
```

### Status Indicators

| State | Color | Usage |
|-------|-------|-------|
| Success/Active | #00FF7F | Checkmarks, active states, healthy status |
| Warning | #F59E0B | Pending actions, cautions |
| Error/Critical | #FF4444 | Errors, failures, stop states |
| Info | #3B82F6 | Informational messages |
| Disabled | #606060 | Disabled buttons, inactive UI |

### Spacing Scale

```css
2px, 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px
[Use multiples of 4 for consistency]
```

### Border Radius

```css
0px (none) — nav, hero, blocks
4px (small) — buttons, cards, inputs
8px (medium) — larger containers
16px (large) — edge cases, only if intentional
DO NOT use: 9999px (pill effect = AI tell)
```

---

## Section 8: Motion & Interaction

### Hover States
- Button lift: `transform: translateY(-2px)` (subtle, 0.2s ease)
- Color shift: Darken or brighten by 15–20% (0.15s ease)
- No arbitrary motion or animations

### Loading States
- Use skeleton loaders (gray pulse) or spinner
- Spinner color: #00D9FF (cyan)
- No floating particles or "cute" loading animations

### Transitions
- All interactive: `transition 0.15s ease`
- Hover, focus, active: max 0.2s
- Page load: no animation (load fast, appear instantly)

### DO NOT
- ❌ Slide-in animations on page load
- ❌ Floating/bouncing elements
- ❌ Blur effects or glassmorphism
- ❌ Gradient animations
- ❌ Parallax scrolling

---

## Section 9: Accessibility (WCAG AA Minimum)

### Contrast Ratios
- **Text on background**: Minimum 4.5:1 (AA standard)
- **Large text (18px+)**: Minimum 3:1
- Test all color combinations before shipping

### Interactive Elements
- All buttons/links must have `:focus` states (visible focus ring)
- Focus ring color: #00D9FF (cyan)
- Focus ring width: 2px

### Text
- No text smaller than 12px
- Line-height minimum 1.4
- No justify text alignment (use left or center)

### Images & Icons
- All images must have `alt` text
- Icons paired with text labels
- No icon-only buttons (add text or aria-label)

---

## Section 10: What This Brief Prevents

**Forbidden (AI Tell List)**

| Tell | Why It's Bad | What to Do Instead |
|------|--------------|-------------------|
| Cream + Serif Display | 2026 Claude default | Use navy + system sans-serif + uppercase |
| Purple-to-Blue Gradient | 2024 default | Use solid cyan or navy |
| Rounded Everything (9999px) | Maximized default | Use 0–8px radius only |
| Inter Alone | Generic starter font | Lock this design: system sans-serif |
| Hero + Three Cards (no brief) | Median template | Specify audience + layout intent first |
| Centered Text Blocks | Startup default | Use left-aligned or grid layout |
| Untouched shadcn Colors | Default component | Override with WISE² palette |
| Gray on Gray | Low contrast, inaccessible | Use cyan/neon green on navy |
| Mesh/Blob Backgrounds | Decorative, distracting | Use solid navy + sharp edges |

---

## Section 11: Implementation Checklist

### Before Building Any Page
- [ ] Read this brief (full)
- [ ] Reference a real site (Stripe, Linear, or similar)
- [ ] Confirm color palette (navy + cyan + neon green + gold)
- [ ] Confirm typeface (system sans-serif, no serifs)
- [ ] Establish layout intent (grid? flow? density?)
- [ ] No blank prompts (every design choice intentional)

### While Building
- [ ] Use CSS variables for colors (`--wise-dark`, `--wise-blue`, etc.)
- [ ] Test contrast ratios (WCAG AA)
- [ ] Use TasteSkill + Impeccable commands
- [ ] Buttons are UPPERCASE + letter-spacing
- [ ] No serif fonts, no cream backgrounds, no pills
- [ ] Mark intentional deviations with `unslop-ignore` comments

### After Building
- [ ] Run unslop-ui scanner (`python3 scripts/devibe_scan.py ...`)
- [ ] Run Impeccable critique (`/impeccable critique`)
- [ ] Test with Playwright (buttons work, forms submit, responsive)
- [ ] Screenshot at mobile (375px) + tablet (768px) + desktop (1440px)
- [ ] Vibe score target: < 500 (or 50%+ reduction from last audit)

### Deployment Gate
- [ ] unslop-ui scanner passes (no high-severity tells)
- [ ] Playwright tests pass (all flows work)
- [ ] Contrast ratios pass (WCAG AA minimum)
- [ ] No cream backgrounds, no serifs, no pills

---

## Section 12: Quick Reference

### The Locked Brand
```
Color:  Navy #050607 + Cyan #00D9FF + Neon #00FF7F + Gold #C4A369
Type:   System sans-serif (no serifs)
Mood:   Professional, action-oriented, no-nonsense, builder-focused
Layout: Grid-based, information-dense, high-contrast
Message: "Intelligent Tools for Real-World Businesses"
```

### The Three Commands
```bash
# 1. Establish your brief (generate from brief spec)
python3 clients/vibecoded-design-tells/skill/scripts/devibe_scan.py ... --json

# 2. Rebuild with TasteSkill in Claude Code
(Use /taste-skill or /redesign-skill command in Claude Code)

# 3. Verify with Impeccable + Playwright
/impeccable critique
playwright-cli open https://wise2.net --headed
```

### The One Rule
**Make a deliberate choice and be able to say why.**
Any color, any font, any layout choice — if you can explain why it's not a default, it's good. If it's the median guess from training data, it's slop.

---

## Sign-Off

**Brief Owner**: dwise (dwise03@gmail.com)  
**Brand Lock Source**: wise2.net hero (2026-09-13)  
**Design System**: WISE² Enterprise v10.0  
**Reference**: Stripe dashboard (serious, builder-focused, high-contrast)

**Status**: ✅ COMPLETE AND LOCKED

Use this brief for:
- ✅ TasteSkill rebuilds
- ✅ Impeccable audits
- ✅ Playwright verification
- ✅ Awesome Design style selection
- ✅ Any wise2.net page redesign

**No changes to brand lock, colors, or core messaging without dwise approval.**

---

**Document History**

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-09-21 | Initial brand brief, locked colors, reference sites, implementation checklist |

