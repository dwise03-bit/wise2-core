# Local Recording System

Comprehensive local stream recording system for simultaneous recording while broadcasting to multiple platforms.

## Features

### Recording Engine
- **Simultaneous Recording**: Record stream while broadcasting to Twitch, YouTube, Facebook, LinkedIn, etc.
- **Multiple Formats**: MP4 (H.264 + AAC), MKV (lossless), WebM support
- **Separate Audio Tracks**: Extract up to 6 independent audio channels for post-editing
- **Auto-Split**: Automatic file splitting at 1GB, 5GB, or 10GB thresholds
- **Pause & Resume**: Pause up to 30 seconds, then resume recording
- **Quality Presets**: Low, Medium, High quality with configurable bitrates
- **Database Persistence**: Store metadata in PostgreSQL via Prisma

### UI Components

#### RecordingControl
- **Record Button**: Large red record toggle (⭕) when recording
- **Recording Timer**: MM:SS format display
- **Pause/Resume**: Control with 30-second max pause enforcement
- **Stop & Save**: Save recording with final metadata
- **Real-time Stats**: File size, bitrate, split parts display
- **Progress Bar**: Visual indication of file size approaching split threshold
- **Folder Access**: Quick access to recordings directory

#### RecordingsList
- **Browse Recordings**: Thumbnail + duration display
- **Filtering**: Sort by date, size, duration; filter by platform
- **Metadata Display**: Date, platform, format, bitrate, file size
- **Bulk Actions**: Select multiple recordings for batch operations
- **Individual Actions**:
  - Play in browser (video player)
  - Download to computer
  - Archive to separate folder
  - Delete permanently
- **Statistics**: Total recordings, total size, total duration

## Installation

```bash
# Files are already in place at:
# apps/studio/lib/obs/recording/
#
# - RecordingEngine.ts    (Core logic)
# - RecordingControl.tsx  (UI controls)
# - RecordingsList.tsx    (Browser UI)
# - types.ts              (TypeScript definitions)
# - api.ts                (Server handlers)
# - index.ts              (Exports)
```

## Database Schema

The system uses the existing `LocalStreamRecording` Prisma model:

```prisma
model LocalStreamRecording {
  id                String   @id @default(cuid())
  title             String
  description       String? @db.Text
  filePath          String   @db.Text
  fileSize          Int
  duration          Int?
  format            RecordingFormat @default(MP4)
  platform          String?
  streamTitle       String?
  videoTrackPath    String? @db.Text
  audioTrackPath    String? @db.Text
  audioTracks       Json @default("[]")
  isSplit           Boolean @default(false)
  splitParts        Int @default(1)
  parentRecordingId String?
  status            RecordingStatus @default(IDLE)
  quality           String @default("high")
  bitrate           Int @default(5000)
  userId            String?
  startedAt         DateTime
  stoppedAt         DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([userId])
  @@index([platform])
  @@index([status])
  @@index([createdAt])
}

enum RecordingFormat {
  MP4
  MKV
  WEBM
}

enum RecordingStatus {
  IDLE
  RECORDING
  PAUSED
  STOPPED
  PROCESSING
  FAILED
}
```

## Usage

### Basic Recording Setup

```typescript
import { 
  RecordingEngine, 
  getRecordingEngine, 
  RecordingControl, 
  RecordingsList 
} from '@/lib/obs/recording';

const MyStreamComponent = () => {
  const [status, setStatus] = useState('IDLE');
  const [duration, setDuration] = useState(0);
  const [fileSize, setFileSize] = useState(0);
  const [recordings, setRecordings] = useState([]);

  const recorder = getRecordingEngine({
    format: 'mp4',
    quality: 'high',
    bitrate: 5000,
    resolution: '1920x1080',
    frameRate: 30,
    splitThreshold: 'small', // 1GB
  });

  // Listen to recording events
  useEffect(() => {
    recorder.on('size-update', ({ size, parts }) => {
      setFileSize(size);
      // Update split count if needed
    });

    recorder.on('split', ({ part }) => {
      console.log(`Recording split to part ${part}`);
    });

    recorder.on('error', ({ message }) => {
      console.error('Recording error:', message);
    });

    return () => {
      recorder.destroy();
    };
  }, [recorder]);

  const handleStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: true,
      });

      await recorder.startRecording(stream, 'My Stream', {
        platform: 'twitch',
        streamTitle: 'Live Coding Session'
      });

      setStatus('RECORDING');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStop = async () => {
    try {
      const metadata = await recorder.stopRecording();
      setStatus('STOPPED');
      
      // Fetch updated recordings list
      const response = await fetch('/api/obs/recordings');
      const { recordings } = await response.json();
      setRecordings(recordings);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handlePause = () => {
    recorder.pauseRecording();
    setStatus('PAUSED');
  };

  const handleResume = () => {
    recorder.resumeRecording();
    setStatus('RECORDING');
  };

  return (
    <div className="space-y-6">
      <RecordingControl
        status={status as any}
        duration={duration}
        fileSize={fileSize}
        splitCount={recorder.getSplitCount()}
        onStart={handleStart}
        onStop={handleStop}
        onPause={handlePause}
        onResume={handleResume}
      />

      <RecordingsList
        recordings={recordings}
        onPlay={(id) => window.open(`/player?recording=${id}`)}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onMove={handleMove}
      />
    </div>
  );
};
```

### Advanced Configuration

```typescript
// Custom configuration for different scenarios

// High quality streaming (5MB/s)
const hqRecorder = getRecordingEngine({
  format: 'mp4',
  quality: 'high',
  bitrate: 5000,
  videoBitrate: 5000,
  audioBitrate: 192,
  resolution: '1920x1080',
  frameRate: 60,
  splitThreshold: 'medium', // 5GB
});

// Podcast quality (lower bitrate)
const podcastRecorder = getRecordingEngine({
  format: 'mp4',
  quality: 'medium',
  bitrate: 2000,
  videoBitrate: 2000,
  audioBitrate: 128,
  resolution: '1280x720',
  frameRate: 30,
  splitThreshold: 'large', // 10GB
});

// Lossless archival
const archiveRecorder = getRecordingEngine({
  format: 'mkv',
  quality: 'high',
  bitrate: 8000,
  videoBitrate: 8000,
  audioBitrate: 256,
  resolution: '3840x2160',
  frameRate: 60,
  splitThreshold: 'small', // 1GB
});
```

### Event Listeners

```typescript
const recorder = getRecordingEngine();

// Recording started
recorder.on('start', ({ recordingId }) => {
  console.log(`Recording started: ${recordingId}`);
  updateUI('Started recording');
});

// Pause event
recorder.on('pause', ({ recordingId }) => {
  console.log(`Recording paused`);
  updateUI('Recording paused - max 30 seconds');
});

// Resume event
recorder.on('resume', ({ recordingId }) => {
  console.log(`Recording resumed`);
  updateUI('Recording resumed');
});

// Size update (every second)
recorder.on('size-update', ({ size, parts }) => {
  console.log(`File size: ${(size / 1024 / 1024).toFixed(2)} MB, Parts: ${parts}`);
  updateSizeDisplay(size);
});

// File split
recorder.on('split', ({ part, size }) => {
  console.log(`Split part ${part} - ${(size / 1024 / 1024 / 1024).toFixed(2)} GB`);
  notifyUser(`Recording split to part ${part}`);
});

// Audio track saved
recorder.on('audio-track-saved', ({ trackIndex, path }) => {
  console.log(`Audio track ${trackIndex} saved to ${path}`);
});

// File saved to server
recorder.on('file-saved', ({ path, size }) => {
  console.log(`File saved: ${path} (${size} bytes)`);
});

// Stop event
recorder.on('stop', ({ recordingId }) => {
  console.log(`Recording stopped: ${recordingId}`);
  updateUI('Recording stopped');
});

// Error event
recorder.on('error', ({ message }) => {
  console.error(`Recording error: ${message}`);
  showErrorNotification(message);
});
```

## API Endpoints

### Upload Recording
```bash
POST /api/obs/recordings/upload
Content-Type: multipart/form-data

file: <Blob>
path: /recordings/{id}.mp4
recordingId: rec-123456
```

### Save Metadata
```bash
POST /api/obs/recordings/metadata
Content-Type: application/json

{
  "id": "rec-123456",
  "title": "Stream Recording",
  "format": "MP4",
  "fileSize": 1073741824,
  "duration": 3600,
  "platform": "twitch",
  "quality": "high",
  "bitrate": 5000,
  "startedAt": "2024-07-24T10:00:00Z",
  "audioTracks": []
}
```

### Update Metadata
```bash
PATCH /api/obs/recordings/metadata/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "duration": 3600,
  "fileSize": 1073741824,
  "stoppedAt": "2024-07-24T11:00:00Z"
}
```

### List Recordings
```bash
GET /api/obs/recordings?platform=twitch&userId=user-123
```

### Get Recording Details
```bash
GET /api/obs/recordings/{id}
```

### Delete Recording
```bash
DELETE /api/obs/recordings/{id}
```

### Download Recording
```bash
POST /api/obs/recordings/{id}/download
```

### Archive Recording
```bash
POST /api/obs/recordings/{id}/archive
```

## File Structure

```
apps/studio/lib/obs/recording/
├── RecordingEngine.ts       # Core recording engine
├── RecordingControl.tsx     # Recording UI controls
├── RecordingsList.tsx       # Recordings browser UI
├── types.ts                 # TypeScript definitions
├── api.ts                   # Server-side handlers
├── index.ts                 # Main exports
└── README.md                # This file
```

## Configuration Options

### RecordingConfig

```typescript
interface RecordingConfig {
  format: 'mp4' | 'mkv' | 'webm';        // Output format
  quality: 'low' | 'medium' | 'high';    // Quality preset
  bitrate: number;                        // kbps (kilobits per second)
  resolution: string;                     // "1920x1080", "3840x2160", etc.
  frameRate: number;                      // fps (frames per second)
  audioCodec: 'aac' | 'flac' | 'opus';   // Audio codec
  videoBitrate?: number;                  // Video bitrate override (kbps)
  audioBitrate?: number;                  // Audio bitrate override (kbps)
  splitThreshold?: 'small' | 'medium' | 'large'; // 1GB | 5GB | 10GB
}
```

## Best Practices

### Recording Quality
- **Live Streaming**: Use MP4 with H.264 (good quality, small files)
- **Archival**: Use MKV with lossless codecs (highest quality)
- **Podcasting**: Use MP4 with lower bitrates (audio-focused)

### File Size Management
- **Small Events**: Use 'small' threshold (1GB) for automatic splits
- **Long Sessions**: Use 'medium' or 'large' thresholds (5GB or 10GB)
- **High Bitrate**: Monitor file size closely, use splits frequently

### Audio Tracks
- **Multi-track Recording**: Set format to 'mkv' for separate audio tracks
- **Post-Editing**: Use extracted audio tracks for cleanup/mixing
- **Max 6 Tracks**: System supports up to 6 independent audio channels

### Pause/Resume
- **Max 30 Seconds**: Pause duration is limited to 30 seconds
- **Use Sparingly**: Pausing more than necessary increases file complexity
- **Don't Archive**: Paused sections cannot be removed; plan accordingly

## Troubleshooting

### Recording Won't Start
- Check browser permissions for display/microphone
- Verify MIME type support: `MediaRecorder.isTypeSupported(mimeType)`
- Check console for specific error messages

### File Not Saving
- Verify `/public/recordings/` directory exists
- Check server has write permissions
- Monitor network requests for upload failures

### Split Not Working
- Verify splitThreshold is configured correctly
- Check file size calculations (bytes vs MB vs GB)
- Monitor console for split event emissions

### Audio Tracks Missing
- Ensure format is set to 'mkv' for separate tracks
- Verify stream has audio tracks: `stream.getAudioTracks().length > 0`
- Check audio track save events in console

## Performance Considerations

- **Memory**: Recording large files keeps chunks in memory; monitor heap usage
- **CPU**: H.264 encoding is CPU-intensive; test on target hardware
- **Disk**: Streaming at high bitrates requires fast disk I/O
- **Network**: Uploading to server while recording may impact performance

## Security

- All uploaded files are stored locally in `/public/recordings/`
- Database records are persisted in PostgreSQL
- File paths are sanitized to prevent directory traversal
- Consider implementing access controls for sensitive recordings

## License

Part of WISE² Studio project.
