# Music Generation Library Component

A comprehensive, production-grade library browser for generated music tracks with advanced filtering, search, and management capabilities.

## Features

### 1. Sidebar Search & Filter
- **Real-time Search**: Search by prompt text, title, or description
- **Date Range Filter**: Last 24h, Last week, Last month, All time
- **Genre Filter**: Dynamic list of available genres with checkboxes
- **Mood Filter**: 8 mood options with emoji indicators
- **Duration Filter**: Short (< 30s), Medium (30s-1m), Long (1m+)
- **Status Filter**: Ready, Generating, Queued, Failed
- **Quick Filters**: Fast access to Favorites, Ready to Use, In Progress
- **Filter Reset**: Clear all filters with one click

### 2. Main Grid View
- **Responsive Grid**: 2 columns on tablet, 3-4 columns on desktop
- **Generation Cards** showing:
  - Animated waveform visualization
  - Title (first 50 chars from prompt)
  - Genre and mood badges with emoji
  - Duration (MM:SS format)
  - Relative creation date ("2 hours ago")
  - Status indicator (✓ Ready, ⏳ Generating, ⏳ Queued, ✗ Failed)
  - Favorite star badge (when favorited)

- **Hover Effects**:
  - Play button overlay on waveform
  - Action buttons appear on hover
  - Smooth scale transitions
  - Tooltip support ready

- **Card Selection**:
  - Click to highlight card
  - Shows cyan ring on selection
  - Opens details panel

### 3. Action Buttons
Each card has action buttons:
- **▶ Play**: Listen to generation
- **⬇ Export**: Dropdown menu (MP3, WAV, FLAC, OPUS, OGG)
- **⭐ Star**: Toggle favorite status
- Accessible via hover or details panel

### 4. Details Panel (Right Sidebar)
Shows detailed information when a generation is selected:
- **Waveform Visualization**: Large animated waveform
- **Playback Controls**: Play button and favorite toggle
- **Title & Prompt**: Full text display
- **Metadata**:
  - Genre
  - Mood
  - Duration
  - Tempo (BPM)
  - Creation date/time
  - Instruments used
  - Status with progress bar

- **Action Buttons**:
  - Play
  - Favorite toggle
  - Remix (regenerate with same settings)
  - Add to Sound Lab (convert to clip)
  - Export (MP3 default)
  - Delete

### 5. Pagination & Lazy Loading
- Grid loads 50 items initially
- "Load More" button for additional items
- Optional scroll-to-load (virtualization ready)
- Smooth animations on load

### 6. Empty State
- Clear "No generations yet" message
- Suggests using the prompt builder
- Link to create first generation
- Friendly icon and messaging

### 7. Sorting Options
- **Newest First** (default): Reverse chronological
- **Oldest First**: Chronological
- **Highest Quality**: By progress percentage
- **Longest Duration**: By duration (seconds)

## Component Props

```typescript
interface GenerationLibraryProps {
  // Required Data
  generations: GeneratedTrack[];

  // Callbacks
  onPlayGeneration: (track: GeneratedTrack) => void;
  onDeleteGeneration: (trackId: string) => void;
  onToggleFavorite: (trackId: string) => void;
  onRemixGeneration: (trackId: string) => void;
  onExportGeneration: (trackId: string, format: ExportFormat) => void;
  onAddToSoundLab: (trackId: string) => void;

  // Optional
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}
```

## Usage Example

```typescript
import GenerationLibrary from '@/components/MusicGeneration/GenerationLibrary';
import { useState } from 'react';

export default function MyStudio() {
  const [generations, setGenerations] = useState<GeneratedTrack[]>([]);

  const handlePlay = (track: GeneratedTrack) => {
    // Create audio player instance
    const audio = new Audio(track.url);
    audio.play();
  };

  const handleDelete = (trackId: string) => {
    setGenerations(prev => prev.filter(g => g.id !== trackId));
  };

  const handleToggleFavorite = (trackId: string) => {
    setGenerations(prev =>
      prev.map(g =>
        g.id === trackId ? { ...g, isFavorite: !g.isFavorite } : g
      )
    );
  };

  const handleRemix = (trackId: string) => {
    const generation = generations.find(g => g.id === trackId);
    if (generation) {
      // Trigger new generation with same settings
      console.log('Remix:', generation);
    }
  };

  const handleExport = (trackId: string, format: string) => {
    // Download the track in selected format
    window.open(`/api/download/${trackId}?format=${format}`);
  };

  const handleAddToSoundLab = (trackId: string) => {
    // Convert generation to clip and add to Sound Lab
    console.log('Add to Sound Lab:', trackId);
  };

  return (
    <GenerationLibrary
      generations={generations}
      onPlayGeneration={handlePlay}
      onDeleteGeneration={handleDelete}
      onToggleFavorite={handleToggleFavorite}
      onRemixGeneration={handleRemix}
      onExportGeneration={handleExport}
      onAddToSoundLab={handleAddToSoundLab}
      isLoading={false}
      onLoadMore={() => console.log('Load more')}
      hasMore={true}
    />
  );
}
```

## Styling

The component uses:
- **Dark Theme**: WISE² slate and charcoal colors
- **Gradients**: Cyan-to-blue for primary actions
- **Animations**: Framer Motion for smooth transitions
- **Tailwind CSS**: Utility-first styling
- **Icons**: Lucide React

### Color Scheme

- **Primary**: Cyan (#06b6d4) & Blue (#2563eb)
- **Background**: Slate-950 (#020617) & Slate-900 (#0f172a)
- **Status Colors**:
  - Ready: Green (#22c55e)
  - Generating: Yellow (#eab308)
  - Queued: Blue (#3b82f6)
  - Failed: Red (#ef4444)

## Performance Considerations

1. **Lazy Loading**: Grid supports virtualization for large lists
2. **Memoization**: Cards are memoized to prevent unnecessary re-renders
3. **Efficient Filtering**: Filters are applied once on each change
4. **Smooth Animations**: Uses `AnimatePresence` for exit animations

## Data Structure

The component expects `GeneratedTrack` objects with:

```typescript
interface GeneratedTrack {
  id: string;
  type: 'song' | 'sound';
  title?: string;
  description?: string;
  genre: string;
  mood: string;
  tempo: number;
  duration: number;
  instruments: string[];
  prompt: string;
  url?: string;
  waveformData?: number[];
  createdAt: Date;
  modifiedAt: Date;
  status: 'generating' | 'complete' | 'failed';
  progress: number;
  isFavorite: boolean;
  tags: string[];
}
```

## Integration with Sound Lab

The component provides an "Add to Sound Lab" button that:
1. Converts the generated track to a clip
2. Prepares it for use in the audio editor
3. Maintains all metadata for reference

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 15+)
- Mobile: Responsive grid adapts to screen size

## Accessibility

- Keyboard navigation support (via Lucide icons)
- Color-coded status indicators
- Clear hover states
- ARIA labels ready for implementation
- Semantic HTML structure

## Future Enhancements

- [ ] Batch operations (export multiple, delete multiple)
- [ ] Playlist creation
- [ ] Sharing & collaboration
- [ ] Generation comparison
- [ ] Advanced search with operators
- [ ] Custom sorting options
- [ ] Dark/light theme toggle
- [ ] Sound preview on hover
- [ ] Keyboard shortcuts

## TypeScript Support

The component is fully typed with:
- Props interfaces
- Filter state types
- Sort option enums
- Export format unions

All types are imported from `@/types/aimusic` and `@/constants/musicGeneration`.
