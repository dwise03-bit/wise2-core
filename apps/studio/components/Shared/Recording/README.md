# Recording File Management System

Complete recording management system for the Studio application, including recording library, export functionality, file size calculations, and sharing capabilities.

## Components

### 1. RecordingCard
Displays a single recording with metadata and action buttons.

**Props:**
- `recording: Recording` - The recording data
- `onPlay?: (recording: Recording) => void` - Play button callback
- `onExport?: (recording: Recording) => void` - Export button callback
- `onDelete?: (id: string) => void` - Delete button callback
- `onShare?: (recording: Recording) => void` - Share button callback

**Features:**
- Thumbnail display with track count
- Duration and file size formatting
- Metadata display (title, date)
- Action buttons for play, export, share, and delete

### 2. RecordingsList
Lists multiple recordings in a grid layout with optional limit.

**Props:**
- `title?: string` - Section title (default: 'RECORDINGS')
- `limit?: number` - Number of recordings to show
- `showHeader?: boolean` - Show title header (default: true)
- `onPlay?: (recording: Recording) => void` - Play callback
- `onExport?: (recording: Recording) => void` - Export callback
- `onShare?: (recording: Recording) => void` - Share callback

**Features:**
- Grid layout (responsive 1-3 columns)
- Recording count display
- Empty state with helpful message
- Integrated action handlers

### 3. RecordingsLibrary
Full-featured library with filtering, sorting, and searching.

**Props:**
- `title?: string` - Page title (default: 'RECORDINGS LIBRARY')
- `showHeader?: boolean` - Show header (default: true)
- `onPlay?: (recording: Recording) => void` - Play callback
- `onExport?: (recording: Recording) => void` - Export callback
- `onShare?: (recording: Recording) => void` - Share callback
- `showArchived?: boolean` - Show archived recordings (default: false)

**Features:**
- Search by recording name
- Sort by: date, duration, file size, name
- Sort order: ascending/descending
- Duration filtering: all, 0-5m, 5-30m, 30m+
- Statistics cards (total recordings, duration, size, archived count)
- Multi-select with bulk actions
- Responsive grid layout
- Result count display

### 4. RecordingsPage
Complete page/modal wrapper around the library with modal state management.

**Props:**
- `title?: string` - Page title
- `isModal?: boolean` - Render as modal (default: false)
- `onClose?: () => void` - Close callback
- `onPlay?: (recording: Recording) => void` - Play callback

**Features:**
- Modal or full-page mode
- Export modal integration
- Share modal integration
- Integrated recording selection and playback

### 5. ExportModal
Modal for selecting export format and quality settings.

**Props:**
- `recording: Recording` - Recording to export
- `isOpen: boolean` - Modal visibility
- `isExporting?: boolean` - Export in progress
- `onClose: () => void` - Close callback
- `onExport: (format: ExportFormat, bitrate?: number) => void` - Export callback

**Features:**
- Format selection: WAV, MP3, AAC
- Bitrate slider for lossy formats (64-320 kbps)
- Format descriptions and recommendations
- Estimated file size preview
- Recording info display
- MIME type and extension information

### 6. ShareModal
Modal for sharing recordings via link, email, and social platforms.

**Props:**
- `recording: Recording` - Recording to share
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close callback

**Features:**
- Copy share link to clipboard
- Email sharing
- QR code placeholder
- Recording metadata display
- Copy-to-clipboard feedback

## Hooks

### useRecordings
Main hook for recording management with full CRUD operations.

```typescript
const {
  // State
  recordings,
  isLoading,
  sortBy,
  sortOrder,
  searchQuery,

  // Setters
  setSortBy,
  setSortOrder,
  setSearchQuery,

  // Filtering
  getFilteredAndSortedRecordings,

  // CRUD
  addRecording,
  deleteRecording,
  deleteMultipleRecordings,
  getRecordingById,
  updateRecording,
  archiveRecording,
  unarchiveRecording,

  // Export
  exportRecording,

  // Stats
  getRecordingStats,
} = useRecordings();
```

**Features:**
- localStorage persistence
- Filtering by search, duration, archived status
- Sorting by date, duration, size, name
- Multi-select and bulk deletion
- Archive/unarchive functionality
- Export with format selection
- Stats generation

### useRecordingLibrary
UI state management hook for the recording library interface.

```typescript
const {
  // State
  libraryOpen,
  selectedRecording,
  exportModalOpen,
  shareModalOpen,
  playbackModalOpen,
  isExporting,
  selectedRecordings,

  // Library
  openLibrary,
  closeLibrary,
  selectRecording,

  // Export
  openExportModal,
  closeExportModal,
  startExporting,
  finishExporting,

  // Share
  openShareModal,
  closeShareModal,

  // Playback
  openPlaybackModal,
  closePlaybackModal,

  // Selection
  toggleRecordingSelection,
  clearSelection,
} = useRecordingLibrary();
```

## Utilities

### fileSizeCalculator.ts
Calculates estimated file sizes based on audio parameters.

```typescript
// Calculate WAV file size
const wavSize = calculateWavFileSize({
  duration: 300,
  trackCount: 2,
  sampleRate: 44100,
  bitDepth: 16,
  channels: 2,
});

// Calculate MP3 file size
const mp3Size = calculateMp3FileSize({
  duration: 300,
  trackCount: 2,
}, 192); // 192 kbps bitrate

// Format bytes to human-readable
const formatted = formatFileSize(wavSize);
const mb = formatFileSizeMB(wavSize);

// Estimate size reduction
const reduction = estimateSizeReduction(originalSize, 'wav', 'mp3');
```

### recordingExport.ts
Export functionality for multiple audio formats.

```typescript
// Export recording
const result = await exportRecording(
  recordingId,
  'My Recording',
  300, // duration
  2,   // trackCount
  'mp3',
  { bitrate: 192 }
);

// Get MIME type
const mimeType = getMimeType('mp3'); // 'audio/mpeg'

// Create download filename
const filename = createDownloadFilename('Recording', 'mp3');

// Get recommendations
const desc = getFormatDescription('wav');
const rec = getFormatRecommendation('mp3');
```

## Integration Examples

### Sidebar Recording Section
```tsx
import { RecordingsList } from '@/components/Shared/Recording';
import { useRecordings } from '@/hooks/useRecordings';

export function RecordingsSidebar() {
  const { recordings } = useRecordings();

  return (
    <RecordingsList
      title="RECENT RECORDINGS"
      limit={5}
      onPlay={(recording) => console.log('Play:', recording)}
      onExport={(recording) => console.log('Export:', recording)}
    />
  );
}
```

### Full Library Page
```tsx
import { RecordingsPage } from '@/components/Shared/Recording';

export function RecordingsPageComponent() {
  return (
    <RecordingsPage
      title="My Recordings"
      onPlay={(recording) => {
        // Play recording
      }}
    />
  );
}
```

### Library Modal
```tsx
import { RecordingsPage } from '@/components/Shared/Recording';
import { useRecordingLibrary } from '@/hooks/useRecordingLibrary';

export function RecordingsButton() {
  const { libraryOpen, openLibrary, closeLibrary } = useRecordingLibrary();

  return (
    <>
      <button onClick={openLibrary}>📚 View Library</button>
      {libraryOpen && (
        <RecordingsPage isModal onClose={closeLibrary} />
      )}
    </>
  );
}
```

## Data Storage

All recordings are stored in browser `localStorage` under the key `studio_recordings`:

```json
[
  {
    "id": "abc123",
    "title": "My Recording",
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T10:35:00.000Z",
    "duration": 300,
    "fileSize": 14400000,
    "trackCount": 2,
    "isArchived": false
  }
]
```

To add a recording programmatically:

```typescript
const { addRecording } = useRecordings();

const newRecording = addRecording({
  title: 'New Recording',
  startTime: new Date(),
  duration: 300,
  fileSize: 14400000,
  trackCount: 2,
  isArchived: false,
});
```

## Export Formats

### WAV (Waveform Audio File Format)
- **Quality:** Lossless
- **File Size:** ~44.1 KB/s (44.1kHz, 16-bit, stereo)
- **Use Case:** Archival, professional editing
- **Recommended Bitrate:** N/A (lossless)

### MP3 (MPEG-1 Audio Layer III)
- **Quality:** Lossy (variable bitrate)
- **File Size:** 8-40 KB/s (64-320 kbps)
- **Use Case:** Sharing, widespread compatibility
- **Recommended Bitrate:** 192 kbps for good quality

### AAC (Advanced Audio Coding)
- **Quality:** Lossy
- **File Size:** 6-40 KB/s (48-320 kbps)
- **Use Case:** Apple ecosystem, streaming
- **Recommended Bitrate:** 128 kbps for good quality

## File Size Examples

For a 5-minute recording with 2 tracks:

| Format | Quality | File Size |
|--------|---------|-----------|
| WAV | Lossless | ~27 MB |
| MP3 | 128 kbps | ~3.75 MB |
| MP3 | 192 kbps | ~5.6 MB |
| AAC | 128 kbps | ~3.75 MB |

## Type Definitions

```typescript
interface Recording {
  id: string;
  title: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  fileSize: number; // bytes
  trackCount: number;
  isArchived: boolean;
  path?: string;
}

type ExportFormat = 'wav' | 'mp3' | 'aac';

interface AudioParameters {
  duration: number;
  trackCount: number;
  sampleRate?: number;
  bitDepth?: number;
  channels?: number;
}
```

## Styling

All components use Tailwind CSS with a dark theme optimized for the studio interface:
- Background: `bg-gray-900` (dark)
- Borders: `border-gray-700`
- Text: `text-gray-200` / `text-gray-300`
- Accent: `bg-blue-600` (actions)
- Hover: `hover:bg-blue-700` (interactions)

## Future Enhancements

- [ ] Cloud storage integration (AWS S3, Google Drive)
- [ ] Recording preview/waveform visualization
- [ ] Real audio encoding using Web Audio API or FFmpeg.js
- [ ] Batch export with progress tracking
- [ ] Automatic upload to streaming platforms
- [ ] Tagging and categorization system
- [ ] Duplicate detection and management
- [ ] Recording analytics (play count, duration stats)
- [ ] Collaboration and sharing permissions
- [ ] Version history and recovery
