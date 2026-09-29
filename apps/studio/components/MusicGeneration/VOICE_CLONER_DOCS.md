# Voice Cloning Component - Complete Documentation

## Overview

The **Voice Cloner** component is a production-grade voice recording, uploading, training, and customization system for the WISE² Studio. It enables users to create custom AI voices through multiple input methods with real-time feedback, progress tracking, and advanced voice customization.

**Location**: `apps/studio/components/MusicGeneration/VoiceCloner.tsx`

---

## Features

### 1. Recording Interface
- **Start/Stop/Cancel Controls** with visual feedback
- **Real-time Timer** showing elapsed time with format MM:SS
- **Recording Level Meter** displaying input volume with color-coded warnings
- **Waveform Visualization** (future enhancement via canvas)
- **Mic Permission Handling** with graceful error messages
- **Duration Validation** (5-30 seconds required)
- **Input Level Warnings** for too quiet or too loud audio
- **Animated Record Indicator** pulsing during active recording
- **Tips Display** showing best practices for recording

### 2. File Upload
- **Drag-and-Drop Interface** with visual feedback
- **File Browser** with system file picker
- **Format Support**: WAV, MP3, M4A, OGG (with auto-detection)
- **File Size Limit**: 5MB maximum with validation
- **Upload Progress Bar** showing real-time progress
- **Error Handling** for unsupported formats and oversized files
- **Smart Format Detection** using MIME types

### 3. Sample Preview
- **Waveform Display** rendered in real-time using Canvas API
- **Play/Pause Controls** for sample preview
- **Duration Display** in MM:SS format
- **Trim Controls** with dual range sliders (start/end)
- **Volume Normalization Toggle** to standardize audio levels
- **Visual Feedback** with cursor position during playback

### 4. Voice Naming
- **Text Input** with character limit (30 chars)
- **Quick Suggestions** (Sarah, James, Luna, Alex, Sofia, etc.)
- **Real-time Validation** with error display
- **Character Counter** showing remaining capacity
- **Input Sanitization** preventing invalid characters

### 5. Voice Training Progress
- **Status Indicators**: Queued → Processing → Ready → Failed
- **Real-time Progress Bar** with percentage display
- **ETA Display** (estimated time remaining)
- **Training Tips** encouraging additional samples
- **Automatic Status Updates** with smooth animations

### 6. Cloned Voice Library
- **Voice Card Grid** showing all trained voices
- **Card Details**:
  - Voice name
  - Number of samples
  - Quality score (1-5 stars)
  - Created date
  - Training status with progress
- **Actions per Voice**:
  - **Use** - Select voice for generation
  - **Preview** - Generate sample with cloned voice
  - **Delete** - Remove voice permanently
  - **Add More Samples** - Improve quality
- **Empty State** with helpful message when no voices exist
- **Sorting Options** (by date, quality, name)

### 7. Voice Customization (Post-Training)
- **Pitch Shift**: ±24 semitones with semitone display
- **Vibrato Amount**: 0-100% with intensity display
- **Breathiness**: 0-100% controlling voice breathiness
- **Vocal Character** selector with 6 options:
  - Breathy
  - Raspy
  - Clear
  - Warm
  - Powerful
  - Soft
- **Real-time Preview** updating as sliders change
- **Save/Cancel** actions with confirmation

---

## Component Architecture

### Types

```typescript
interface ClonedVoice {
  id: string;                    // Unique voice ID
  name: string;                  // User-defined voice name
  createdAt: number;             // Timestamp
  samples: AudioSample[];        // Array of audio samples
  qualityScore: number;          // 1-5 star rating
  trainingStatus: TrainingStatus; // queued | processing | ready | failed
  trainingProgress: number;      // 0-100 percentage
  customization: VoiceCustomization; // Pitch, vibrato, etc.
}

interface AudioSample {
  id: string;                    // Sample ID
  url: string;                   // Audio URL
  duration: number;              // Length in seconds
  uploadedAt: number;            // Timestamp
  waveformData?: number[];       // Cached waveform points
}

interface VoiceCustomization {
  pitch: number;                 // -24 to +24 semitones
  vibrato: number;               // 0-100%
  breathiness: number;           // 0-100%
  character: VocalCharacter;     // Voice type
}

interface RecordingState {
  isRecording: boolean;          // Recording status
  duration: number;              // Elapsed time in ms
  audioData: AudioBuffer | null; // Decoded audio
  mediaRecorder: MediaRecorder | null;
}
```

### Key Hooks & References

```typescript
// Audio Context (shared across component)
const audioContextRef = useRef<AudioContext | null>(null);

// Analyser for real-time level monitoring
const analyserRef = useRef<AnalyserNode | null>(null);

// Canvas for waveform rendering
const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

// File input for drag-drop handling
const fileInputRef = useRef<HTMLInputElement | null>(null);

// Audio element for preview playback
const previewAudioRef = useRef<HTMLAudioElement | null>(null);

// Recording timer interval
const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
```

### State Management

**Recording State**:
```typescript
const [recording, setRecording] = useState<RecordingState>({
  isRecording: false,
  duration: 0,
  audioData: null,
  mediaRecorder: null,
});
```

**Upload State**:
```typescript
const [uploadedFile, setUploadedFile] = useState<File | null>(null);
const [uploadProgress, setUploadProgress] = useState(0);
```

**Preview State**:
```typescript
const [previewAudio, setPreviewAudio] = useState<AudioBuffer | null>(null);
const [isPlaying, setIsPlaying] = useState(false);
const [trimStart, setTrimStart] = useState(0);
const [trimEnd, setTrimEnd] = useState(100);
const [normalizeAudio, setNormalizeAudio] = useState(true);
```

**Voice Library**:
```typescript
const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
const [selectedVoice, setSelectedVoice] = useState<ClonedVoice | null>(null);
```

---

## Tabs Breakdown

### Record Tab
- Shows microphone icon and "Start Recording" button initially
- Transitions to timer + waveform during recording
- Displays input level meter with color warnings
- Shows recording tips and guidance
- Stop/Cancel buttons when recording in progress

### Upload Tab
- Drag-and-drop zone accepting audio files
- File browser button for system picker
- Progress bar during upload
- Canvas waveform preview post-upload
- Trim controls for sample refinement
- Volume normalization toggle

### Library Tab
- Grid of cloned voice cards
- Each card shows voice metadata and training status
- Quick action buttons (Use, Preview, Delete)
- Empty state when no voices
- "Add New Voice" button to return to Record tab

### Customization Tab
- Only visible when voice selected from library
- Pitch slider with semitone display
- Vibrato percentage control
- Breathiness percentage control
- Vocal character selector (6 options)
- Save/Cancel buttons

---

## Constants

```typescript
const MIN_RECORDING_DURATION = 5000;     // 5 seconds minimum
const MAX_RECORDING_DURATION = 30000;    // 30 seconds maximum
const MAX_FILE_SIZE = 5 * 1024 * 1024;   // 5MB limit
const SUPPORTED_FORMATS = [
  'audio/wav',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg'
];
const VOICE_SUGGESTIONS = [
  'Sarah - Warm',
  'James - Deep',
  'Luna - Bright',
  'Alex - Neutral'
];
const VOCAL_CHARACTERS = [
  'breathy',
  'raspy',
  'clear',
  'warm',
  'powerful',
  'soft'
];
```

---

## Utilities

### formatTime(ms: number) → string
Converts milliseconds to MM:SS format.
```typescript
formatTime(5000)   // "0:05"
formatTime(90000)  // "1:30"
```

### generateWaveformData(audioBuffer: AudioBuffer, samples?: number) → number[]
Creates waveform visualization data from audio buffer.
```typescript
const waveformData = generateWaveformData(audioBuffer, 100);
// Returns array of 100 amplitude values
```

---

## Usage Examples

### Basic Import & Usage

```typescript
import { VoiceCloner } from '@/components/MusicGeneration';

export function MyComponent() {
  return (
    <div>
      <VoiceCloner />
    </div>
  );
}
```

### Integration with Music Generation

```typescript
import { VoiceCloner } from '@/components/MusicGeneration';
import { GenerationLibrary } from '@/components/MusicGeneration';

export function MusicStudio() {
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-2 gap-6">
      <VoiceCloner />
      <GenerationLibrary selectedVoice={selectedVoice} />
    </div>
  );
}
```

### Accessing Trained Voices (via Context/State Management)

```typescript
// Store cloned voices in global state
const [voiceLibrary, setVoiceLibrary] = useState<ClonedVoice[]>([]);

// Pass to sibling components for music generation
<GenerationLibrary voices={voiceLibrary} />
```

---

## Styling & Theme

The component uses WISE² design system colors and Tailwind CSS:

**Key Classes**:
- `studio-bg` - Background (#050505)
- `studio-panel` - Panel surfaces (#0a0a0a)
- `studio-raised` - Elevated surfaces (#111111)
- `studio-input` - Input backgrounds (#161616)
- `studio-line` - Borders (#262626)
- `wise-accent` - Primary accent (#39FF14)
- `wise-text-primary` - Main text (#FFFFFF)
- `wise-text-secondary` - Secondary text (#C9CED6)
- `wise-text-muted` - Muted text (#8D98A5)

**Animations**:
- Framer Motion for smooth transitions
- Pulsing animation during recording
- Staggered entrance animations for cards
- Scale transforms on interactions

---

## Error Handling

### Microphone Access Errors
```
"Microphone access denied. Please check permissions."
```
Displayed when getUserMedia() is rejected.

### File Format Errors
```
"Unsupported format. Use WAV, MP3, M4A, or OGG."
```
Shown for files with unsupported MIME types.

### File Size Errors
```
"File too large. Maximum 5MB."
```
Displayed for files exceeding limit.

### Audio Processing Errors
```
"Failed to process audio file."
```
Shown when decodeAudioData() fails.

### Voice Name Validation
```
"Voice name required" / "Maximum 30 characters"
```
Displayed for invalid names.

### Input Level Warnings
- **Too Quiet**: Show warning below input meter
- **Too Loud**: Show warning with red color indicator

---

## Keyboard Shortcuts (Future Enhancement)

```
Space      - Start/Stop recording
Delete     - Remove selected voice
Enter      - Confirm training
Escape     - Cancel current operation
Ctrl+Z     - Undo last trim adjustment
```

---

## Accessibility Features

- **ARIA Labels** on all buttons and controls
- **Semantic HTML** throughout component
- **Keyboard Navigation** via tab order
- **Color Contrast** meeting WCAG standards
- **Screen Reader Support** for status messages
- **Focus Management** on modal transitions

---

## Performance Optimizations

1. **Audio Context Pooling** - Single shared context
2. **Waveform Caching** - Store generated data
3. **Lazy Canvas Rendering** - Only update on change
4. **Memoized Callbacks** - useCallback for event handlers
5. **AnimatePresence** - Proper cleanup on unmount
6. **Efficient State Updates** - Batch related updates

---

## Browser Compatibility

**Required APIs**:
- Web Audio API (AudioContext)
- MediaRecorder API
- Canvas API
- FileReader API
- Drag & Drop API

**Supported Browsers**:
- Chrome 60+
- Firefox 55+
- Safari 14.1+
- Edge 79+

**Polyfills Needed**: None (ES2020+ target)

---

## Future Enhancements

### Phase 2
- [ ] Voice cloning via ElevenLabs API integration
- [ ] Multiple sample upload in one go
- [ ] Real-time voice preview with generation
- [ ] Voice comparison (side-by-side)
- [ ] Advanced EQ and effects on voice

### Phase 3
- [ ] Voice marketplace/sharing
- [ ] Community voice templates
- [ ] Deep voice analysis metrics
- [ ] Voice similarity scoring
- [ ] Batch voice training

### Phase 4
- [ ] Real-time waveform during recording
- [ ] Spectrogram visualization
- [ ] Voice health metrics
- [ ] Training quality predictions
- [ ] Export voice settings as presets

---

## Troubleshooting

### Recording won't start
- Check microphone permissions in browser settings
- Ensure no other apps are using the microphone
- Refresh page if permission was recently granted

### Audio quality is poor
- Record in quiet environment
- Maintain consistent distance from microphone
- Avoid sudden volume changes
- Use high-quality microphone if available

### Training is stuck
- Wait for automatic timeout (60 seconds)
- Refresh page if still stuck
- Check browser console for errors

### File upload fails
- Verify file format is supported (WAV, MP3, M4A, OGG)
- Ensure file is under 5MB
- Try re-uploading file
- Check browser console for errors

### Customization changes not saving
- Ensure "Save Changes" button is clicked
- Confirm modal/customization panel has closed
- Check that voice is in "ready" status

---

## API Integration Points

These functions are ready for backend integration:

```typescript
// Train voice on backend
async function trainVoice(voiceData: TrainVoiceRequest): Promise<ClonedVoice> {
  // POST /api/voices/train
  // Body: { name, samples[], trainingMode }
  // Response: { id, status, trainingProgress }
}

// Get voice library
async function getVoiceLibrary(): Promise<ClonedVoice[]> {
  // GET /api/voices
  // Response: ClonedVoice[]
}

// Delete voice
async function deleteVoice(voiceId: string): Promise<void> {
  // DELETE /api/voices/{voiceId}
}

// Generate preview with cloned voice
async function generatePreview(voiceId: string, text: string): Promise<AudioBuffer> {
  // POST /api/voices/{voiceId}/preview
  // Body: { text, customization }
  // Response: audio/wav blob
}

// Save customization
async function saveCustomization(voiceId: string, customization: VoiceCustomization): Promise<ClonedVoice> {
  // PATCH /api/voices/{voiceId}
  // Body: { customization }
  // Response: updated ClonedVoice
}
```

---

## Related Components

- **GenerationLibrary** - Display and manage generated tracks
- **PromptBuilder** - Build prompts for music generation
- **AIMusicGeneratorEnhanced** - Main music generation interface

---

## Support & Feedback

For issues, feature requests, or improvements:
- Check this documentation first
- Review error messages in browser console
- Test in isolation before integrating
- Report issues with reproduction steps

---

**Last Updated**: 2024-07  
**Component Status**: Production Ready  
**Maintenance**: Active Development
