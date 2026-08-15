# Local Stream Recording System

Comprehensive local recording system for WISE² Studio with support for multiple formats, separate audio tracks, and auto-splitting for large files.

## Features

### 1. **Multi-Format Support**
- **MP4** (H.264 video + AAC audio) — Industry standard, universal compatibility
- **MKV** (Matroska) — Lossless fallback with separate audio tracks for post-editing
- **WEBM** — Web-optimized VP8/Vorbis codec

### 2. **Recording Capabilities**
- Start/stop recording alongside stream
- Pause/resume recording without stopping stream
- Track recording duration and file size in real-time
- Auto-split files when exceeding 1GB threshold
- Separate audio track extraction (for post-editing)

### 3. **File Management**
- Automatic timestamped file naming: `/recordings/{timestamp}-{uuid}.mp4`
- Directory organization: `/public/recordings/`
- Metadata persistence to database (PostgreSQL via Prisma)
- File deletion with cleanup of all split parts and audio tracks

### 4. **Quality Configuration**
- Adjustable bitrate: 500-25,000 kbps
- Quality presets: low, medium, high
- Custom audio codec selection (AAC, FLAC, Opus)
- Configurable video resolution and frame rate

## Architecture

### Core Components

#### `recording.ts` — StreamRecorder Class
Main class for managing recording lifecycle.

```typescript
// Initialize recorder
const recorder = new StreamRecorder({
  format: 'mp4',
  quality: 'high',
  bitrate: 5000,
  resolution: '1920x1080',
  frameRate: 30,
});

// Start recording
const metadata = await recorder.startRecording(
  mediaStream,
  'My Stream Title',
  'youtube',
  'Custom Stream Name'
);

// Pause/Resume
recorder.pauseRecording();
recorder.resumeRecording();

// Stop and save
const finalMetadata = await recorder.stopRecording();

// Get current stats
recorder.getCurrentDuration(); // seconds
recorder.getCurrentFileSize(); // bytes
recorder.getStatus(); // 'IDLE' | 'RECORDING' | 'PAUSED'
```

#### `useStreamRecording` Hook
React hook for managing recording state in UI components.

```typescript
const {
  isRecording,
  isPaused,
  recordingId,
  duration,
  fileSize,
  formattedDuration,
  formattedFileSize,
  error,
  status,
  startRecording,
  pauseRecording,
  resumeRecording,
  stopRecording,
  clearError,
} = useStreamRecording({
  onStart: (metadata) => console.log('Started:', metadata),
  onStop: (metadata) => console.log('Stopped:', metadata),
  onError: (error) => console.error(error),
  onStatusChange: (state) => console.log('State:', state),
});
```

#### `OBSRecordingsList.tsx` Component
Full-featured UI for browsing, managing, and playing recordings.

**Features:**
- List recordings with pagination
- Filter by format, platform, date
- Sort by date, file size, duration, platform
- Play inline video preview
- Download individual recordings
- Delete recordings (with confirmation)
- Open recordings folder in file explorer
- Real-time file size and duration stats

```typescript
<OBSRecordingsList
  onRecordingSelect={(recording) => console.log(recording)}
  maxHeight="h-96"
/>
```

### Database Schema

#### LocalStreamRecording Model
Stores all recording metadata.

```prisma
model LocalStreamRecording {
  id                 String              @id @default(cuid())
  title              String
  description        String?             @db.Text
  filePath           String              @db.Text
  fileSize           Int                 // bytes
  duration           Int?                // seconds
  format             RecordingFormat     @default(MP4)
  platform           String?             // "youtube", "twitch", etc.
  streamTitle        String?
  videoTrackPath     String?             @db.Text
  audioTrackPath     String?             @db.Text
  audioTracks        Json                @default("[]")
  isSplit            Boolean             @default(false)
  splitParts         Int                 @default(1)
  parentRecordingId  String?
  status             RecordingStatus     @default(IDLE)
  quality            String              @default("high")
  bitrate            Int                 @default(5000)
  userId             String?
  startedAt          DateTime
  stoppedAt          DateTime?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
}

enum RecordingFormat { MP4, MKV, WEBM }
enum RecordingStatus { IDLE, RECORDING, PAUSED, STOPPED, PROCESSING, FAILED }
```

## API Endpoints

### Recording Management

#### Start Recording
```
POST /api/obs/recordings/start
Content-Type: application/json

{
  "title": "My Stream",
  "description": "Optional description",
  "platform": "youtube",
  "streamTitle": "Stream Title",
  "format": "mp4",
  "quality": "high",
  "bitrate": 5000
}
```

#### Stop Recording
```
POST /api/obs/recordings/{id}/stop
```

#### Pause Recording
```
POST /api/obs/recordings/{id}/pause
```

#### Resume Recording
```
POST /api/obs/recordings/{id}/resume
```

### File Operations

#### Save File
```
POST /api/obs/recordings/save
Content-Type: multipart/form-data

file: <binary>
path: "/recordings/timestamp-uuid.mp4"
recordingId: "rec-12345"
```

#### Save Metadata
```
POST /api/obs/recordings/metadata
Content-Type: application/json

{
  "id": "rec-12345",
  "title": "My Stream",
  "filePath": "/recordings/timestamp-uuid.mp4",
  "fileSize": 524288000,
  "duration": 3600,
  "format": "MP4",
  "status": "STOPPED",
  ...
}
```

### Recordings Browser

#### List Recordings
```
GET /api/obs/recordings?page=1&limit=20&sortBy=date&sortOrder=desc&platform=youtube&format=MP4
```

#### Get Recording Details
```
GET /api/obs/recordings/{id}
```

#### Update Recording
```
PATCH /api/obs/recordings/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "New description",
  "platform": "twitch"
}
```

#### Download Recording
```
GET /api/obs/recordings/{id}/download
```

#### Delete Recording
```
DELETE /api/obs/recordings/{id}
```

## Usage Examples

### Basic Recording in Component

```typescript
'use client';

import { useStreamRecording } from '@/hooks/useStreamRecording';
import { OBSRecordingsList } from '@/components/OBSRecordingsList';

export function LiveStudioRecording() {
  const {
    isRecording,
    isPaused,
    formattedDuration,
    formattedFileSize,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    error,
  } = useStreamRecording({
    onStart: (meta) => console.log('Recording started:', meta),
    onStop: (meta) => console.log('Recording stopped:', meta),
  });

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    await startRecording(stream, 'My Stream', 'youtube', 'Stream Name');
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="flex gap-2">
        <button
          onClick={handleStartRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50"
        >
          Start Recording
        </button>

        {isRecording && (
          <>
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="px-4 py-2 bg-yellow-500 text-white rounded"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={stopRecording}
              className="px-4 py-2 bg-gray-500 text-white rounded"
            >
              Stop Recording
            </button>
          </>
        )}
      </div>

      {/* Recording Stats */}
      {isRecording && (
        <div className="text-sm">
          <p>Duration: {formattedDuration}</p>
          <p>File Size: {formattedFileSize}</p>
        </div>
      )}

      {/* Error Display */}
      {error && <div className="text-red-500">{error}</div>}

      {/* Recordings Browser */}
      <OBSRecordingsList />
    </div>
  );
}
```

### Advanced Configuration

```typescript
const recorder = new StreamRecorder({
  format: 'mkv',
  quality: 'high',
  bitrate: 8000,
  resolution: '3840x2160', // 4K
  frameRate: 60,
  audioCodec: 'flac',
  audioBitrate: 320,
});

// Record with separate audio tracks
const metadata = await recorder.startRecording(
  stream,
  'Ultra HD Stream',
  'twitch'
);

// Monitor real-time stats
const interval = setInterval(() => {
  console.log(`Duration: ${recorder.getCurrentDuration()}s`);
  console.log(`File Size: ${recorder.getCurrentFileSize()} bytes`);
}, 1000);

// Stop and cleanup
const final = await recorder.stopRecording();
clearInterval(interval);
recorder.destroy();
```

## File Organization

```
public/
└── recordings/
    ├── 2024-01-15T10-30-45-123-Z/
    │   ├── 2024-01-15T10-30-45-123-Z-rec-12345.mp4          # Main file
    │   ├── 2024-01-15T10-30-45-123-Z-rec-12345-video.mkv    # Video track
    │   ├── 2024-01-15T10-30-45-123-Z-rec-12345-audio-1.webm # Audio track 1
    │   └── 2024-01-15T10-30-45-123-Z-rec-12345-audio-2.webm # Audio track 2
    ├── 2024-01-15T11-00-00-456-Z/
    │   ├── 2024-01-15T11-00-00-456-Z-rec-67890.mp4
    │   ├── 2024-01-15T11-00-00-456-Z-rec-67890-part-1.mp4    # Split part 1
    │   └── 2024-01-15T11-00-00-456-Z-rec-67890-part-2.mp4    # Split part 2
    └── ...
```

## Performance Considerations

### File Size Management
- Auto-split at 1GB threshold to prevent memory issues
- Separate audio tracks stored in lossless format
- Database metadata indexed for fast queries

### Real-Time Monitoring
- Duration updates every 1 second
- File size updates every 1 second
- Status changes propagate to UI immediately

### Browser Compatibility
- MediaRecorder API support required
- Modern browsers: Chrome 47+, Firefox 28+, Safari 14.1+, Edge 79+
- Graceful degradation for unsupported formats

## Error Handling

```typescript
try {
  const metadata = await recorder.startRecording(stream, 'Title');
} catch (error) {
  if (error.message.includes('Unsupported format')) {
    // Fall back to WebM
    recorder.config.format = 'webm';
  }
}
```

## Database Migration

```bash
npx prisma migrate dev --name add_local_stream_recording
```

## Testing

```typescript
// Mock recording
const mockRecorder = new StreamRecorder();
const mockStream = new MediaStream();

const metadata = await mockRecorder.startRecording(
  mockStream,
  'Test Recording'
);

expect(metadata.status).toBe('RECORDING');
expect(metadata.title).toBe('Test Recording');
```

## Future Enhancements

- [ ] Hardware-accelerated video encoding
- [ ] Real-time transcoding during recording
- [ ] Automatic upload to S3/Cloud Storage
- [ ] Recording quality analytics
- [ ] Batch download of multiple recordings
- [ ] Recording scheduling and automation
- [ ] Stream resumption after network interruption
- [ ] Advanced audio mixing and effects during recording
- [ ] Live thumbnail generation
- [ ] CDN distribution for playback

## Troubleshooting

### "Unsupported format" Error
- Check browser MediaRecorder support
- Fall back to WebM format
- Update browser to latest version

### Recording File Corrupted
- Check disk space availability
- Verify file permissions in `/public/recordings/`
- Ensure graceful stop (not force-quit)

### Audio Missing from Video
- Verify audio tracks in stream
- Check audioCodec compatibility
- Test with different format (MP4 vs MKV)

### Performance Issues
- Reduce bitrate or resolution
- Use hardware-accelerated encoding
- Monitor available memory
- Split large recordings automatically
