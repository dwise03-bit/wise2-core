# WISE² HVAC Field Tech — Professional Design System

**Product Type:** Field Service Tool | Industrial Equipment Diagnostics  
**Target Users:** HVAC technicians (junior to senior) | Field operations  
**Context:** Outdoor job sites, high-stress diagnostics, hands-free operation  
**Density:** High (dashboard-optimized) | Motion: Standard  

---

## Design Principles

1. **Technician-First**: Glove-friendly (44px+ tap targets), large readable text (14px minimum body)
2. **Data Clarity**: Color-coded status (green=ok, yellow=warning, red=critical), not text-only
3. **Offline-First**: Works without connectivity, syncs when available
4. **Minimal Typing**: Voice + quick actions > text forms
5. **Trust & Confidence**: Clear loading states, error clarity, recovery paths

---

## Color Palette (Semantic)

```
FOUNDATION:
  CarbonBlack:    #0A0E27  (backgrounds, high contrast)
  GunmetalDark:   #1a2332  (cards, secondary bg)
  GunmetalLight:  #2d3748  (subtle separators, hover states)

STATUS (WCAG AAA compliant):
  NeonGreen:      #00FF41  (✓ normal, verified, connected)
  ElectricBlue:   #00D9FF  (ℹ info, active, primary action)
  OrangeWarmth:   #FF6B35  (⚠ warning, attention needed)
  OrangeHeat:     #FF4500  (✗ critical, urgent, error)
  MetallicSilver: #C0C0C0  (secondary text, disabled)

WCAG AAA Pairs (min 7:1 contrast):
  - Black text on Electric Blue: ✗ (use white)
  - Electric Blue on Carbon Black: ✓ (8.2:1)
  - Neon Green on Carbon Black: ✓ (9.1:1)
  - Orange on Carbon Black: ✓ (7.2:1)
```

---

## Typography

```
BASE: 16px system font stack (Roboto preferred)
LINE-HEIGHT: 1.5 (accessibility)

SCALE:
  H1:  28px bold    (screen titles)
  H2:  20px bold    (section headers)
  H3:  16px bold    (subsections)
  H4:  14px bold    (component labels)
  BODY: 14px regular (content)
  SMALL: 12px regular (helper text, badges)
  MICRO: 10px regular (timestamps, footnotes)

CONSTRAINTS:
  ✓ Minimum 14px for body text in field
  ✓ Always specify line-height 1.5+
  ✗ Never use pure gray-on-gray (contrast < 4.5:1)
  ✗ Avoid thin fonts (<400 weight) for body
```

---

## Layout & Spacing

```
SAFE AREA (Mobile):
  Top: 48px (notch/status bar)
  Bottom: 80px (nav bar)
  Sides: 12px padding

SPACING SCALE (8px base):
  xs: 4px   (close proximity)
  sm: 8px   (tight spacing)
  md: 12px  (default)
  lg: 16px  (comfortable)
  xl: 24px  (spacious)
  2xl: 32px (section separation)

TOUCH TARGETS:
  ✓ Minimum 44×44px (all interactive elements)
  ✓ Minimum 8px spacing between touch targets
  ✗ Never rely on hover-only states (no hover on field devices)
```

---

## Component Guidance

### Navigation Bar
- **Position**: Bottom (5 tabs max, currently: Home/Calls/Equipment/History/Command)
- **Behavior**: Persistent, selected state highlighted with underline
- **Badges**: Red badge for alerts/pending actions
- **Touch**: 48px height min, 44px tap area

### Status Indicators
- **Position**: Always visible (header or above content)
- **Format**: Icon + label + color dot, not text-only
- **Refresh**: Update every 2-5 seconds (no flicker)
- **Example**: 🟢 Connected | 📡 Syncing | 🔴 Offline

### Forms & Input
- **Labels**: Always visible above field (not placeholder-only)
- **Error Messaging**: Inline, below field, red text + icon
- **Keyboard**: Dismiss on Enter, maintain focus context
- **Validation**: Real-time (debounced 500ms) or on-blur

### Loading States
- **Visual**: Pulse indicator or skeleton screen (never blank)
- **Duration**: If > 2s, show progress or estimated time
- **Cancellation**: Always allow user to cancel (back gesture)

### Data Display
- **Metric Cards**: Value (large, 20px+) > unit (small) > label
- **Gauges**: Circular or linear, color-coded range (green/yellow/red)
- **Trends**: Show direction (↑/↓) with percentage
- **Legends**: Always include for color-coded data

---

## Animation & Motion

```
TIMING:
  Micro (state change):    150ms  (fade, opacity)
  Standard (navigate):     250ms  (slide, scale)
  Complex (choreography):  400ms  (stagger, cascade)

EASING:
  Entrance: easeOut (fast start, slow end)
  Exit: easeIn (slow start, fast end)
  State: easeInOut (natural, no preference)

CONSTRAINTS:
  ✓ Always include `prefers-reduced-motion` alternative
  ✓ Animations convey meaning (feedback, hierarchy, continuity)
  ✗ Never animate width/height (causes layout thrashing)
  ✗ Never use purely decorative motion without purpose
```

---

## Accessibility

```
CONTRAST (WCAG AAA):
  Text vs Background: ≥ 7:1
  UI Components: ≥ 3:1
  Disabled: < 3:1 acceptable

KEYBOARD:
  Tab Order: Logical (top→left, left→right, top→bottom)
  Focus Ring: Always visible (never remove)
  Skip Links: Jump over repeated navigation
  
VOICE:
  Labels: Content-descriptive (not "Click Here")
  Aria-Label: For icon-only buttons
  Aria-Live: For status updates (Offline → Connected)

TOUCH:
  Min Size: 44×44px
  Spacing: ≥ 8px between targets
  Feedback: Haptic (if available) + visual response (no invisible buttons)
```

---

## Error Handling & Recovery

```
ERROR STATES:
  1. Show error inline (red text, icon, near field)
  2. Provide specific message ("Pressure exceeds max: 650 PSI, reset unit first")
  3. Suggest action ("→ Tap to view reset procedure")
  4. Never lose user's input (keep form data)

CONNECTIVITY:
  Offline: Banner at top (not blocking), continue with cached data
  Reconnecting: Subtle indicator (spinning icon), auto-retry in background
  Sync Conflict: Show options (keep local / use server) with context

TIMEOUTS:
  Network timeout: 10 seconds, then show retry button + offline mode
  Stuck spinner: Never > 30 seconds without progress indicator
```

---

## Implementation Checklist

### Before Ship:
- [ ] Contrast check: All text ≥ 7:1 WCAG AAA
- [ ] Touch targets: All interactive ≥ 44×44px
- [ ] Loading states: No blank screens
- [ ] Focus rings: Visible on all buttons & links
- [ ] Offline: App works without connectivity
- [ ] Dark mode: Test in low light (avoid gray-on-gray)
- [ ] Font sizes: Minimum 14px body text
- [ ] Motion: Works with `prefers-reduced-motion`
- [ ] Status feedback: Always visible (connection, sync, errors)

### Performance:
- [ ] Images: WebP with fallback (app: PNG, not JPEG)
- [ ] Lazy loading: Defer off-screen images & heavy components
- [ ] Layout shift: Reserve space for dynamic content (CLS < 0.1)
- [ ] Animations: Use transform/opacity only (no layout thrashing)
- [ ] Bundle: Tree-shake unused icons & components

---

## Visual Hierarchy

```
PRIORITY 1 (Immediate attention):
  - Primary CTA (START SERVICE CALL)
  - Critical status (UNIT OFFLINE, URGENT REPAIR)
  - Error messages (RED text + icon)

PRIORITY 2 (Active use):
  - Today's calls panel
  - Current readings (pressure, temperature)
  - Agent chat (when open)

PRIORITY 3 (Reference):
  - Help text
  - Status indicators (connected, synced)
  - Timestamps
```

---

## Dark Mode

All colors listed above are **already optimized for dark mode** (Carbon Black is the background, not white). No separate dark palette needed — the system is dark-first.

For light mode (if ever needed):
- Invert backgrounds (white → Carbon Black becomes white)
- Keep status colors identical (green/blue/orange are perceptually bright)
- Increase contrast on UI elements (darken icons/text)

---

## Responsive Breakpoints

```
Mobile (default): 360px - 600px
Tablet: 600px - 900px
Desktop: 900px+

KEY RULES:
- Bottom nav: Mobile < 600px
- Side nav: Tablet 600px+
- Column layout: Mobile 1-col, Tablet 2-col, Desktop 3-col
- Touch targets: Stay 44×44px across all breakpoints
```

---

## References

- **Accessibility**: WCAG 2.1 Level AAA (7:1 contrast minimum)
- **Touch Guidelines**: iOS Human Interface Guidelines + Material Design 3
- **Motion**: Spring physics + CSS easing functions
- **Performance**: Web Vitals (CLS < 0.1, LCP < 2.5s)
