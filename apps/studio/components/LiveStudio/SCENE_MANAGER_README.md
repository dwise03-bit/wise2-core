# OBS Scene Manager Component

Production-grade scene management component for the WISE² Live Studio. Provides comprehensive scene creation, editing, transition configuration, and hotkey management.

## Features

### 1. Scene List (Left Sidebar)
- **Drag-to-reorder**: Reorder scenes by dragging (uses Framer Motion Reorder)
- **Multi-select**: Hold Ctrl/Cmd to select multiple scenes for bulk operations
- **Visibility toggle**: Eye icon to show/hide scenes
- **Source count**: Displays number of sources in each scene
- **Active indicator**: Green checkmark shows which scene is currently active
- **Quick rename**: Double-click scene name to rename inline
- **Visual feedback**: Selected scene highlighted with green accent border

### 2. Scene Actions
- **New Scene button**: Creates scene with template selection
- **Templates**:
  - Blank: Empty scene
  - Gaming: Game + webcam layout
  - Talk Show: Host + guests + graphics
  - Music Production: DAW + mixer + monitors
  - Podcast: Hosts + audio meters
  - Streaming: Full streaming setup
- **Bulk delete**: Delete multiple selected scenes at once
- **Context menu**: Right-click for Duplicate/Rename/Delete options

### 3. Transition Settings (Center Panel)
- **Transition types**:
  - Cut: Instant transition
  - Fade: Smooth fade effect
  - Slide: Slide animation
  - Stinger: Video overlay transition
- **Duration slider**: 0-2000ms, adjustable in 50ms increments
- **Duration display**: Real-time display of current duration in milliseconds
- **Preview button**: Play transition preview (feature placeholder)
- **Per-scene configuration**: Each scene can have unique transition settings

### 4. Scene Hotkeys (Center Panel)
- **Visual hotkey display**: Shows assigned keyboard shortcut
- **Interactive hotkey setter**: Click to listen for key press
- **Modifier support**: Ctrl, Cmd, Shift, Alt combinations
- **Special keys**: Arrow keys, F-keys, and alphanumeric support
- **Clear button**: Remove assigned hotkey
- **Real-time feedback**: Shows listening state with pulsing animation

### 5. Scene Properties Panel (Right Sidebar)
- **Order**: Current position in scene list (1 of 5, etc.)
- **Source count**: Number of sources in scene
- **Created date**: When scene was created
- **Modified date**: Last modification timestamp
- **Resolution**: Output resolution (1920x1080, etc.)
- **Metadata grid**: Organized property display with mono font for technical values

## Component Structure

```
SceneManager (Main)
├── NewSceneDialog
│   ├── Name input
│   ├── Template selector (6 options)
│   └── Create/Cancel buttons
├── Scene List (Reorderable)
│   └── SceneListItem (repeating)
│       ├── Visibility toggle
│       ├── Scene name/rename input
│       ├── Active indicator
│       └── Hover actions (Edit, Duplicate, More)
├── Context Menu
│   ├── Duplicate Scene
│   └── Delete Scene
├── Center Panel
│   ├── TransitionSettings
│   │   ├── Type selector
│   │   ├── Duration slider
│   │   └── Preview button
│   └── HotkeyManager
│       ├── Hotkey display
│       └── Key listener
└── SceneProperties
    └── Metadata grid
```

## Usage

```tsx
import { SceneManager, type Scene } from '@/components/LiveStudio/SceneManager';

// In your component:
const [scenes, setScenes] = useState<Scene[]>([]);
const [selectedSceneId, setSelectedSceneId] = useState<string>('');

return (
  <SceneManager
    scenes={scenes}
    selectedSceneId={selectedSceneId}
    onScenesChange={setScenes}
    onSceneSelect={setSelectedSceneId}
  />
);
```

## Props

### `scenes: Scene[]`
Array of scene objects. Each scene contains:
- `id`: Unique identifier
- `name`: Display name
- `active`: Whether scene is currently active
- `visible`: Whether scene is visible in list
- `transitionType`: 'cut' | 'fade' | 'slide' | 'stinger'
- `transitionDuration`: Milliseconds (0-2000)
- `stingerVideoId`: Optional video ID for stinger transitions
- `sources`: Array of SceneSource objects
- `hotkey`: Optional keyboard shortcut (e.g., "Ctrl+1")
- `createdAt`: Creation date
- `modifiedAt`: Last modification date
- `resolution`: Optional { width, height }

### `selectedSceneId?: string`
Currently selected scene ID. If not provided, first active scene is selected.

### `onScenesChange: (scenes: Scene[]) => void`
Called whenever scenes are modified (add, delete, reorder, update).

### `onSceneSelect: (sceneId: string) => void`
Called when user selects a different scene.

## Types

```typescript
export type TransitionType = 'cut' | 'fade' | 'slide' | 'stinger';
export type SceneTemplate = 
  | 'blank' 
  | 'gaming' 
  | 'talk-show' 
  | 'music-production' 
  | 'podcast' 
  | 'streaming';

export interface SceneSource {
  id: string;
  name: string;
  type: string;
  visible: boolean;
}

export interface Scene {
  id: string;
  name: string;
  active: boolean;
  visible: boolean;
  transitionType: TransitionType;
  transitionDuration: number;
  stingerVideoId?: string;
  sources: SceneSource[];
  hotkey?: string;
  createdAt: Date;
  modifiedAt: Date;
  resolution?: { width: number; height: number };
}
```

## Styling

The component uses WISE² design tokens from `tailwind.config.js`:

- **Background**: `studio-bg`, `studio-panel`, `studio-raised`
- **Borders**: `wise-medium` (rgba(255,255,255,0.12))
- **Text**: `wise-text-primary`, `wise-text-secondary`, `wise-text-muted`
- **Accents**: `wise-accent` (neon green #39FF14), `wise-accent-red`, `wise-accent-orange`
- **Inputs**: `studio-input`, `studio-line`

All colors automatically support light/dark themes via Tailwind CSS.

## Animations

Uses Framer Motion for smooth transitions:
- **List items**: Fade-in/out with X-axis slide
- **Active indicator**: Scale animation
- **Dialogs**: Scale + opacity for entrance/exit
- **Bulk actions**: Height collapse/expand
- **Hover effects**: Smooth background and opacity transitions

## State Management

Uses React `useReducer` for complex state:
- **ADD_SCENE**: Create new scene
- **DELETE_SCENE**: Remove scene by ID
- **UPDATE_SCENE**: Modify scene properties
- **REORDER_SCENES**: Change scene order
- **TOGGLE_VISIBILITY**: Show/hide scene
- **SELECT_SCENE**: Mark scene as active
- **BULK_DELETE**: Delete multiple scenes

## Performance Considerations

- Memoized callbacks using `useCallback` to prevent unnecessary re-renders
- Reorder component from Framer Motion for smooth drag performance
- AnimatePresence for efficient mount/unmount animations
- Virtualization ready (list container has overflow-y-auto)

## Accessibility

- Semantic HTML structure
- Keyboard shortcuts for hotkey assignment
- Title attributes on all interactive elements
- Focus states on inputs and buttons
- Clear visual indicators for selected/active states

## Future Enhancements

- [ ] Source preview/thumbnail in scene list
- [ ] Scene grouping/folders
- [ ] Scene presets/templates library
- [ ] Undo/redo for scene operations
- [ ] Scene duplication with source configuration
- [ ] Hotkey conflict detection
- [ ] Scene transition preview video
- [ ] Stinger video upload and management
- [ ] Export/import scenes
- [ ] Keyboard navigation (Tab, Arrow keys, Enter)

## Dependencies

- `react` 18.3+
- `framer-motion` 11.0+
- `lucide-react` 0.312+
- Tailwind CSS with WISE² design system tokens

## Integration Example

```tsx
import { useState } from 'react';
import { SceneManager, type Scene } from '@/components/LiveStudio/SceneManager';

export function LiveStudio() {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 'scene-1',
      name: 'Intro',
      active: true,
      visible: true,
      transitionType: 'fade',
      transitionDuration: 300,
      sources: [],
      createdAt: new Date(),
      modifiedAt: new Date(),
      resolution: { width: 1920, height: 1080 },
    },
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState<string>('scene-1');

  const handleScenesChange = (updatedScenes: Scene[]) => {
    setScenes(updatedScenes);
    // Sync with backend, update OBS, etc.
    console.log('Scenes updated:', updatedScenes);
  };

  const handleSceneSelect = (sceneId: string) => {
    setSelectedSceneId(sceneId);
    // Switch OBS scene, update UI, etc.
    console.log('Scene selected:', sceneId);
  };

  return (
    <div className="h-screen">
      <SceneManager
        scenes={scenes}
        selectedSceneId={selectedSceneId}
        onScenesChange={handleScenesChange}
        onSceneSelect={handleSceneSelect}
      />
    </div>
  );
}
```

## Testing Checklist

- [ ] Create new scene with different templates
- [ ] Rename scene inline
- [ ] Duplicate scene
- [ ] Delete single scene
- [ ] Delete multiple scenes (bulk)
- [ ] Reorder scenes by dragging
- [ ] Toggle scene visibility
- [ ] Switch active scene (click on scene)
- [ ] Change transition type
- [ ] Adjust transition duration slider
- [ ] Preview transition
- [ ] Set hotkey
- [ ] View scene properties
- [ ] Context menu actions
- [ ] Dialog keyboard shortcuts (Enter to create, Escape to close)
- [ ] Responsive layout on different screen sizes
