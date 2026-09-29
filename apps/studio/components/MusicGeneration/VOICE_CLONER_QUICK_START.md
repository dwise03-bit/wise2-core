# Voice Cloner - Quick Start Guide

## Installation

The VoiceCloner component is already built and ready to use in WISE² Studio.

**Location**: `apps/studio/components/MusicGeneration/VoiceCloner.tsx`

## Quick Import

```typescript
import { VoiceCloner } from '@/components/MusicGeneration';
```

## Basic Usage

### Standalone Component
```typescript
export default function VoiceStudio() {
  return (
    <div className="p-8">
      <VoiceCloner />
    </div>
  );
}
```

### In a Modal
```typescript
import { VoiceCloner } from '@/components/MusicGeneration';

export function MyModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Voice Cloner</button>
      
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-studio-bg rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <VoiceCloner />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

## What Users Can Do

### 1. Record a Voice Sample
- Click "Start Recording" tab
- Speak clearly for 5-30 seconds
- See real-time input level meter
- Stop and preview before training

### 2. Upload an Audio File
- Drag file or click to browse
- Supports: WAV, MP3, M4A, OGG
- Max 5MB file size
- See waveform preview
- Trim sample if needed

### 3. Name the Voice
- Enter custom voice name (max 30 chars)
- Use quick suggestions
- Click "Train Voice" to start training

### 4. Monitor Training Progress
- See status: Queued → Processing → Ready
- Watch real-time progress bar
- Get training tips

### 5. Manage Voice Library
- View all trained voices
- See quality score (1-5 stars)
- Delete unwanted voices
- Add more samples for improvement

### 6. Customize Voice
- Adjust pitch (±24 semitones)
- Control vibrato (0-100%)
- Change breathiness (0-100%)
- Select vocal character (6 types)
- Save customizations

## Tab Navigation

| Tab | Purpose | When Ready |
|-----|---------|-----------|
| **Record** | Microphone input | Always |
| **Upload** | File upload | After recording/uploading |
| **Library** | View voices | After training |
| **Customize** | Voice settings | After selecting from library |

## Component Features at a Glance

```
🎤 Recording Interface
  ├─ Start/Stop/Cancel controls
  ├─ Real-time waveform
  ├─ Duration timer (MM:SS)
  ├─ Input level meter with warnings
  └─ Tips for best quality

📁 File Upload
  ├─ Drag-and-drop zone
  ├─ File browser button
  ├─ Format validation (WAV, MP3, M4A, OGG)
  ├─ Size check (max 5MB)
  ├─ Progress bar
  └─ Waveform preview

🔍 Sample Preview
  ├─ Canvas waveform display
  ├─ Play/Pause buttons
  ├─ Duration display
  ├─ Trim controls
  └─ Volume normalization

🏷️ Voice Naming
  ├─ Text input (30 char limit)
  ├─ Quick suggestions
  ├─ Real-time validation
  └─ Character counter

⚙️ Training Progress
  ├─ Status indicator (Queued/Processing/Ready)
  ├─ Real-time progress bar
  ├─ Percentage display
  ├─ ETA estimate
  └─ Training tips

📚 Voice Library
  ├─ Voice cards grid
  ├─ Voice metadata (name, samples, quality)
  ├─ Training status
  ├─ Quick actions (Use/Preview/Delete)
  └─ Empty state message

🎛️ Customization
  ├─ Pitch slider (±24 semitones)
  ├─ Vibrato control (0-100%)
  ├─ Breathiness slider (0-100%)
  ├─ Vocal character selector (6 options)
  ├─ Real-time preview
  └─ Save/Cancel buttons
```

## Styling (WISE² Design System)

The component automatically uses:
- Dark theme suitable for creative studios
- Neon green accent (#39FF14) for primary actions
- Professional dark blues/grays for surfaces
- Responsive design (mobile to desktop)
- Smooth Framer Motion animations

## Error Messages

### Recording Errors
| Error | Solution |
|-------|----------|
| "Microphone access denied" | Allow microphone in browser settings |
| "Keep recording..." | Record minimum 5 seconds |

### Upload Errors
| Error | Solution |
|-------|----------|
| "Unsupported format" | Use WAV, MP3, M4A, or OGG |
| "File too large" | Reduce to under 5MB |
| "Failed to process" | Try different audio file |

### Validation Errors
| Error | Solution |
|-------|----------|
| "Voice name required" | Enter a name (1-30 chars) |
| "Maximum 30 characters" | Shorten the voice name |

## Browser Requirements

**Minimum**:
- Chrome 60+
- Firefox 55+
- Safari 14.1+
- Edge 79+

**APIs Used**:
- Web Audio API
- MediaRecorder API
- Canvas API
- File API
- Drag & Drop API

## Keyboard Support

- **Tab** - Navigate between controls
- **Enter** - Submit forms
- **Space** - Play/pause preview
- **Escape** - Cancel operations

## Performance Tips

1. **Recording Quality** - Use quiet room with decent microphone
2. **File Upload** - Pre-convert audio to WAV for best compatibility
3. **Training** - Multiple samples improve voice quality
4. **Customization** - Export voice settings as presets

## Integration with Music Generation

```typescript
// Get trained voices from library
const [selectedVoice, setSelectedVoice] = useState<ClonedVoice | null>(null);

// Use voice in generation
function generateMusic(prompt: string) {
  if (selectedVoice?.trainingStatus === 'ready') {
    // Send to music generation API with voiceId
    generateTrack({
      prompt,
      voiceId: selectedVoice.id,
      customization: selectedVoice.customization
    });
  }
}
```

## Voice Customization Presets

### Clear Voice (Podcasting)
- Pitch: 0
- Vibrato: 20%
- Breathiness: 10%
- Character: Clear

### Warm Voice (Singing)
- Pitch: 0
- Vibrato: 60%
- Breathiness: 30%
- Character: Warm

### Powerful Voice (Rap)
- Pitch: -2
- Vibrato: 30%
- Breathiness: 20%
- Character: Powerful

### Breathy Voice (ASMR)
- Pitch: 2
- Vibrato: 40%
- Breathiness: 80%
- Character: Breathy

## Common Workflows

### Workflow 1: Quick Voice Cloning
1. Click "Record"
2. Speak 10 seconds
3. Stop & confirm
4. Enter name
5. Train voice

**Time**: ~2 minutes

### Workflow 2: Perfect Audio Upload
1. Click "Upload"
2. Drag audio file
3. Preview waveform
4. Trim if needed
5. Enable normalization
6. Enter name
7. Train voice

**Time**: ~3 minutes

### Workflow 3: Enhance Voice Quality
1. Click "Library"
2. Select existing voice
3. Click settings icon
4. Adjust customization
5. Save changes

**Time**: ~1 minute

## Troubleshooting

### Recording won't start
- Check microphone permissions in browser
- Restart browser if needed
- Test microphone in system settings

### Audio quality is poor
- Record in quiet environment
- Keep microphone at consistent distance
- Avoid sudden volume spikes
- Use quality microphone

### Training is slow
- Normal: 30-60 seconds per voice
- Multiple samples: takes longer but better quality
- Check internet connection

### File upload fails
- Confirm format: WAV, MP3, M4A, or OGG
- Verify file size under 5MB
- Try re-exporting from audio editor
- Check browser console for errors

## Next Steps

1. **Try Recording** - Warm up with a practice recording
2. **Upload Sample** - Import existing audio
3. **Train Voice** - Start voice training
4. **Customize** - Refine voice characteristics
5. **Generate Music** - Use cloned voice in music generation

## Resources

- **Full Documentation**: See `VOICE_CLONER_DOCS.md`
- **Examples**: Check `VoiceClonerExample.tsx`
- **Component File**: `VoiceCloner.tsx`
- **Design System**: Tailwind config in studio app

## Support

For issues or questions:
1. Check error message in UI
2. Review browser console (F12)
3. Refresh and retry
4. Read full documentation

---

**Status**: Production Ready  
**Last Updated**: 2024-07  
**Version**: 1.0.0
