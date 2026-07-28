# WISE² Command Center - Design System Migration Guide

**Version**: 2.1 Master Reference  
**Status**: Implementation in Progress  
**Last Updated**: 2026-07-28

---

## Overview

This guide explains how to migrate existing dashboard pages to use the new WISE² Master Design System v2.1 with master reference colors (#72FF3B neon green, #27C7FF electric blue).

## New Component Library

All components are located in `src/components/ui/` and can be imported from `src/components/ui/index.ts`:

```typescript
import { 
  Button, 
  Card, 
  KPICard, 
  Badge, 
  StatusDot,
  Input,
  Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell 
} from '@/components/ui';
```

## Migration Patterns

### 1. KPI Cards (Metrics)

**Before:**
```tsx
<div className="bg-[var(--wise-steel)] border border-[var(--border-medium)] rounded-lg p-6">
  <p className="text-xs text-text-muted uppercase">Revenue</p>
  <div className="text-2xl font-bold text-[var(--organized-chaos-green)]">$45,000</div>
</div>
```

**After:**
```tsx
import { KPICard } from '@/components/ui';

<KPICard label="Revenue" value="$45,000" change={12} suffix="" />
```

### 2. Action Buttons

**Before:**
```tsx
<button className="px-4 py-2 bg-[var(--organized-chaos-green)] text-black rounded-lg">
  Action
</button>
```

**After:**
```tsx
import { Button } from '@/components/ui';

<Button variant="primary">Action</Button>
```

**Variants:**
- `primary` - Neon Green background (CTA)
- `secondary` - Electric Blue border + hover (Navigation)
- `ghost` - Text only (Tertiary)
- `danger` - Red background (Destructive)

### 3. Status Badges

**Before:**
```tsx
<span className="px-2 py-1 bg-green-400/20 text-green-400 rounded-full text-xs">
  Active
</span>
```

**After:**
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
```

**Variants:** `success`, `warning`, `danger`, `info`, `neutral`

### 4. Data Tables

**Before:**
```tsx
<table className="w-full text-sm">
  <thead><tr><th className="text-left">Name</th></tr></thead>
  <tbody><tr><td>John</td></tr></tbody>
</table>
```

**After:**
```tsx
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '@/components/ui';

<Table>
  <TableHead>
    <TableRow><TableHeaderCell>Name</TableHeaderCell></TableRow>
  </TableHead>
  <TableBody>
    <TableRow><TableCell>John</TableCell></TableRow>
  </TableBody>
</Table>
```

### 5. Card Containers

**Before:**
```tsx
<div className="bg-gradient-to-br from-[var(--wise-steel)] border border-[var(--organized-chaos-green)] rounded-lg p-4">
  {content}
</div>
```

**After:**
```tsx
import { Card } from '@/components/ui';

<Card interactive={true}>
  {content}
</Card>
```

## Color System Reference

### Primary Colors
- **Page Background**: `bg-wise-black` (#030504)
- **Card Background**: `bg-wise-gunmetal` (#111815)
- **Elevated Panel**: `bg-wise-surface-elevated` (#101A15)
- **Text Primary**: `text-text-primary` (#FFFFFF)
- **Text Secondary**: `text-text-secondary` (#BFC4C9)

### Action Colors
- **Primary CTA**: `text-wise-neon` / `bg-wise-neon` (#72FF3B)
- **Secondary Actions**: `text-wise-electric` / `border-wise-electric` (#27C7FF)
- **Status Success**: `text-success` (#22C55E)
- **Status Warning**: `text-warning` (#F2B632)
- **Status Error**: `text-danger` (#E53935)

### CSS Variables (Recommended)
Use CSS variables for consistency:
- `--wise-neon-green` → #72FF3B
- `--wise-electric` → #27C7FF
- `--organized-chaos-green` → #72FF3B (backward compat)
- `--wise-black` → #030504
- `--wise-gunmetal` → #111815

## Quick Reference: Pages to Update

Priority order for migration:

### Tier 1 (Core Dashboard)
- [x] `/dashboard` - Main dashboard page (in progress)
- [ ] `/dashboard/business-os` - Business overview
- [ ] `/dashboard/leads` - Prospects list
- [ ] `/dashboard/customers` - CRM / customers

### Tier 2 (Data Management)
- [ ] `/dashboard/billing` - Billing & subscriptions
- [ ] `/dashboard/analytics` - Analytics dashboard
- [ ] `/dashboard/account` - User account settings

### Tier 3 (Creative Tools)
- [ ] `/dashboard/sound-labs` - Audio production
- [ ] `/dashboard/gallery` - Media gallery
- [ ] `/dashboard/live-studio` - Live streaming

### Tier 4 (Advanced)
- [ ] `/dashboard/ai` - Hermes AI assistant
- [ ] `/dashboard/second-brain` - Knowledge base
- [ ] `/dashboard/devices` - Device management
- [ ] `/dashboard/discord` - Discord integration
- [ ] `/dashboard/settings` - Settings

## Testing Checklist

For each refactored page:

- [ ] Colors render correctly in dark mode
- [ ] Buttons have proper hover/active states
- [ ] Focus indicators visible on keyboard nav
- [ ] Badge colors match master reference
- [ ] Card shadows render properly
- [ ] Responsive design at 375px, 768px, 1024px, 1440px
- [ ] No console errors
- [ ] Accessibility: contrast ratio ≥ 4.5:1
- [ ] Performance: no layout thrashing

## Common Patterns

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  <KPICard label="Revenue" value="$45K" />
</div>
```

### Section Header
```tsx
<div className="space-y-2 mb-6">
  <h2 className="text-2xl font-bold text-text-primary">Section Title</h2>
  <p className="text-sm text-text-muted">Description</p>
</div>
```

### Status Indicator Row
```tsx
<div className="flex items-center justify-between p-4 bg-wise-gunmetal rounded-lg border border-border-subtle hover:border-wise-electric">
  <div>
    <p className="font-medium">{title}</p>
    <p className="text-xs text-text-muted">{subtitle}</p>
  </div>
  <Badge variant={status}>{statusLabel}</Badge>
</div>
```

## Implementation Notes

1. **Backward Compatibility**: Old `--organized-chaos-green` variable still works but resolves to new neon green (#72FF3B)
2. **Tailwind Classes**: All components use Tailwind classes, no hardcoded colors
3. **CSS Variables**: Components can be themed via CSS variable overrides
4. **Accessibility**: All components include proper focus states and ARIA labels
5. **Performance**: Components are lightweight, no unnecessary re-renders

## Support

For questions or issues with component usage, refer to:
- `src/components/ui/*.tsx` - Component source code
- `src/styles/globals.css` - CSS variables and base styles
- `tailwind.config.js` - Tailwind theme configuration
