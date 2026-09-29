# WISE² Component Reference Guide

**Version**: 2.0  
**Last Updated**: 2026-07-28  
**Stack**: React + Next.js + TailwindCSS + shadcn/ui

All components use the design tokens from `WISE2_ENTERPRISE_DESIGN_SYSTEM.md`. Copy-paste examples below and adapt as needed.

---

## Color Reference (Quick Copy-Paste)

```tsx
// Background & Surface
bg-wise-bg-darkest      // #050505 - Page background
bg-wise-surface-1       // #1a1a1a - Card/panel background
bg-wise-surface-2       // #2d2d2d - Hover/depth states
border-wise-border      // #3d3d3d - Dividers, outlines

// Text
text-wise-text-primary      // #e8e8e8 - Headlines, key content
text-wise-text-secondary    // #999999 - Supporting text

// Actions (Always Bold)
bg-wise-blue-electric   // #00d4ff - Primary CTA, interactive
bg-wise-green-neon      // #39ff14 - Success, online
bg-wise-purple-ai       // #9d4edd - AI decisions
bg-wise-red-alert       // #ff006e - Alerts, critical
bg-wise-orange-warning  // #ffa500 - Warnings
```

---

## Core Components

### 1. Card Surface (Every container)

```tsx
// Base card
<div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 shadow-md hover:shadow-lg transition-shadow">
  {children}
</div>

// With heading
<div className="rounded-lg bg-wise-surface-1 border border-wise-border">
  <div className="border-b border-wise-border p-4">
    <h3 className="text-lg font-semibold text-wise-text-primary">Card Title</h3>
  </div>
  <div className="p-4">
    {children}
  </div>
</div>
```

### 2. Primary Button (Electric Blue)

```tsx
<button className="
  px-4 py-2
  bg-wise-blue-electric text-black
  font-semibold rounded-md
  hover:opacity-90 active:scale-95
  transition-all duration-200
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Take Action
</button>

// Full width (mobile)
<button className="
  w-full px-4 py-2
  bg-wise-blue-electric text-black
  font-semibold rounded-md
  hover:opacity-90 active:scale-95
  transition-all duration-200
">
  Confirm
</button>

// With icon
<button className="
  flex items-center gap-2
  px-4 py-2
  bg-wise-blue-electric text-black
  font-semibold rounded-md
  hover:opacity-90 active:scale-95
  transition-all duration-200
">
  <svg className="w-4 h-4" />
  Action Label
</button>
```

### 3. Secondary Button (Surface)

```tsx
<button className="
  px-4 py-2
  bg-wise-surface-2 border border-wise-border
  text-wise-text-primary font-medium
  rounded-md
  hover:bg-wise-surface-1 active:scale-95
  transition-all duration-200
">
  Secondary
</button>
```

### 4. Status Indicator (Live Dot)

```tsx
// Ready (Neon Green - pulsing)
<span className="w-2 h-2 bg-wise-green-neon rounded-full animate-green-pulse" />

// Working (Electric Blue - pulsing)
<span className="w-2 h-2 bg-wise-blue-electric rounded-full animate-blue-pulse" />

// Alert (Red - pulsing)
<span className="w-2 h-2 bg-wise-red-alert rounded-full animate-pulse" />

// Offline (Gray - static)
<span className="w-2 h-2 bg-wise-text-secondary rounded-full" />

// With label
<div className="flex items-center gap-2">
  <span className="w-2 h-2 bg-wise-green-neon rounded-full animate-green-pulse" />
  <span className="text-sm text-wise-text-secondary">Ready</span>
</div>
```

### 5. Status Badge/Chip

```tsx
// Small badge
<span className="
  px-2 py-1
  bg-wise-surface-2 border border-wise-border
  text-xs font-medium text-wise-text-primary
  rounded-md
  inline-block
">
  Generating
</span>

// With icon
<span className="
  px-2 py-1
  bg-wise-surface-2 border border-wise-border
  text-xs font-medium text-wise-text-primary
  rounded-md
  inline-flex items-center gap-1.5
">
  <span className="w-1.5 h-1.5 bg-wise-green-neon rounded-full" />
  Complete
</span>

// Colored variants
<span className="px-2 py-1 bg-wise-surface-2 border border-wise-border text-xs font-medium text-wise-green-neon rounded-md">
  Success
</span>

<span className="px-2 py-1 bg-wise-surface-2 border border-wise-border text-xs font-medium text-wise-red-alert rounded-md">
  Error
</span>

<span className="px-2 py-1 bg-wise-surface-2 border border-wise-border text-xs font-medium text-wise-orange-warning rounded-md">
  Warning
</span>
```

### 6. Input Field

```tsx
<input
  type="text"
  className="
    w-full px-3 py-2
    bg-wise-surface-2 border border-wise-border
    text-wise-text-primary
    rounded-md
    focus:border-wise-blue-electric focus:ring-1 focus:ring-wise-blue-electric
    outline-none
    transition-colors
    placeholder:text-wise-text-secondary
  "
  placeholder="Enter text..."
/>

// With label
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-wise-text-primary">
    Field Label
  </label>
  <input
    type="text"
    className="
      w-full px-3 py-2
      bg-wise-surface-2 border border-wise-border
      text-wise-text-primary
      rounded-md
      focus:border-wise-blue-electric focus:ring-1 focus:ring-wise-blue-electric
      outline-none
      transition-colors
      placeholder:text-wise-text-secondary
    "
    placeholder="Enter value..."
  />
</div>

// Error state
<div className="flex flex-col gap-2">
  <label className="text-sm font-medium text-wise-text-primary">
    Field Label
  </label>
  <input
    type="text"
    className="
      w-full px-3 py-2
      bg-wise-surface-2 border-2 border-wise-red-alert
      text-wise-text-primary
      rounded-md
      focus:ring-1 focus:ring-wise-red-alert
      outline-none
      transition-colors
      placeholder:text-wise-text-secondary
    "
  />
  <span className="text-xs text-wise-red-alert">Error message here</span>
</div>
```

### 7. Metric Card (Dashboard tile)

```tsx
<div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4">
  <div className="text-xs font-medium uppercase letter-spacing-1 text-wise-text-secondary">
    Revenue
  </div>
  <div className="mt-2 flex items-baseline gap-2">
    <span className="text-2xl font-bold text-wise-text-primary">
      $45,230
    </span>
    <span className="text-sm text-wise-green-neon">
      +12% today
    </span>
  </div>
  <div className="mt-3 text-xs text-wise-text-secondary">
    Last 30 days
  </div>
</div>
```

### 8. Workflow Step (Ribbon element)

```tsx
// Pending (gray)
<div className="flex items-center gap-2">
  <div className="w-6 h-6 rounded-full border-2 border-wise-text-secondary flex items-center justify-center">
    <span className="text-xs text-wise-text-secondary">1</span>
  </div>
  <span className="text-sm text-wise-text-secondary">Input</span>
</div>

// Active (electric blue with pulse)
<div className="flex items-center gap-2">
  <div className="
    w-6 h-6 rounded-full
    bg-wise-blue-electric text-black
    flex items-center justify-center
    font-semibold text-xs
    animate-blue-pulse
  ">
    ✓
  </div>
  <span className="text-sm font-medium text-wise-text-primary">Automation</span>
</div>

// Completed (neon green with checkmark)
<div className="flex items-center gap-2">
  <div className="w-6 h-6 rounded-full bg-wise-green-neon text-black flex items-center justify-center">
    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
    </svg>
  </div>
  <span className="text-sm text-wise-text-primary">Execution</span>
</div>

// Connector (between steps)
<div className="flex items-center">
  <div className="flex-1 h-0.5 bg-wise-border" />
  <span className="px-2 text-wise-text-secondary">→</span>
  <div className="flex-1 h-0.5 bg-wise-border" />
</div>
```

### 9. Alert/Toast

```tsx
// Success alert
<div className="rounded-lg bg-wise-surface-1 border border-wise-border border-l-4 border-l-wise-green-neon p-4">
  <div className="flex gap-3">
    <span className="w-1.5 h-1.5 bg-wise-green-neon rounded-full mt-1.5 flex-shrink-0" />
    <div>
      <h4 className="text-sm font-semibold text-wise-green-neon">Success</h4>
      <p className="text-sm text-wise-text-secondary mt-1">Operation completed successfully</p>
    </div>
  </div>
</div>

// Error alert
<div className="rounded-lg bg-wise-surface-1 border border-wise-border border-l-4 border-l-wise-red-alert p-4">
  <div className="flex gap-3">
    <span className="w-1.5 h-1.5 bg-wise-red-alert rounded-full mt-1.5 flex-shrink-0" />
    <div>
      <h4 className="text-sm font-semibold text-wise-red-alert">Error</h4>
      <p className="text-sm text-wise-text-secondary mt-1">Something went wrong. Please try again.</p>
    </div>
  </div>
</div>

// Warning alert
<div className="rounded-lg bg-wise-surface-1 border border-wise-border border-l-4 border-l-wise-orange-warning p-4">
  <div className="flex gap-3">
    <span className="w-1.5 h-1.5 bg-wise-orange-warning rounded-full mt-1.5 flex-shrink-0" />
    <div>
      <h4 className="text-sm font-semibold text-wise-orange-warning">Warning</h4>
      <p className="text-sm text-wise-text-secondary mt-1">Please review before proceeding</p>
    </div>
  </div>
</div>
```

### 10. AI Agent Card (Digital Workforce)

```tsx
<div className="rounded-lg bg-wise-surface-1 border border-wise-border p-4">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-sm font-semibold text-wise-text-primary">
        Hermes
      </h3>
      <p className="text-xs text-wise-text-secondary mt-1">
        Master Orchestrator
      </p>
    </div>
    <span className="w-2 h-2 bg-wise-green-neon rounded-full animate-green-pulse" />
  </div>

  <div className="mt-3 space-y-2 text-xs">
    <div className="flex justify-between">
      <span className="text-wise-text-secondary">Status</span>
      <span className="text-wise-green-neon font-medium">Ready</span>
    </div>
    <div className="flex justify-between">
      <span className="text-wise-text-secondary">Processing</span>
      <span className="text-wise-text-primary">3 conversations</span>
    </div>
    <div className="flex justify-between">
      <span className="text-wise-text-secondary">Uptime</span>
      <span className="text-wise-green-neon">99.9%</span>
    </div>
  </div>

  <div className="mt-4 pt-4 border-t border-wise-border">
    <button className="
      w-full py-2
      bg-wise-surface-2 border border-wise-border
      text-xs font-medium text-wise-blue-electric
      rounded-md
      hover:bg-wise-surface-1
      transition-colors
    ">
      View Details
    </button>
  </div>
</div>
```

### 11. Modal/Dialog

```tsx
// Modal backdrop + dialog
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
  <div className="
    rounded-lg bg-wise-surface-1 border border-wise-border
    shadow-lg max-w-md w-full mx-4
    max-h-[90vh] overflow-y-auto
  ">
    {/* Header */}
    <div className="border-b border-wise-border p-4">
      <h2 className="text-lg font-semibold text-wise-text-primary">
        Modal Title
      </h2>
    </div>

    {/* Content */}
    <div className="p-4">
      <p className="text-sm text-wise-text-secondary">
        Modal content goes here...
      </p>
    </div>

    {/* Footer with actions */}
    <div className="border-t border-wise-border p-4 flex gap-3">
      <button className="
        flex-1 px-4 py-2
        bg-wise-surface-2 border border-wise-border
        text-wise-text-primary font-medium
        rounded-md
        hover:bg-wise-surface-1
        transition-colors
      ">
        Cancel
      </button>
      <button className="
        flex-1 px-4 py-2
        bg-wise-blue-electric text-black
        font-semibold rounded-md
        hover:opacity-90
        transition-opacity
      ">
        Confirm
      </button>
    </div>
  </div>
</div>
```

### 12. Dropdown/Popover

```tsx
<div className="relative">
  <button className="
    px-3 py-2
    bg-wise-surface-2 border border-wise-border
    text-wise-text-primary text-sm font-medium
    rounded-md
    hover:bg-wise-surface-1
    transition-colors
  ">
    Options ▼
  </button>

  {/* Dropdown menu (absolute positioned) */}
  <div className="
    absolute top-full mt-1 left-0
    bg-wise-surface-1 border border-wise-border
    rounded-md shadow-lg
    min-w-max z-40
  ">
    <a href="#" className="
      block px-4 py-2
      text-sm text-wise-text-primary
      hover:bg-wise-surface-2
      transition-colors
      first:rounded-t-md
    ">
      Option 1
    </a>
    <a href="#" className="
      block px-4 py-2
      text-sm text-wise-text-primary
      hover:bg-wise-surface-2
      transition-colors
    ">
      Option 2
    </a>
    <a href="#" className="
      block px-4 py-2
      text-sm text-wise-text-primary
      hover:bg-wise-surface-2
      transition-colors
      last:rounded-b-md
      border-t border-wise-border
    ">
      Delete
    </a>
  </div>
</div>
```

---

## Accessibility Requirements (Every Component)

✅ **Always include**:

```tsx
// Focus ring (visible keyboard navigation)
focus:ring-2 focus:ring-wise-blue-electric focus:outline-none

// Disabled state (when applicable)
disabled:opacity-50 disabled:cursor-not-allowed

// Color + icon for status (not color alone)
<span className="flex items-center gap-2">
  <span className="w-2 h-2 bg-wise-green-neon rounded-full" />
  <span>Success</span>
</span>

// Semantic HTML
<button>      {/* not <div onClick> */}
<nav>         {/* not <div> for navigation */}
<main>        {/* not <div> for main content */}
<form>        {/* not <div> for forms */}
```

---

## Utility Classes Quick Reference

```tailwind
/* Spacing (all 4px increments) */
p-1   /* 4px padding */
p-2   /* 8px */
p-3   /* 12px */
p-4   /* 16px */
p-6   /* 24px */
p-8   /* 32px */

/* Gap between flex/grid children */
gap-2   /* 8px */
gap-3   /* 12px */
gap-4   /* 16px */

/* Border radius */
rounded-md    /* 8px (standard) */
rounded-lg    /* 12px (generous) */

/* Shadows */
shadow-sm     /* Small drop */
shadow-md     /* Medium drop (default for cards) */
shadow-lg     /* Large drop (elevated surfaces) */

/* Transitions */
transition-colors     /* 150-200ms, used for hover */
transition-all        /* All properties, 200ms */
transition-shadow     /* Shadow only */

/* Display helpers */
flex              /* display: flex */
items-center      /* align-items: center */
justify-between   /* justify-content: space-between */
gap-2             /* 8px gap between children */
```

---

## Do's ✅ and Don'ts ❌

| Do | Don't |
|-------|---------|
| ✅ Use Electric Blue for primary actions | ❌ Use multiple accent colors together |
| ✅ Show status with both color + icon | ❌ Rely on color alone for meaning |
| ✅ Keep components dark (bg-wise-surface-*) | ❌ Add white backgrounds (#fff) |
| ✅ Use Neon Green for success states | ❌ Use generic green (#22C55E) |
| ✅ Respect `prefers-reduced-motion` | ❌ Add decorative animations |
| ✅ Add 44×44px touch targets | ❌ Make small clickable areas |
| ✅ Test focus states (Tab key) | ❌ Hide focus rings |
| ✅ Add hover feedback (opacity/shadow) | ❌ Remove hover states |
| ✅ Use semantic HTML (`<button>`, `<nav>`) | ❌ Use `<div>` for everything |
| ✅ Include aria-labels on icon buttons | ❌ Ship icon buttons without labels |

---

## Next Steps

1. Copy any component template above
2. Replace `{children}` with your content
3. Test on dark backgrounds (WISE² background)
4. Verify color contrast (should be 4.5:1+)
5. Test keyboard navigation (Tab/Shift+Tab)
6. Check `prefers-reduced-motion` media query

**All components are production-ready. Ship with confidence.**
