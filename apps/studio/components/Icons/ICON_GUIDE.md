# WISE² Brand Icon System

Professional SVG icons matching WISE² design language. All icons are color-configurable and size-responsive.

## Design Principles

- **Brand Colors**: Primary Blue (#0094FF), Accent Red (#FF5535), Success Green (#2CD588)
- **Simplicity**: Clean lines, minimal detail, readable at small sizes
- **Consistency**: All icons follow the same stroke width and style
- **Flexibility**: Inherit color, or override with hex/named colors

## Basic Usage

```tsx
import { MicIcon, Icons } from '@/components/Icons'

// Individual import
<MicIcon size={24} color="#0094FF" />

// Bundle import
<Icons.Live size={32} />
<Icons.Check size={20} color="#2CD588" />

// Inherit from parent color
<div style={{ color: '#0094FF' }}>
  <MicIcon size={24} /> {/* Inherits #0094FF */}
</div>
```

## Props

All icon components accept:

```typescript
interface IconProps {
  size?: number;         // Default: 24px
  color?: string;        // Default: currentColor
  className?: string;    // Tailwind or custom CSS classes
  strokeWidth?: number;  // Default: 2
}
```

## Audio & Mixer Icons

### MicIcon
- Usage: Microphone input, recording
- Default color: Inherits
- Semantic: Input device

### SpeakerIcon
- Usage: Audio output, volume, speaker
- Default color: Inherits
- Semantic: Output device

### MuteIcon
- Usage: Mute/silence state
- Default color: Inherits
- Semantic: Silent state

### SoloIcon
- Usage: Solo isolation, channel focus
- Default color: Inherits
- Semantic: Single channel active

## Stream & Broadcast Icons

### LiveIcon
- Usage: Live indicator, recording active
- Default color: Red (#FF5535)
- Semantic: Active streaming

### StreamIcon
- Usage: Stream control, video streaming
- Default color: Inherits
- Semantic: Video output

### CameraIcon
- Usage: Camera input, video source
- Default color: Inherits
- Semantic: Video capture

## Analytics Icons

### ChartIcon
- Usage: Analytics, performance graphs
- Default color: Inherits
- Semantic: Data visualization

### TrendUpIcon
- Usage: Increasing metric, positive growth
- Default color: Green (#2CD588)
- Semantic: Improvement

### TrendDownIcon
- Usage: Decreasing metric, negative trend
- Default color: Red (#FF5535)
- Semantic: Decline

### ActivityIcon
- Usage: Activity feed, real-time updates
- Default color: Inherits
- Semantic: Event notification

## Control Icons

### PlayIcon
- Usage: Start, begin, resume
- Default color: Inherits
- Semantic: Begin action

### PauseIcon
- Usage: Pause, temporary stop
- Default color: Inherits
- Semantic: Suspend action

### StopIcon
- Usage: Stop, end, terminate
- Default color: Inherits
- Semantic: End action

### RecordIcon
- Usage: Record, capture, red light
- Default color: Red (#FF5535)
- Semantic: Recording active

## Status Icons

### CheckIcon
- Usage: Success, confirmation, approved
- Default color: Green (#2CD588)
- Semantic: Positive state

### WarningIcon
- Usage: Warning, caution, attention needed
- Default color: Amber (#FF9500)
- Semantic: Cautionary state

### ErrorIcon
- Usage: Error, failure, problem
- Default color: Red (#FF5535)
- Semantic: Negative state

### InfoIcon
- Usage: Information, help, details
- Default color: Blue (#0094FF)
- Semantic: Informational state

## Navigation & UI Icons

### MenuIcon
- Usage: Navigation menu, hamburger button
- Default color: Inherits
- Semantic: Menu trigger

### SettingsIcon
- Usage: Configuration, preferences, settings
- Default color: Inherits
- Semantic: Settings panel

### SearchIcon
- Usage: Search, find, lookup
- Default color: Inherits
- Semantic: Search function

### CloseIcon
- Usage: Close, dismiss, exit
- Default color: Inherits
- Semantic: Dismiss action

## Usage Patterns

### As Buttons
```tsx
<button className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700">
  <MicIcon size={20} color="white" />
  Start Recording
</button>
```

### In Lists
```tsx
<div className="flex items-center gap-3 p-4">
  <Icons.Check size={24} color="#2CD588" />
  <span>All systems operational</span>
</div>
```

### Status Indicators
```tsx
{isLive && <Icons.Live size={16} />}
{isRecording && <Icons.Record size={16} />}
{hasError && <Icons.Error size={16} />}
```

### Inline with Text
```tsx
<span className="flex items-center gap-1">
  <TrendUpIcon size={18} color="#2CD588" />
  +12.5%
</span>
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Blue (Primary) | #0094FF | Info, actions, highlights |
| Red (Accent) | #FF5535 | Alerts, live, errors |
| Green (Success) | #2CD588 | Confirmations, positive |
| Amber (Warning) | #FF9500 | Cautions, warnings |
| Gray (Default) | currentColor | Inherit from parent |

## Sizing Guidelines

| Size | Use Case |
|------|----------|
| 16px | Inline with text, compact UI |
| 20px | Form labels, small buttons |
| 24px | Standard buttons, list items |
| 32px | Large buttons, hero sections |
| 48px | XL buttons, featured icons |

## Accessibility

All icons:
- Are semantically meaningful (use with `aria-label` if needed)
- Have sufficient stroke width for visibility
- Support color-blind safe palettes
- Should have text labels when used as buttons

```tsx
<button aria-label="Start recording">
  <RecordIcon size={24} />
</button>
```

## Replacing Emoji

Old emoji-based approach:
```tsx
const ACTION_CONFIG = {
  track_added: { icon: '🎵', label: 'Added track' },
  volume_changed: { icon: '🔊', label: 'Changed volume' },
}
```

New icon-based approach:
```tsx
const ACTION_CONFIG = {
  track_added: { icon: Icons.Activity, label: 'Added track', color: '#2CD588' },
  volume_changed: { icon: Icons.Speaker, label: 'Changed volume', color: '#0094FF' },
}

// In JSX:
{ACTION_CONFIG[action].icon && (
  <ACTION_CONFIG[action].icon 
    size={24} 
    color={ACTION_CONFIG[action].color} 
  />
)}
```

## Performance

- All icons are inline SVG components
- No image loading delays
- No external dependencies
- Minimal bundle impact
- Tree-shakeable (unused icons stripped)

## Migration Checklist

When replacing emoji with proper icons:
- [ ] Audit all emoji usage in codebase (`grep -r "🎵\|🔊\|🎧"`)
- [ ] Replace emoji with corresponding icon component
- [ ] Update color to match semantic meaning
- [ ] Test sizing in context
- [ ] Update Activity Stream config
- [ ] Update Toast/Alert components
- [ ] Update Status indicators
- [ ] Verify with WISE² brand team
