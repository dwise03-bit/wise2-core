# Keyboard Shortcuts Integration Examples

Complete working examples showing how to integrate keyboard shortcuts into your SoundLabs Studio app.

## Example 1: Basic Recording Studio with Shortcuts

```tsx
'use client';

import { useState } from 'react';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';
import { ShortcutsPanel, ShortcutButton } from '@/components/Shared/Shortcuts';
import { TransportControls } from '@/components/TransportControls';
import { TrackPanel } from '@/components/TrackPanel';

export default function RecordingStudio() {
  const [showHelp, setShowHelp] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const { shortcuts, audioEngine } = useAudioKeyboardShortcuts({
    enabled: true,
    onShowHelp: () => setShowHelp(!showHelp),
    onSave: handleSave,
    onExport: handleExport,
    selectedTrackId,
  });

  const handleSave = () => {
    console.log('Project saved');
    // TODO: Implement project save
  };

  const handleExport = () => {
    console.log('Project exported');
    // TODO: Implement project export
  };

  const { isPlaying, isRecording, currentTime, duration } = audioEngine.state;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Help Panel */}
      <ShortcutsPanel
        shortcuts={shortcuts}
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        variant="modal"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Recording Studio</h1>
          <button
            onClick={() => setShowHelp(true)}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
          >
            ?
          </button>
        </div>

        {/* Transport Controls */}
        <TransportControls
          isPlaying={isPlaying}
          isRecording={isRecording}
          currentTime={currentTime}
          duration={duration}
          onPlay={audioEngine.play}
          onPause={audioEngine.pause}
          onStop={audioEngine.stop}
          onRecord={handleRecord}
          onSeek={audioEngine.seek}
        />

        {/* Tracks */}
        <TrackPanel
          tracks={audioEngine.state.tracks}
          selectedTrackId={selectedTrackId}
          onSelectTrack={setSelectedTrackId}
          onAddTrack={() => audioEngine.addTrack()}
          onRemoveTrack={(id) => audioEngine.removeTrack(id)}
        />
      </div>
    </div>
  );

  function handleRecord() {
    if (audioEngine.state.isRecording) {
      audioEngine.stopRecording();
    } else {
      audioEngine.startRecording();
    }
  }
}
```

## Example 2: Complete Studio with Context Provider

```tsx
'use client';

import { ReactNode } from 'react';
import { KeyboardShortcutsProvider } from '@/hooks/useKeyboardShortcutsContext';
import { RecordingStudio } from './RecordingStudio';

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <KeyboardShortcutsProvider initialShortcuts={[]}>
      <RecordingStudio />
      {children}
    </KeyboardShortcutsProvider>
  );
}
```

## Example 3: Using Custom Shortcuts in a Component

```tsx
'use client';

import { useEffect } from 'react';
import { useKeyboardShortcutsContext } from '@/hooks/useKeyboardShortcutsContext';

export function CustomEffectsPanel() {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutsContext();

  useEffect(() => {
    // Register custom shortcuts for this component
    registerShortcut({
      name: 'Toggle EQ',
      description: 'Toggle equalizer on/off',
      keys: ['e', 'q'],
      action: () => handleToggleEQ(),
      category: 'mixer',
    });

    registerShortcut({
      name: 'Toggle Compressor',
      description: 'Toggle compressor on/off',
      keys: ['c', 'o'],
      action: () => handleToggleCompressor(),
      category: 'mixer',
    });

    // Cleanup
    return () => {
      unregisterShortcut('Toggle EQ');
      unregisterShortcut('Toggle Compressor');
    };
  }, []);

  function handleToggleEQ() {
    console.log('EQ toggled');
  }

  function handleToggleCompressor() {
    console.log('Compressor toggled');
  }

  return (
    <div>
      {/* EQ and Compressor UI */}
    </div>
  );
}
```

## Example 4: Dynamic Shortcut Remapping

```tsx
'use client';

import { useState } from 'react';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';
import { ShortcutsPanel } from '@/components/Shared/Shortcuts';
import { validateShortcut } from '@/utils/shortcuts';

export function ShortcutSettings() {
  const [customKeys, setCustomKeys] = useState<Record<string, string[]>>({
    recordKey: ['r'],
    playKey: [' '],
  });
  const [errors, setErrors] = useState<string[]>([]);

  const { shortcuts } = useAudioKeyboardShortcuts({
    recordKey: customKeys.recordKey,
    playKey: customKeys.playKey,
  });

  const handleKeyChange = (shortcutName: string, newKeys: string[]) => {
    const shortcut = shortcuts.find(s => s.name === shortcutName);
    if (!shortcut) return;

    const validationErrors = validateShortcut({
      ...shortcut,
      keys: newKeys,
    });

    if (validationErrors.length === 0) {
      setCustomKeys(prev => ({
        ...prev,
        [`${shortcutName.toLowerCase()}Key`]: newKeys,
      }));
      setErrors([]);
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div className="bg-gray-900 border border-chrome/20 rounded-lg p-6 space-y-4">
      <h2 className="text-lg font-bold text-white">Keyboard Shortcut Settings</h2>

      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-500/50 rounded p-3 text-red-400 text-sm">
          {errors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      <ShortcutsPanel
        shortcuts={shortcuts}
        variant="inline"
        showHeader={false}
      />

      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all"
      >
        Apply and Reload
      </button>
    </div>
  );
}
```

## Example 5: Shortcuts with Live Status Display

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';
import { keyboardEventToShortcutKeys, normalizeShortcutKeysForComparison } from '@/utils/shortcuts';

export function ShortcutMonitor() {
  const [lastShortcutPressed, setLastShortcutPressed] = useState<string>('');
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const { shortcuts } = useAudioKeyboardShortcuts();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = keyboardEventToShortcutKeys(e);
      setPressedKeys(keys);

      const normalized = normalizeShortcutKeysForComparison(keys);
      const matched = shortcuts.find(
        s => normalizeShortcutKeysForComparison(s.keys) === normalized
      );

      if (matched) {
        setLastShortcutPressed(matched.name);
      }
    };

    const handleKeyUp = () => {
      setPressedKeys([]);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [shortcuts]);

  return (
    <div className="bg-gray-900 border border-chrome/20 rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold text-white">Shortcut Monitor</h3>
      
      <div className="space-y-1">
        <div className="text-xs text-gray-400">
          Pressed Keys: <span className="text-blue-400 font-mono">{pressedKeys.join(' + ')}</span>
        </div>
        
        {lastShortcutPressed && (
          <div className="text-xs text-gray-400">
            Matched: <span className="text-green-400 font-semibold">{lastShortcutPressed}</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Example 6: Accessibility-Focused Implementation

```tsx
'use client';

import { useState } from 'react';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';
import {
  ShortcutsPanel,
  ShortcutsHintsOverlay,
  KeyboardShortcutsCard,
} from '@/components/Shared/Shortcuts';

export default function AccessibleStudio() {
  const [showHelp, setShowHelp] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const { shortcuts } = useAudioKeyboardShortcuts({
    onShowHelp: () => setShowHelp(!showHelp),
  });

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      {/* Help Panel with keyboard navigation */}
      {showHelp && (
        <ShortcutsPanel
          shortcuts={shortcuts}
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          variant="modal"
        />
      )}

      {/* Hints overlay */}
      {showHints && (
        <ShortcutsHintsOverlay
          onDismiss={() => setShowHints(false)}
          dismissKey="escape"
        />
      )}

      {/* Main content */}
      <main className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Studio</h1>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowHelp(true)}
              aria-label="Show keyboard shortcuts"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded"
            >
              ? Help
            </button>

            <button
              onClick={() => setShowHints(!showHints)}
              aria-label="Toggle shortcut hints"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded"
            >
              Hints
            </button>
          </div>
        </div>

        {/* Keyboard shortcuts info card */}
        <KeyboardShortcutsCard variant="compact" />
      </main>

      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>
    </div>
  );
}
```

## Example 7: Testing Shortcuts

```tsx
// shortcuts.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useAudioKeyboardShortcuts } from '@/hooks/useAudioKeyboardShortcuts';
import { normalizeShortcutKeys, extractPressedKeys } from '@/hooks/useKeyboardShortcuts';

describe('Keyboard Shortcuts', () => {
  it('should trigger record shortcut with R key', () => {
    const onRecord = jest.fn();
    const { unmount } = render(
      <TestComponent onRecord={onRecord} />
    );

    fireEvent.keyDown(document, { key: 'r' });
    expect(onRecord).toHaveBeenCalled();

    unmount();
  });

  it('should trigger play shortcut with Space', () => {
    const onPlay = jest.fn();
    render(<TestComponent onPlay={onPlay} />);

    fireEvent.keyDown(document, { key: ' ' });
    expect(onPlay).toHaveBeenCalled();
  });

  it('should not trigger shortcuts in input fields', () => {
    const onSave = jest.fn();
    render(<TestComponent onSave={onSave} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 's', ctrlKey: true });
    
    expect(onSave).not.toHaveBeenCalled();
  });

  it('should normalize shortcut keys correctly', () => {
    const normalized = normalizeShortcutKeys(['S', 'CTRL']);
    expect(normalized).toBe('ctrl+s');
  });

  it('should extract pressed keys from keyboard event', () => {
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
    });

    const keys = extractPressedKeys(event);
    expect(keys).toContain('ctrl');
    expect(keys).toContain('s');
  });
});
```

## Integration Checklist

- [ ] Import hooks and components
- [ ] Wrap app with `KeyboardShortcutsProvider`
- [ ] Use `useAudioKeyboardShortcuts` in main studio component
- [ ] Add `ShortcutsPanel` for help display
- [ ] Enhance buttons with `ShortcutButton` or `ShortcutBadge`
- [ ] Add `ShortcutsHintsOverlay` for first-time users
- [ ] Test on Windows/Mac/Linux
- [ ] Test keyboard event handling in different browsers
- [ ] Verify text input exclusion works
- [ ] Add custom shortcuts as needed
- [ ] Consider accessibility requirements
- [ ] Document any custom shortcuts for users
