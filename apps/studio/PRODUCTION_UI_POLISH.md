# WISE² Production UI Polish Guide

## Overview

This guide provides comprehensive standards for polishing all UI components to production-grade quality across Sound Lab, Live Studio, and Creative Studio.

### Design Philosophy

- **Dark Theme Consistency**: #0a0a0a background, #39FF14 neon green accents
- **Glassmorphism**: Layered cards with subtle borders and transparency
- **Kinetic Typography**: Rajdhani font for body, Orbitron for display
- **Responsive Priority**: Mobile-first, stack on small screens
- **Accessibility First**: Full keyboard navigation, focus rings, semantic HTML

---

## 1. SPACING & TYPOGRAPHY

### Base Unit: 4px

Use multiples of 4 for consistent spacing:
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **xxl**: 32px
- **xxxl**: 48px

### Typography Hierarchy

```
Display:  Orbitron Bold, 24-32px, tracking-widest
Heading:  Rajdhani Bold, 16-20px, tracking-wide
Body:     Rajdhani Regular, 14px, tracking-normal
Caption:  Rajdhani Regular, 12px, text-muted
Label:    Rajdhani Semibold, 12px, uppercase, tracking-wide
```

### Color Palette

```
Background:     #0a0a0a (studio-bg)
Surface:        #161616 (studio-raised)
Card:           #0d0d0d (studio-panel)
Border:         #262626 (studio-line)
Text Primary:   #ffffff
Text Secondary: #999999 (text-muted)
Text Dimmed:    #666666 (text-dimmed)

Accent Primary: #39FF14 (wise-accent)
Accent Dim:     #1f4d18 (wise-accent-dim)
Accent Bright:  #b6ff9e (wise-accent-bright)

Status:
  Success: #10b981
  Error:   #ef4444
  Warning: #f59e0b
  Info:    #0094ff
```

---

## 2. BUTTONS

### Button States

All buttons must include:

1. **Default**: Normal state
2. **Hover**: Brightened, shadow glow
3. **Active**: Pressed appearance
4. **Focus**: Ring outline (keyboard nav)
5. **Disabled**: 50% opacity, no-pointer-events

### Implementation Pattern

```tsx
import { Button } from '@/lib/ui-components';

export function MyComponent() {
  return (
    <>
      <Button variant="primary" size="md">
        Generate (Ctrl+G)
      </Button>

      <Button variant="secondary" size="md">
        Save (Ctrl+S)
      </Button>

      <Button variant="danger" size="sm">
        Delete
      </Button>

      <Button isLoading>
        Processing...
      </Button>
    </>
  );
}
```

### Variants

- **primary**: Neon green (#39FF14), bold, glowing hover
- **secondary**: Dark with border, muted hover
- **tertiary**: Transparent with accent on hover
- **danger**: Red (#ef4444) with warning glow
- **ghost**: Invisible until hover

### Sizes

- **sm**: 8px h, 12px text
- **md**: 10px h, 14px text (default)
- **lg**: 12px h, 16px text

---

## 3. INPUTS & FORMS

### Input States

```tsx
import { Input } from '@/lib/ui-components';

export function FormExample() {
  return (
    <div className="space-y-4">
      <Input
        label="Project Name"
        placeholder="Enter name..."
        hint="Give your project a memorable name"
      />

      <Input
        label="Password"
        type="password"
        error="Password must be at least 8 characters"
      />

      <Input
        label="Search"
        icon={<SearchIcon />}
        placeholder="Search projects..."
      />
    </div>
  );
}
```

### Input Features

- Default: #161616 background, #262626 border
- Focus: #39FF14 ring, bright border
- Error: Red border, red error text below
- Hint: Gray text below input
- Icon: Left-aligned, gray until focus
- Disabled: 50% opacity

---

## 4. CARDS & CONTAINERS

### Card Pattern

```tsx
import { Card } from '@/lib/ui-components';

export function CardExample() {
  return (
    <Card hoverable elevated>
      <h3 className="text-sm font-semibold text-white mb-2">
        Track Title
      </h3>
      <p className="text-xs text-gray-400">
        Card content goes here
      </p>
    </Card>
  );
}
```

### Card Variants

- **default**: #0d0d0d bg, #262626 border
- **elevated**: Adds shadow-lg
- **hoverable**: Border glow on hover, cursor pointer

### Responsive Containers

```tsx
// Mobile: Full width, stack
// Tablet: 2 columns
// Desktop: 3-4 columns, gap-4

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>
```

---

## 5. LOADING STATES

### Skeleton Loader Pattern

```tsx
import { Skeleton } from '@/lib/ui-components';

export function LoadingState() {
  return (
    <div className="space-y-3">
      <Skeleton height="20px" />
      <Skeleton height="20px" count={3} />
      <Skeleton height="100px" rounded />
    </div>
  );
}
```

### Loading Spinner

```tsx
<div className="w-6 h-6 border-2 border-wise-accent border-t-transparent rounded-full animate-spin" />
```

### Loading Pattern in Buttons

```tsx
<Button isLoading>
  Processing...
</Button>
```

---

## 6. ERROR & SUCCESS FEEDBACK

### Toast Notifications

```tsx
import { Toast } from '@/lib/ui-components';

export function ToastExample() {
  const [toast, setToast] = React.useState<ToastProps | null>(null);

  return (
    <>
      <Button onClick={() => setToast({
        type: 'success',
        title: 'Success!',
        message: 'Your project has been saved.',
        onClose: () => setToast(null),
      })}>
        Show Success
      </Button>

      {toast && <Toast {...toast} />}
    </>
  );
}
```

### Inline Error States

```tsx
<div className="state-error p-4 rounded-lg border-l-4 border-red-500">
  <p className="font-semibold text-red-500">Error</p>
  <p className="text-sm text-gray-300">Something went wrong. Please try again.</p>
</div>
```

### Inline Success States

```tsx
<div className="state-success p-4 rounded-lg border-l-4 border-green-500">
  <p className="font-semibold text-green-500">Success!</p>
  <p className="text-sm text-gray-300">Operation completed successfully.</p>
</div>
```

---

## 7. KEYBOARD SHORTCUTS

### Global Shortcuts (Implemented)

- **Ctrl+G** (Cmd+G on Mac): Generate
- **Space**: Play/Pause
- **Ctrl+S** (Cmd+S on Mac): Save Scene
- **Escape**: Close Modal/Menu

### Implementation

```tsx
import { useKeyboardShortcuts } from '@/lib/ui-components';

export function MyComponent() {
  useKeyboardShortcuts({
    generate: () => console.log('Generate'),
    playPause: () => console.log('Play/Pause'),
    save: () => console.log('Save'),
    close: () => console.log('Close'),
  });

  return (
    <div>
      <Button>
        Generate <span className="text-xs text-gray-500">(Ctrl+G)</span>
      </Button>
    </div>
  );
}
```

---

## 8. RESPONSIVE DESIGN

### Breakpoints

```
Mobile:   < 768px   (375px - 767px test)
Tablet:   768px+    (768px - 1023px test)
Desktop:  1024px+   (1024px - 1440px+ test)
```

### Mobile-First Pattern

```tsx
// Mobile: 1 column stack
// Tablet: 2 columns
// Desktop: 4 columns

<div className="
  grid grid-cols-1
  md:grid-cols-2
  lg:grid-cols-4
  gap-4
">
  {/* Items */}
</div>

// Hide on small screens
<div className="hidden md:block">Desktop only</div>

// Show only on mobile
<div className="md:hidden">Mobile only</div>
```

### Sidebar Collapse on Mobile

```tsx
// Desktop: Sidebar + Content (side by side)
// Mobile: Sidebar as overlay/drawer

<div className="flex gap-4">
  <aside className="hidden lg:block w-64 flex-none">
    {/* Sidebar */}
  </aside>
  <main className="flex-1">
    {/* Content */}
  </main>
</div>
```

---

## 9. FOCUS & ACCESSIBILITY

### Keyboard Navigation

All interactive elements must have focus rings:

```tsx
className="
  focus:outline-none
  focus:ring-2
  focus:ring-wise-accent
  focus:ring-offset-2
  focus:ring-offset-studio-bg
"
```

### Semantic HTML

```tsx
// Good
<button onClick={save}>Save</button>
<input type="email" />
<nav>Navigation</nav>

// Avoid
<div onClick={save}>Save</div>
<div type="email"></div>
```

### ARIA Labels

```tsx
<button
  aria-label="Close dialog"
  aria-pressed={isActive}
>
  ✕
</button>
```

---

## 10. ANIMATIONS & TRANSITIONS

### Transition Classes

```tsx
// Smooth transitions on color/opacity changes
className="
  transition-all
  duration-200
  ease-in-out
"

// Fast transitions
className="duration-150"

// Slow transitions
className="duration-300"
```

### Entrance Animations

```tsx
// Slide in from bottom
<div className="animate-slideIn">Content</div>

// Slide in from left
<div className="animate-slideInLeft">Menu</div>

// Slide in from right
<div className="animate-slideInRight">Panel</div>

// Scale + fade
<div className="animate-scaleIn">Modal</div>
```

### Accent Glow Pulse

```tsx
<button className="animate-accentPulse">
  Generate
</button>
```

---

## 11. TESTING CHECKLIST

### Visual Testing at All Breakpoints

```
375px   (mobile)   - Full stack, readable text
768px   (tablet)   - 2-col layout, balanced spacing
1024px  (desktop)  - Multi-col layout, full features
1440px  (wide)     - No excessive whitespace
```

### Component Polishing Checklist

For each component, verify:

- [ ] **Spacing**: 4px multiples, consistent padding/margins
- [ ] **Typography**: Correct size, weight, color
- [ ] **States**: Normal, Hover, Active, Focus, Disabled all visible
- [ ] **Borders**: Consistent 1px studio-line color
- [ ] **Focus Ring**: Visible on Tab navigation
- [ ] **Loading**: Skeleton or spinner appears during loading
- [ ] **Error**: Red border + error message below
- [ ] **Success**: Green highlight + success message
- [ ] **Animations**: Smooth transitions, no jarring changes
- [ ] **Responsive**: Stacks properly on mobile
- [ ] **Dark Theme**: Readable contrast on #0a0a0a bg
- [ ] **Hover Effects**: Border glow or color change visible
- [ ] **Keyboard**: All features accessible via Tab+Enter

---

## 12. PRODUCTION BUILD CHECKS

Before deployment:

1. **Performance**
   - [ ] No console warnings
   - [ ] Lighthouse > 90
   - [ ] < 3s load time

2. **Accessibility**
   - [ ] axe DevTools scan passes
   - [ ] Tab navigation works
   - [ ] Screen reader reads all content

3. **Responsive**
   - [ ] Works on iPhone/Android
   - [ ] No horizontal scroll
   - [ ] Touch targets > 44px

4. **Cross-browser**
   - [ ] Chrome/Firefox/Safari/Edge
   - [ ] No rendering glitches
   - [ ] Fonts load correctly

---

## Quick Reference Components

### Import Everything

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
  useResponsive,
  useKeyboardShortcuts,
  UITokens,
} from '@/lib/ui-components';
```

### Complete Example

```tsx
'use client';
import React, { useState } from 'react';
import { Button, Input, Card, Toast, Skeleton } from '@/lib/ui-components';

export default function ProductionExample() {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<any>(null);

  const handleSave = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setToast({
      type: 'success',
      message: 'Changes saved!',
      onClose: () => setToast(null),
    });
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <h2 className="text-lg font-bold text-white mb-4">Save Settings</h2>

        {loading ? (
          <Skeleton count={2} className="mb-3" />
        ) : (
          <>
            <Input label="Title" placeholder="Enter title" className="mb-4" />
            <Input label="Description" placeholder="Enter description" className="mb-4" />
          </>
        )}

        <div className="flex gap-2">
          <Button variant="primary" onClick={handleSave} isLoading={loading} className="flex-1">
            Save (Ctrl+S)
          </Button>
          <Button variant="secondary" className="flex-1">
            Cancel
          </Button>
        </div>
      </Card>

      {toast && <Toast {...toast} />}
    </div>
  );
}
```

---

## File Reference

- **UI Components**: `/lib/ui-components.tsx` — All reusable components
- **Global Styles**: `/app/globals.css` — Animations, utilities, scrollbar
- **Tailwind Config**: `/tailwind.config.js` — Design tokens, colors, keyframes
- **This Guide**: `/PRODUCTION_UI_POLISH.md` — Standards & patterns

---

## Contributing

When adding new components:

1. Add to `/lib/ui-components.tsx` with full props typing
2. Export from file
3. Use in components
4. Test at 375px, 768px, 1024px, 1440px
5. Verify all focus/hover/active states
6. Add to this guide

---

**Version**: 1.0  
**Last Updated**: July 24, 2026  
**Maintained By**: WISE² Dev Team
