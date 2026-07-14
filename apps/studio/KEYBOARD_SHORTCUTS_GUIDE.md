# Keyboard Shortcuts Implementation Guide

Complete keyboard shortcuts system for the SoundLabs Studio with UI hints, help panels, and audio engine integration.

## Architecture Overview

The keyboard shortcuts system consists of four main layers:

1. **Core Hook** (`useKeyboardShortcuts`) - Low-level keyboard event handling
2. **Audio Integration** (`useAudioKeyboardShortcuts`) - Audio engine action bindings
3. **Context Management** (`useKeyboardShortcutsContext`) - Global shortcut registration
4. **UI Components** - Display hints, help panels, and enhanced buttons

## Files Created

### Hooks
- **`hooks/useKeyboardShortcuts.ts`** - Core keyboard event handler with utilities
- **`hooks/useAudioKeyboardShortcuts.ts`** - Audio engine integration
- **`hooks/useKeyboardShortcutsContext.tsx`** - Global context provider

### Components
- **`components/Shared/Shortcuts/ShortcutsPanel.tsx`** - Help panel with all shortcuts
- **`components/Shared/Shortcuts/ShortcutHint.tsx`** - Button hints and badge components
- **`components/Shared/Shortcuts/ShortcutsIntegration.tsx`** - Complete integration example
- **`components/Shared/Shortcuts/index.ts`** - Barrel export

## Available Keyboard Shortcuts

### Recording
- **R** - Start/stop recording

### Playback
- **Space** - Play/pause
- **Shift+Space** - Stop playback

### Mixer (Studio)
- **T** - Add track
- **Delete** - Remove selected track

### Project
- **Ctrl+S** (Windows/Linux) or **Cmd+S** (Mac) - Save project
- **Ctrl+E** (Windows/Linux) or **Cmd+E** (Mac) - Export project

### Help
- **?** - Show keyboard shortcuts panel

## Usage Examples

### 1. Basic Audio Keyboard Shortcuts

```tsx
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';

function MyStudio() {
  const { shortcuts, audioEngine } = useAudioKeyboardShortcuts({
    onSave: handleSave,
    onExport: handleExport,
    selectedTrackId: currentTrackId,
  });

  return (
    <div>
      {/* Audio controls with shortcuts active */}
      <TransportControls {...transportProps} />
    </div>
  );
}
```

### 2. Complete Integration with UI Hints

```tsx
import { ShortcutsIntegration } from '@/components/Shared/Shortcuts';

function RecordingStudio() {
  return (
    <ShortcutsIntegration
      onSave={handleProjectSave}
      onExport={handleExport}
      selectedTrackId={selectedTrackId}
    />
  );
}
```

### 3. Display Keyboard Shortcuts Help

```tsx
import { ShortcutsPanel } from '@/components/Shared/Shortcuts';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';

function HelpSection() {
  const { shortcuts } = useAudioKeyboardShortcuts();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button onClick={() => setShowHelp(true)}>Show Shortcuts</button>
      <ShortcutsPanel
        shortcuts={shortcuts}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        variant="modal"
      />
    </>
  );
}
```

### 4. Enhanced Button with Shortcut Hints

```tsx
import { ShortcutButton, ShortcutBadge } from '@/components/Shared/Shortcuts';

function PlayButton() {
  return (
    <ShortcutButton
      shortcutKeys={[' ']}
      shortcutDescription="Play/Pause"
      onClick={handlePlayPause}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
    >
      Play
    </ShortcutButton>
  );
}
```

### 5. Custom Shortcuts with Context

```tsx
import { useKeyboardShortcutsContext } from '@/hooks/useKeyboardShortcutsContext';

function MyCustomComponent() {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext();

  useEffect(() => {
    // Register a custom shortcut
    registerShortcut({
      name: 'My Custom Action',
      description: 'Do something special',
      keys: ['ctrl', 'shift', 'k'],
      action: () => handleCustomAction(),
      category: 'other',
    });

    // Cleanup
    return () => unregisterShortcut('My Custom Action');
  }, []);

  return <div>{/* Your component */}</div>;
}
```

### 6. Global Provider Setup

Wrap your app with the provider:

```tsx
import { KeyboardShortcutsProvider } from '@/hooks/useKeyboardShortcutsContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardShortcutsProvider initialShortcuts={[]}>
      {children}
    </KeyboardShortcutsProvider>
  );
}
```

## Core Hook API

### useKeyboardShortcuts

```ts
function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options?: UseKeyboardShortcutsOptions
) {
  return {
    shortcuts: KeyboardShortcut[];
    isEnabled: boolean;
  };
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;        // Enable/disable shortcuts (default: true)
  preventDefault?: boolean;  // Prevent default behavior (default: true)
  ignoreInputs?: boolean;   // Skip when typing (default: true)
}
```

### useAudioKeyboardShortcuts

```ts
function useAudioKeyboardShortcuts(
  config?: AudioKeyboardShortcutsConfig
) {
  return {
    shortcuts: KeyboardShortcut[];
    isEnabled: boolean;
    audioEngine: AudioEngine;
  };
}

interface AudioKeyboardShortcutsConfig {
  recordKey?: string[];
  playKey?: string[];
  stopKey?: string[];
  addTrackKey?: string[];
  deleteTrackKey?: string[];
  saveKey?: string[];
  exportKey?: string[];
  showHelpKey?: string[];
  enabled?: boolean;
  onShowHelp?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  selectedTrackId?: string | null;
}
```

## Component API

### ShortcutsPanel

Modal, drawer, or inline help panel showing all shortcuts organized by category.

```tsx
<ShortcutsPanel
  shortcuts={shortcuts}
  isOpen={isOpen}
  onClose={handleClose}
  variant="modal" | "drawer" | "inline"
  showHeader={true}
  showSearch={true}
/>
```

### ShortcutButton

Enhanced button with automatic shortcut hint display.

```tsx
<ShortcutButton
  shortcutKeys={[' ']}
  shortcutDescription="Play/Pause"
  showShortcutBadge={false}
  onClick={handleClick}
/>
```

### ShortcutBadge

Display shortcut keys in different styles.

```tsx
<ShortcutBadge
  keys={['ctrl', 's']}
  variant="default" | "minimal" | "inline"
/>
```

## Features

### Keyboard Event Handling
- ✅ Modifier key combinations (Ctrl, Shift, Alt, Cmd)
- ✅ Platform detection (Windows/Mac)
- ✅ Disabled during text input
- ✅ Prevents default browser behavior
- ✅ Normalizes key combinations for consistent lookup

### UI Components
- ✅ Modal/drawer/inline help panels
- ✅ Searchable shortcut listings
- ✅ Category organization
- ✅ Button tooltips with hints
- ✅ Shortcut badges
- ✅ Pro tips overlay

### Audio Integration
- ✅ Record/stop recording
- ✅ Play/pause/stop playback
- ✅ Add/remove tracks
- ✅ Save/export projects
- ✅ Track selection management
- ✅ Custom shortcut support

### Context Management
- ✅ Global registration/unregistration
- ✅ Runtime updates
- ✅ Easy provider setup
- ✅ Optional context usage

## Best Practices

1. **Always wrap with context in root layout** for global shortcuts
2. **Use `onClose` handler** to manage modal state
3. **Disable during text input** to prevent conflicts
4. **Provide descriptions** for all shortcuts
5. **Use categories** to organize shortcuts
6. **Show hints in UI** with `ShortcutButton` or `ShortcutBadge`
7. **Test on both platforms** (Windows/Mac)

## Customization

### Custom Key Combinations

```ts
const { registerShortcut } = useKeyboardShortcutsContext();

registerShortcut({
  name: 'Custom Action',
  description: 'Your description',
  keys: ['ctrl', 'shift', 'k'],  // Any combination
  action: () => {
    // Your action
  },
  category: 'custom',
});
```

### Platform Detection

The system automatically detects if running on Mac and adjusts modifier keys:
- Mac: Shows "Cmd" instead of "Ctrl"
- Windows/Linux: Shows "Ctrl"

### Disable During Specific Contexts

```ts
const { shortcuts } = useAudioKeyboardShortcuts({
  enabled: !isEditingTrackName,  // Disable while editing
});
```

## Type Definitions

```ts
interface KeyboardShortcut {
  name: string;              // Display name
  description: string;       // What it does
  keys: string[];           // Key combination
  action: () => void;       // Action to execute
  category: 'stream' | 'recording' | 'scene' | 'mixer' | 'chat';
}

interface ShortcutMap {
  [key: string]: KeyboardShortcut;
}
```

## Testing

Test shortcuts with these scenarios:

1. ✅ Single key press (e.g., 'r')
2. ✅ Modifier combinations (e.g., 'ctrl+s')
3. ✅ Space key handling
4. ✅ Input field exclusion
5. ✅ Mac vs Windows modifier keys
6. ✅ Dynamic shortcut registration
7. ✅ Help panel search functionality
8. ✅ Tooltip display on hover

## Troubleshooting

### Shortcuts not working
- Check if `enabled` is true
- Verify you're not in an input field
- Check browser console for errors
- Ensure shortcuts are properly formatted

### Modal not closing
- Verify `onClose` handler is connected
- Check z-index conflicts with other modals
- Ensure click outside is working

### Incorrect key display
- Verify platform detection is working
- Check key formatting in shortcuts array
- Test `formatKeysForDisplay()` function

## Performance Considerations

- ✅ Efficient shortcut lookup using map
- ✅ Normalized key combinations for consistency
- ✅ Proper event listener cleanup
- ✅ Memoized callbacks to prevent re-renders
- ✅ Lazy-loaded help panels

## Browser Support

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (with limitations)

## Future Enhancements

- [ ] Customizable shortcut remapping UI
- [ ] Shortcut recording/macro support
- [ ] Conflict detection
- [ ] Cloud sync of custom shortcuts
- [ ] Shortcut profiles for different workflows
