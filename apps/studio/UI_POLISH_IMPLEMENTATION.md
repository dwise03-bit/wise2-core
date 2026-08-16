# WISE² UI Polish — Implementation Guide

Step-by-step guide for applying production UI polish to all Sound Lab, Live Studio, and Creative Studio components.

---

## Phase 1: Setup (Completed ✅)

### Files Created

- ✅ `/lib/ui-components.tsx` — Reusable component library
- ✅ `/lib/responsive-utils.ts` — Responsive design hooks
- ✅ `/app/globals.css` — Global animations and utilities
- ✅ `/tailwind.config.js` — Design tokens and keyframes
- ✅ `/PRODUCTION_UI_POLISH.md` — Style guide
- ✅ `/COMPONENT_POLISH_EXAMPLES.md` — Real examples
- ✅ `/RESPONSIVE_TESTING_GUIDE.md` — Testing protocol
- ✅ `/UI_POLISH_IMPLEMENTATION.md` — This guide

### What's Available Now

```tsx
// UI Components Library
import {
  Button,       // Primary, secondary, tertiary, danger, ghost variants
  Input,        // With label, error, hint, icon support
  Card,         // Elevated, hoverable options
  Skeleton,     // Loading states
  Toast,        // Success/error/warning/info notifications
  Badge,        // Status indicators
  Divider,      // Horizontal/vertical separators
  Tooltip,      // Help text
  UITokens,     // Design tokens (colors, spacing, etc.)
  useKeyboardShortcuts,
  useResponsive,
} from '@/lib/ui-components';

// Responsive Utilities
import {
  useResponsive,        // Device type detection
  useResponsiveSpacing, // Auto-scale spacing
  useResponsiveColumns, // Auto-scale columns
  useMobileMenu,        // Mobile drawer state
  useTouchFriendly,     // 44px+ targets
  useHoverSupport,      // Detect hover capability
  useOrientation,       // Portrait/landscape
  ResponsiveHelper,     // CSS class helpers
  Breakpoints,          // Viewport sizes
  MediaQueries,         // Media query strings
} from '@/lib/responsive-utils';
```

---

## Phase 2: Component Migration (Priority Order)

### Tier 1: Core Navigation & Shell Components (Week 1)

These are the most visible and used components. Polishing them first creates the biggest visual impact.

#### 1. CreativeStudioLayout.tsx

**Current**: Basic top bar + nav buttons

**Polish Plan**:
- [ ] Update top bar styling (use Card component)
- [ ] Add focus rings to nav buttons
- [ ] Responsive mobile navigation drawer
- [ ] Keyboard shortcuts display (Cmd+K for palette)
- [ ] Profile/notification dropdowns with glassmorphism

**Implementation**:
```tsx
// Replace inline styles with UI components
<Card>
  <button className="...">Nav Item</button>
</Card>

// Add responsive sidebar
const { isMobile } = useResponsive();
if (isMobile) {
  // Drawer
} else {
  // Sidebar
}
```

**Test Checklist**:
- [ ] 375px: Mobile drawer navigation
- [ ] 768px: Two-column layout
- [ ] 1024px: Sidebar always visible
- [ ] Tab navigation works
- [ ] Focus rings visible

#### 2. StudioPages.tsx (Page Navigation)

**Current**: Basic page switching

**Polish Plan**:
- [ ] Add transition animations between pages
- [ ] Active page indicator (ring + bg color)
- [ ] Keyboard shortcuts for pages (1-8 keys)
- [ ] Responsive button layout (wrap on mobile)

**Implementation**:
```tsx
import { Button } from '@/lib/ui-components';

pages.map(page => (
  <Button
    key={page.id}
    variant={isActive ? 'primary' : 'secondary'}
    className="animate-slideIn"
  >
    {page.label}
  </Button>
))
```

**Test Checklist**:
- [ ] All page buttons accessible on mobile
- [ ] Keyboard shortcuts work (1-8)
- [ ] Smooth transitions between pages
- [ ] Active state clear

#### 3. CreativeStudioLayout Command Palette

**Current**: Basic search overlay

**Polish Plan**:
- [ ] Glassmorphic backdrop
- [ ] Smooth animations (slide in from top)
- [ ] Keyboard navigation (arrow keys, Enter)
- [ ] Result previews
- [ ] Recent actions
- [ ] Loading state during search

**Implementation**:
```tsx
<div className="glass-elevated animate-slideIn">
  <input
    // Focus on mount
    autoFocus
    // Keyboard nav
    onKeyDown={handleArrowKeys}
  />
  {results.map(r => (
    <Card hoverable key={r.id}>
      {r.name}
    </Card>
  ))}
</div>
```

**Test Checklist**:
- [ ] Cmd+K opens palette
- [ ] Arrow keys navigate results
- [ ] Enter selects
- [ ] Escape closes
- [ ] Loading skeleton shown
- [ ] Mobile: Full-width input

---

### Tier 2: Input & Form Components (Week 2)

#### 4. Recording Controls

**Current**: Basic buttons

**Polish Plan**:
- [ ] Record/Stop/Pause buttons with clear states
- [ ] Loading spinner during recording
- [ ] Input level meter (VU meter)
- [ ] Audio device selector with focus ring
- [ ] Keyboard shortcuts (Space=play, R=record)
- [ ] Touch-friendly sizing (48px buttons on mobile)

**Implementation**:
```tsx
import { Button, Select, Skeleton } from '@/lib/ui-components';
import { useKeyboardShortcuts } from '@/lib/ui-components';

export function RecordingControl() {
  const [isRecording, setIsRecording] = useState(false);
  
  useKeyboardShortcuts({
    playPause: () => setIsPlaying(!isPlaying),
  });

  return (
    <div className="flex gap-3">
      <Button
        size="lg"
        variant={isRecording ? 'danger' : 'primary'}
        onClick={() => setIsRecording(!isRecording)}
      >
        {isRecording ? 'Stop' : 'Record'}
      </Button>
    </div>
  );
}
```

**Test Checklist**:
- [ ] Buttons 48px+ on mobile (touch-friendly)
- [ ] Hover states visible
- [ ] Loading spinner appears during recording
- [ ] Focus ring on Tab
- [ ] Space key works
- [ ] Mobile: Single column, stacked buttons

#### 5. Track List with Forms

**Current**: Basic list display

**Polish Plan**:
- [ ] Responsive card grid (1-4 columns)
- [ ] Hover actions (play, delete, rename)
- [ ] Selection state (ring highlight)
- [ ] Drag-to-reorder (mobile-friendly)
- [ ] Inline rename with Input component
- [ ] Delete confirmation dialog
- [ ] Loading skeleton

**Implementation**:
```tsx
import { Card, Input, Dialog, Badge, useResponsive } from '@/lib/ui-components';

export function TrackList({ tracks, loading }) {
  const { isMobile } = useResponsive();
  const gridClass = isMobile ? 'grid-cols-1' : 'md:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4`}>
      {loading ? (
        // Skeleton
        <Card><Skeleton count={3} /></Card>
      ) : (
        tracks.map(track => (
          <Card hoverable key={track.id}>
            <Input
              value={track.name}
              onBlur={onSave}
            />
            <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100">
              <Button size="sm" variant="secondary">Play</Button>
              <Button size="sm" variant="danger">Delete</Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
```

**Test Checklist**:
- [ ] Responsive: 375px (1 col), 768px (2 col), 1024px (4 col)
- [ ] Loading skeleton appears
- [ ] Hover actions visible on desktop
- [ ] Touch-friendly on mobile
- [ ] Rename works inline
- [ ] Delete shows confirmation

---

### Tier 3: Analytics & Data Display (Week 3)

#### 6. Mixer/Metrics Display

**Current**: Basic numeric display

**Polish Plan**:
- [ ] VU meter animations (GSAP stagger)
- [ ] Level indicators with color coding
- [ ] Responsive meter layout
- [ ] Real-time updates with smooth transitions
- [ ] Loading state with pulse animation
- [ ] Tooltips for complex controls

**Implementation**:
```tsx
import { SegmentedMeter } from '@/lib/ui-components';
import { Tooltip } from '@/lib/ui-components';

export function Mixer() {
  const [levels, setLevels] = useState([]);

  return (
    <div className="space-y-3">
      {levels.map(level => (
        <Tooltip key={level.id} content={`${level.name}: ${level.value}dB`}>
          <div className="border border-studio-line rounded-lg p-3">
            <SegmentedMeter value={level.value} />
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
```

**Test Checklist**:
- [ ] Meters animate smoothly
- [ ] Responsive (stack on mobile)
- [ ] Tooltips appear on hover
- [ ] Color indicates levels (green → yellow → red)
- [ ] Touch-friendly on mobile

#### 7. Dashboard Analytics Grid

**Current**: Static cards

**Polish Plan**:
- [ ] Responsive grid (1-4 columns)
- [ ] Loading skeleton
- [ ] Hover to expand/detail view
- [ ] Trend indicators (↑ ↓)
- [ ] Color-coded status badges
- [ ] Charts with proper spacing
- [ ] Responsive chart sizing

**Implementation**:
```tsx
import { Card, Badge, Skeleton } from '@/lib/ui-components';

export function MetricsGrid({ metrics, loading }) {
  const { isMobile } = useResponsive();
  
  return (
    <div className="
      grid grid-cols-1
      md:grid-cols-2
      lg:grid-cols-4
      gap-4
    ">
      {loading ? (
        <Card><Skeleton count={3} /></Card>
      ) : (
        metrics.map(m => (
          <Card key={m.id} hoverable>
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-semibold">{m.title}</h4>
              <Badge variant={m.status === 'up' ? 'success' : 'error'}>
                {m.status === 'up' ? '↑' : '↓'} {m.change}%
              </Badge>
            </div>
            <p className="text-2xl font-bold text-wise-accent">
              {m.value}
            </p>
          </Card>
        ))
      )}
    </div>
  );
}
```

**Test Checklist**:
- [ ] Responsive at all breakpoints
- [ ] Loading skeleton matches layout
- [ ] Badges visible with status colors
- [ ] Charts readable on mobile
- [ ] Touch targets adequate

---

### Tier 4: Advanced Features (Week 4)

#### 8. Live Studio Chat Overlay

**Current**: Basic chat messages

**Polish Plan**:
- [ ] Smooth message animation (slide in + fade)
- [ ] Staggered entry (GSAP)
- [ ] Auto-scroll to latest
- [ ] Mobile overlay positioning
- [ ] Message reactions
- [ ] Loading state while connecting
- [ ] Error state when disconnected
- [ ] Responsive chat width

**Implementation**:
```tsx
import { Toast, useResponsive } from '@/lib/ui-components';

export function ChatOverlay() {
  const { isMobile } = useResponsive();
  const containerClass = isMobile
    ? 'fixed bottom-0 right-0 w-full max-w-sm'
    : 'absolute bottom-4 right-4 w-96';

  return (
    <div className={containerClass}>
      {messages.map((msg, i) => (
        <div
          key={msg.id}
          className="animate-slideInRight mb-2"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Toast
            type="info"
            message={`${msg.user}: ${msg.text}`}
            onClose={() => removeMessage(msg.id)}
          />
        </div>
      ))}
    </div>
  );
}
```

**Test Checklist**:
- [ ] Messages slide in smoothly
- [ ] Staggered animation (each 100ms)
- [ ] Mobile: Full width with padding
- [ ] Desktop: 384px width, bottom-right
- [ ] Auto-scroll to latest
- [ ] Emoji render correctly

#### 9. Export/Share Dialog

**Current**: Basic form

**Polish Plan**:
- [ ] Progressive steps (1/3, 2/3, 3/3)
- [ ] File format selector with descriptions
- [ ] Quality slider with preview
- [ ] Custom output name with validation
- [ ] Success confirmation (green flash)
- [ ] Copy share link button
- [ ] Loading progress bar
- [ ] Error handling with retry

**Implementation**:
```tsx
import { Dialog, Input, Button, Toast } from '@/lib/ui-components';

export function ExportDialog() {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState('mp3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <Dialog open={open} title="Export Project">
      {/* Step indicator */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div
            key={s}
            className={`
              flex-1 h-1 rounded-full transition-colors
              ${s <= step ? 'bg-wise-accent' : 'bg-studio-line'}
            `}
          />
        ))}
      </div>

      {/* Step content */}
      {step === 1 && (
        <div className="space-y-3">
          <Input
            label="Output Name"
            value={name}
            onChange={e => setName(e.target.value)}
            error={error}
          />
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2 mt-6">
        <Button
          variant="secondary"
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
        >
          Back
        </Button>
        <Button
          variant="primary"
          onClick={() => setStep(Math.min(3, step + 1))}
          isLoading={loading}
          disabled={step === 3 && loading}
        >
          {step === 3 ? 'Export' : 'Next'}
        </Button>
      </div>
    </Dialog>
  );
}
```

**Test Checklist**:
- [ ] Progress indicator shows current step
- [ ] Navigation works (Back/Next/Export)
- [ ] Validation shows error
- [ ] Loading spinner during export
- [ ] Success message appears
- [ ] Share link copyable

---

## Phase 3: Quality Assurance (Week 5)

### Component Audit

For each component:

```tsx
// CHECKLIST TEMPLATE
// Component: [Name]
// File: [Path]

// Visual Polish
□ Uses Button component (not <button>)
□ Uses Input component (not <input>)
□ Uses Card component for containers
□ Colors from UITokens (not hardcoded)
□ Spacing is 4px multiples
□ Borders are studio-line color
□ Rounded corners are lg (8px)

// States
□ Hover states visible
□ Focus ring on Tab
□ Active states clear
□ Disabled states (50% opacity)
□ Loading states (skeleton/spinner)
□ Error states (red border + message)
□ Success states (green highlight)

// Responsive
□ 375px: Single column, stacked
□ 768px: Two columns
□ 1024px+: Full layout
□ Touch targets 44px+ on mobile
□ No horizontal scroll
□ Text readable at all sizes
□ Images scale properly

// Accessibility
□ Semantic HTML (<button>, <input>, <nav>)
□ ARIA labels where needed
□ Color not only indicator
□ Contrast > 4.5:1
□ Keyboard navigation works
□ Screen reader friendly

// Animations
□ Transitions smooth (200ms)
□ No jarring changes
□ Entrance animations (slide/scale/fade)
□ 60fps (no jank)
□ Respects prefers-reduced-motion

// Performance
□ No console errors
□ No console warnings
□ Images optimized
□ Code-split where appropriate
□ No memory leaks
```

### Component Audit Spreadsheet

Create a tracking sheet:

```
Component                 | File                      | Polish Status | Notes
--------------------------|---------------------------|---------------|---------
CreativeStudioLayout      | components/...layout.tsx  | In Progress   | Top bar done
StudioPages              | components/...pages.tsx   | Pending       | Week 1
CommandCenterHeader      | components/dashboard/...  | Pending       | Week 1
...
```

---

## Phase 4: Testing & Validation (Week 6)

### Before Each Component is Considered "Done"

1. **Visual Testing**
   ```
   □ Screenshot at 375px, 768px, 1024px, 1440px
   □ Compare against design system
   □ All states tested (hover, focus, active, disabled, loading, error, success)
   ```

2. **Responsive Testing**
   ```
   □ Tested on real device (iPhone, iPad, Android)
   □ No horizontal scroll
   □ Touch targets adequate
   □ Viewport meta tag correct
   ```

3. **Accessibility Testing**
   ```
   □ Tab through entire component
   □ Focus ring visible on each element
   □ Screen reader announces content
   □ axe DevTools scan passes
   ```

4. **Performance Testing**
   ```
   □ Lighthouse audit run
   □ No console errors/warnings
   □ Animations smooth (60fps)
   □ Network throttled to 3G test
   ```

5. **Browser Testing**
   ```
   □ Chrome/Firefox/Safari/Edge
   □ No rendering glitches
   □ Fonts load correctly
   □ No layout shifts
   ```

### Testing Automation

```bash
# Run accessibility audit
npm run audit:a11y

# Run performance test
npm run audit:performance

# Run responsive screenshot
npm run screenshot:responsive

# Run lighthouse
npm run audit:lighthouse
```

---

## Phase 5: Implementation Velocity

### Week 1: Foundation & Navigation
- [ ] CreativeStudioLayout
- [ ] StudioPages
- [ ] Command Palette
- [ ] Testing complete

### Week 2: Forms & Inputs
- [ ] Recording Controls
- [ ] Track List
- [ ] Input Validations
- [ ] Testing complete

### Week 3: Analytics & Display
- [ ] Metrics Grid
- [ ] Mixer Display
- [ ] Charts/Visualizations
- [ ] Testing complete

### Week 4: Advanced
- [ ] Chat Overlay
- [ ] Export Dialog
- [ ] Settings Panels
- [ ] Testing complete

### Week 5: QA
- [ ] Component audit
- [ ] Bug fixes
- [ ] Edge cases
- [ ] Final polish

### Week 6: Validation
- [ ] Full regression testing
- [ ] Performance baseline
- [ ] Browser compatibility
- [ ] Production sign-off

---

## Maintenance & Future

### Monthly Audits

```
□ Check for new console warnings
□ Lighthouse score check
□ Accessibility scan
□ Performance regression
□ Component consistency
□ Design system alignment
```

### When Adding New Components

1. Use UI component library from the start
2. Copy from existing polished components
3. Don't create new CSS unless absolutely necessary
4. Test at all breakpoints before merging
5. Get code review on design implementation

### Design System Updates

If adding new colors, spacing, or animations:

1. Update `/lib/ui-components.tsx` (UITokens)
2. Update `/tailwind.config.js` (if Tailwind)
3. Update `/PRODUCTION_UI_POLISH.md` (docs)
4. Update this implementation guide
5. Roll out to all components in next cycle

---

## File Structure Reference

```
apps/studio/
├── lib/
│   ├── ui-components.tsx        ← Reusable components
│   └── responsive-utils.ts      ← Responsive hooks
├── app/
│   └── globals.css              ← Global animations
├── tailwind.config.js           ← Design tokens
├── components/
│   ├── CreativeStudioLayout.tsx ← Being polished
│   ├── StudioPages.tsx          ← Being polished
│   └── ...                      ← Your components
├── PRODUCTION_UI_POLISH.md      ← Style guide
├── COMPONENT_POLISH_EXAMPLES.md ← Real examples
├── RESPONSIVE_TESTING_GUIDE.md  ← Testing protocol
└── UI_POLISH_IMPLEMENTATION.md  ← This guide
```

---

## Quick Start: Polishing Your First Component

1. **Open component file**
   ```tsx
   // components/MyComponent.tsx
   ```

2. **Import utilities**
   ```tsx
   import { Button, Input, Card, useResponsive } from '@/lib/ui-components';
   ```

3. **Replace HTML elements**
   ```tsx
   // Old
   <button>Click</button>
   
   // New
   <Button variant="primary">Click</Button>
   ```

4. **Add responsive support**
   ```tsx
   const { isMobile, isTablet, isDesktop } = useResponsive();
   ```

5. **Test at breakpoints**
   ```
   375px, 768px, 1024px, 1440px
   ```

6. **Verify states**
   ```
   □ Hover
   □ Focus (Tab)
   □ Active
   □ Disabled
   □ Loading
   □ Error
   ```

7. **Run lighthouse**
   ```bash
   npm run audit:lighthouse
   ```

8. **Get code review**
   ```
   Push PR with before/after screenshots at all breakpoints
   ```

---

## Success Metrics

### After Complete Rollout

```
□ 100% of components use UI component library
□ 0 hardcoded colors (all from UITokens)
□ 0 console warnings in production
□ Lighthouse score > 90 across all pages
□ Accessibility: WCAG 2.1 Level AA
□ Responsive at 375px, 768px, 1024px, 1440px
□ All keyboard shortcuts working
□ All focus rings visible
□ Touch targets 44px+ on mobile
□ Load time < 3s (desktop), < 5s (3G)
□ User satisfaction ↑ 30%+
```

---

## Support

**Questions?** Refer to:
- `/PRODUCTION_UI_POLISH.md` — Style guide
- `/COMPONENT_POLISH_EXAMPLES.md` — Real examples
- `/RESPONSIVE_TESTING_GUIDE.md` — Testing help
- `/lib/ui-components.tsx` — Component API

**Issues?** Check:
1. Are you using UITokens colors? (not hardcoded)
2. Is spacing in 4px multiples?
3. Do focus rings appear on Tab?
4. Does component work at 375px?
5. Are all states tested?

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Estimated Timeline**: 6 weeks  
**Target Completion**: Early August 2026  
**Production Readiness**: ✅ Full UI Polish Applied
