# WISE² UI Polish - Quick Reference Cheat Sheet

**Bookmark this page while polishing components.**

---

## Color Palette (Copy & Paste)

```tsx
// Backgrounds
#0a0a0a  // Primary (studio-bg)
#161616  // Input (studio-input)
#262626  // Border (studio-line)
#0d0d0d  // Card (studio-panel)

// Text
#ffffff  // Primary text
#999999  // Muted text
#666666  // Dimmed text

// Accents
#39FF14  // Neon green (wise-accent)
#1f4d18  // Accent dim
#b6ff9e  // Accent bright

// Status
#10b981  // Success (green)
#ef4444  // Error (red)
#f59e0b  // Warning (orange)
#0094ff  // Info (blue)
```

---

## Spacing (4px Multiples)

```
4px   = xs
8px   = sm
12px  = md
16px  = lg
24px  = xl
32px  = xxl
48px  = xxxl
```

---

## Common Component Imports

```tsx
import {
  Button,
  Input,
  Card,
  Skeleton,
  Toast,
  Badge,
  Divider,
  Tooltip,
} from '@/lib/ui-components';

import {
  useResponsive,
  useMobileMenu,
  useResponsiveSpacing,
  useKeyboardShortcuts,
} from '@/lib/ui-components';
```

---

## Component Quick Templates

### Button

```tsx
<Button variant="primary" size="md">
  Click Me
</Button>

// Variants: primary | secondary | tertiary | danger | ghost
// Sizes: sm | md | lg
// States: isLoading={true} | disabled
```

### Input

```tsx
<Input
  label="Field Name"
  placeholder="Enter value..."
  error={errorMessage}
  hint="Helper text"
  icon={<SearchIcon />}
/>
```

### Card

```tsx
<Card hoverable elevated>
  <h3>Title</h3>
  <p>Content</p>
</Card>
```

### Loading

```tsx
<Skeleton width="100%" height="20px" count={3} />
```

### Toast Notification

```tsx
<Toast
  type="success"
  title="Done!"
  message="Operation completed"
  onClose={() => setShowToast(false)}
/>
```

### Badge

```tsx
<Badge variant="success">Status</Badge>

// Variants: primary | success | warning | error | info | neutral
// Sizes: sm | md
```

---

## Responsive Grid

```tsx
// Mobile: 1 column
// Tablet: 2 columns
// Desktop: 4 columns

<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-4
">
  {items.map(item => <Card key={item.id}>{item.name}</Card>)}
</div>
```

---

## Breakpoints

```
Mobile:   < 768px   (375px test)
Tablet:   768px     (768px test)
Desktop:  1024px    (1024px test)
Wide:     1440px+   (1440px test)
```

---

## Tailwind Classes Reference

### States
```
hover:border-wise-accent
focus:outline-none focus:ring-2 focus:ring-wise-accent focus:ring-offset-2 focus:ring-offset-studio-bg
active:bg-studio-raised
disabled:opacity-50 disabled:cursor-not-allowed
```

### Responsive Text
```
text-xs md:text-sm lg:text-base
```

### Responsive Spacing
```
p-3 md:p-4 lg:p-6
gap-2 md:gap-3 lg:gap-4
mb-2 md:mb-3 lg:mb-4
```

### Responsive Display
```
block md:hidden          // Show mobile only
hidden md:block lg:hidden // Show tablet only
hidden lg:block          // Show desktop only
```

### Focus Ring (Keyboard Nav)
```
focus:outline-none
focus:ring-2
focus:ring-wise-accent
focus:ring-offset-2
focus:ring-offset-studio-bg
```

---

## Animations

### Entrance Animations
```
animate-slideIn      // Slide up + fade
animate-slideInLeft  // Slide from left
animate-slideInRight // Slide from right
animate-scaleIn      // Scale + fade
animate-fadeIn       // Fade only
```

### Continuous Animations
```
animate-accentPulse  // Glow pulse
animate-spin         // Spinner
animate-pulse        // Fade in/out
```

### Transitions
```
transition-all duration-150   // Fast
transition-all duration-200   // Normal (default)
transition-all duration-300   // Slow
```

---

## Glassmorphism

```tsx
// Glass effect
className="glass"

// Glass elevated
className="glass-elevated"

// CSS:
background: rgba(10, 10, 10, 0.8);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## Keyboard Shortcuts

```tsx
useKeyboardShortcuts({
  generate: () => console.log('Ctrl+G'),
  playPause: () => console.log('Space'),
  save: () => console.log('Ctrl+S'),
  close: () => console.log('Escape'),
});

// Built-in shortcuts:
// Ctrl+G (Cmd+G) = Generate
// Space = Play/Pause
// Ctrl+S (Cmd+S) = Save
// Escape = Close
```

---

## Mobile-Friendly

### Touch Targets (Minimum 44x44px)

```tsx
// Button
<button className="min-h-[44px] px-4 py-2.5">
  Touch Target
</button>

// Input
<input className="h-[44px] px-4" />
```

### Safe Area (Notch Awareness)

```tsx
// Top safe area (iPhone notch)
className="pt-safe"

// Bottom safe area (home indicator)
className="pb-safe"
```

---

## Error Handling Patterns

### Inline Error
```tsx
<Input
  error="This field is required"
/>

// Shows red border + error text below
```

### Error State
```tsx
<div className="state-error p-4 rounded-lg">
  <p className="font-semibold text-red-500">Error</p>
  <p className="text-sm text-gray-300">Something went wrong</p>
</div>
```

### Error Toast
```tsx
<Toast
  type="error"
  title="Failed"
  message="Could not save. Please try again."
  action={{
    label: 'Retry',
    onClick: retry,
  }}
  onClose={() => setToast(null)}
/>
```

---

## Success Feedback Patterns

### Success State
```tsx
<div className="state-success p-4 rounded-lg">
  <p className="font-semibold text-green-500">✓ Success!</p>
  <p className="text-sm text-gray-300">Operation completed</p>
</div>
```

### Success Toast
```tsx
<Toast
  type="success"
  title="Saved!"
  message="Your changes have been saved"
  onClose={() => setToast(null)}
/>
```

---

## Accessibility Quick Check

```
□ <button> tags (not <div> with onClick)
□ <input> with <label>
□ Focus ring appears on Tab
□ Color + icon for status (not just color)
□ aria-label for icon buttons
□ role="dialog" on modals
□ Escape closes dialogs
□ Screen reader can read all text
```

---

## Common Fixes

### Horizontal Overflow on Mobile

```tsx
// ❌ Bad
width: 100%

// ✅ Good
width: 100%; max-width: 100%;
```

### Text Too Small

```tsx
// ❌ Bad
className="text-xs"

// ✅ Good (12px minimum)
className="text-xs md:text-sm"
```

### Touch Targets Too Small

```tsx
// ❌ Bad
className="px-2 py-1"

// ✅ Good (44px minimum)
className="px-4 py-2.5"
```

### Modal Too Wide on Mobile

```tsx
// ❌ Bad
className="w-96"

// ✅ Good
className="w-full max-w-sm mx-4"
```

---

## Testing Commands

```bash
# Screenshot at all breakpoints
npm run screenshot:responsive

# Lighthouse audit
npm run audit:lighthouse

# Accessibility audit
npm run audit:a11y

# Build for production
npm run build
```

---

## Responsive Hooks

```tsx
// Detect device type
const { isMobile, isTablet, isDesktop } = useResponsive();

// Auto-scaling spacing
const { p, gap, rounded } = useResponsiveSpacing();

// Mobile menu state
const { isOpen, toggle, open, close } = useMobileMenu();

// Touch-friendly sizing
const { buttonHeight, inputHeight } = useTouchFriendly();

// Hover support detection
const supportsHover = useHoverSupport();

// Orientation (portrait/landscape)
const orientation = useOrientation();
```

---

## Common Patterns

### Responsive Navigation

```tsx
const { isMobile } = useResponsive();

return isMobile ? (
  <MobileDrawer>{navItems}</MobileDrawer>
) : (
  <DesktopSidebar>{navItems}</DesktopSidebar>
);
```

### Loading States

```tsx
{loading ? (
  <Skeleton count={3} />
) : results.length ? (
  results.map(r => <Card key={r.id}>{r.name}</Card>)
) : (
  <EmptyState />
)}
```

### Keyboard Shortcuts

```tsx
useKeyboardShortcuts({
  save: handleSave,
  playPause: handlePlayPause,
});

// Always show hint
<span className="text-xs text-gray-600">(Ctrl+S)</span>
```

---

## Debugging

**Component not styled?**
1. Import from `/lib/ui-components.tsx`
2. Check component prop spelling
3. Verify tailwind classes are recognized

**Focus ring not visible?**
1. Check: `focus:ring-2 focus:ring-wise-accent focus:ring-offset-2 focus:ring-offset-studio-bg`
2. May need `focus:outline-none` first

**Mobile looks wrong?**
1. Check viewport meta tag in head
2. Test at exactly 375px width
3. Look for fixed widths (use max-width instead)

**Responsive not working?**
1. Use mobile-first: `md:`, `lg:` prefixes
2. Check breakpoints: 768px (md), 1024px (lg)
3. Test in Chrome DevTools Device Mode

---

## Before You Submit

```
□ Tested at 375px (mobile)
□ Tested at 768px (tablet)  
□ Tested at 1024px (desktop)
□ All focus rings visible (Tab)
□ Hover states visible
□ Loading skeleton shows
□ Error/success states work
□ Keyboard shortcuts work
□ Touch targets > 44px on mobile
□ No console warnings/errors
□ Lighthouse > 90
□ Screenshot at all breakpoints in PR
```

---

## Useful Links

- **UI Components**: `/lib/ui-components.tsx`
- **Responsive Utils**: `/lib/responsive-utils.ts`
- **Style Guide**: `/PRODUCTION_UI_POLISH.md`
- **Examples**: `/COMPONENT_POLISH_EXAMPLES.md`
- **Testing**: `/RESPONSIVE_TESTING_GUIDE.md`
- **Implementation**: `/UI_POLISH_IMPLEMENTATION.md`

---

## Design Tokens Object

```tsx
import { UITokens } from '@/lib/ui-components';

UITokens.colors.bg        // #0a0a0a
UITokens.colors.accent    // #39FF14
UITokens.spacing.lg       // 16px
UITokens.radius.lg        // 8px
UITokens.shadows.accent   // Glow shadow
UITokens.transitions.normal // 200ms
UITokens.zIndex.modal     // 1200
```

---

## Version

**Quick Reference v1.0**  
**Last Updated**: July 24, 2026  
**Print this page & keep it handy!** 📋
