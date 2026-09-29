# Music Generation Suite — Quick Start Guide

## Installation & Setup

All components are already in `/apps/studio/components/MusicGeneration/` and exported from `index.ts`.

### Import All Components

```tsx
import {
  GenerationPrompt,
  StyleSelector,
  MoodSelector,
  TempoControl,
  DurationSelector,
  VoiceSelector,
  InstrumentPicker,
  KeyScaleControl,
  IntensityControl,
  GenerationQueue,
  GenerationHistory,
} from '@/components/MusicGeneration';
```

### Import Individual Components

```tsx
import { GenerationPrompt } from '@/components/MusicGeneration/GenerationPrompt';
import { MoodSelector } from '@/components/MusicGeneration/MoodSelector';
// ... etc
```

---

## 5-Minute Setup: Basic Music Generator

Create a simple music generation interface in 5 minutes:

```tsx
'use client';

import React, { useState } from 'react';
import {
  GenerationPrompt,
  StyleSelector,
  MoodSelector,
  TempoControl,
  DurationSelector,
} from '@/components/MusicGeneration';

export function QuickGenerator() {
  const [prompt, setPrompt] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState('happy');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Call your API
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genres,
          mood,
          tempo,
          duration,
        }),
      });
      const data = await response.json();
      console.log('Generated:', data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Music Generator</h1>

      <GenerationPrompt
        value={prompt}
        onChange={setPrompt}
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />

      <StyleSelector selectedGenres={genres} onGenresChange={setGenres} />

      <MoodSelector value={mood} onChange={setMood} />

      <TempoControl value={tempo} onChange={setTempo} />

      <DurationSelector value={duration} onChange={setDuration} />
    </div>
  );
}
```

**Result**: A fully functional music generator with 5 interactive components in ~50 lines of code.

---

## 30-Minute Setup: Full Advanced Generator

Create a professional-grade generator with all 11 components:

```tsx
'use client';

import React, { useState } from 'react';
import {
  GenerationPrompt,
  StyleSelector,
  MoodSelector,
  TempoControl,
  DurationSelector,
  VoiceSelector,
  InstrumentPicker,
  KeyScaleControl,
  IntensityControl,
  GenerationQueue,
  GenerationHistory,
} from '@/components/MusicGeneration';

interface GenerationJob {
  id: string;
  prompt: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  eta?: number;
  createdAt: number;
}

interface Generation {
  id: string;
  prompt: string;
  genre: string;
  mood: string;
  audioUrl: string;
  createdAt: number;
}

export function AdvancedMusicStudio() {
  // Basic state
  const [prompt, setPrompt] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [mood, setMood] = useState('happy');
  const [tempo, setTempo] = useState(120);
  const [duration, setDuration] = useState(30);

  // Advanced state
  const [voice, setVoice] = useState<string>();
  const [instruments, setInstruments] = useState<string[]>([]);
  const [key, setKey] = useState('C');
  const [scale, setScale] = useState('major');
  const [intensity, setIntensity] = useState(5);
  const [complexity, setComplexity] = useState(5);

  // Queue & History
  const [generationJobs, setGenerationJobs] = useState<GenerationJob[]>([]);
  const [generationHistory, setGenerationHistory] = useState<Generation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const handleGenerate = async () => {
    if (!prompt.trim() || genres.length === 0) {
      alert('Please fill in prompt and select at least one genre');
      return;
    }

    setIsGenerating(true);

    // Add to queue
    const newJob: GenerationJob = {
      id: `job-${Date.now()}`,
      prompt,
      status: 'queued',
      progress: 0,
      createdAt: Date.now(),
    };

    setGenerationJobs(prev => [...prev, newJob]);

    try {
      // Call your API
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genres,
          mood,
          tempo,
          duration,
          voice,
          instruments,
          key,
          scale,
          intensity,
          complexity,
        }),
      });

      const data = await response.json();

      // Update job status
      setGenerationJobs(prev =>
        prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'completed', progress: 100, audioUrl: data.audioUrl }
            : job
        )
      );

      // Add to history
      setGenerationHistory(prev => [
        {
          id: data.id,
          prompt,
          genre: genres[0],
          mood,
          audioUrl: data.audioUrl,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
    } catch (error) {
      console.error('Generation failed:', error);
      setGenerationJobs(prev =>
        prev.map(job =>
          job.id === newJob.id
            ? { ...job, status: 'failed' }
            : job
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelJob = (jobId: string) => {
    setGenerationJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const handleDownload = async (id: string, audioUrl: string, name: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${name || 'music'}.mp3`;
    link.click();
  };

  const handleDeleteGeneration = (id: string) => {
    setGenerationHistory(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="min-h-screen bg-studio-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-wise-text-primary">
            WISE² Music Generation Studio
          </h1>
          <p className="text-wise-text-secondary">
            Create professional music with AI. Fine-tune every aspect of your track.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Basic Description */}
            <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
              <h2 className="text-lg font-bold text-wise-text-primary mb-4">1. Describe Your Music</h2>
              <GenerationPrompt
                value={prompt}
                onChange={setPrompt}
                onGenerate={handleGenerate}
                isLoading={isGenerating}
              />
            </div>

            {/* Section 2: Style & Mood */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">2. Choose Genre</h2>
                <StyleSelector selectedGenres={genres} onGenresChange={setGenres} />
              </div>
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">3. Set Mood</h2>
                <MoodSelector value={mood} onChange={setMood} />
              </div>
            </div>

            {/* Section 3: Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">4. Set Tempo</h2>
                <TempoControl value={tempo} onChange={setTempo} />
              </div>
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">5. Set Duration</h2>
                <DurationSelector value={duration} onChange={setDuration} />
              </div>
            </div>

            {/* Section 4: Advanced */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">6. Choose Voice (Optional)</h2>
                <VoiceSelector selectedVoice={voice} onVoiceChange={setVoice} />
              </div>
              <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                <h2 className="text-lg font-bold text-wise-text-primary mb-4">7. Select Instruments</h2>
                <InstrumentPicker
                  selectedInstruments={instruments}
                  onInstrumentsChange={setInstruments}
                  complexity={complexity}
                  onComplexityChange={setComplexity}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                  <h2 className="text-lg font-bold text-wise-text-primary mb-4">8. Set Key & Scale</h2>
                  <KeyScaleControl
                    selectedKey={key}
                    onKeyChange={setKey}
                    selectedScale={scale}
                    onScaleChange={setScale}
                    suggestBased={{ mood }}
                  />
                </div>
                <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
                  <h2 className="text-lg font-bold text-wise-text-primary mb-4">9. Set Intensity</h2>
                  <IntensityControl value={intensity} onChange={setIntensity} />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Queue & Quick Info */}
          <div className="space-y-6">
            <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
              <h2 className="text-lg font-bold text-wise-text-primary mb-4">Generation Queue</h2>
              <GenerationQueue
                jobs={generationJobs}
                onCancel={handleCancelJob}
              />
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-studio-panel border border-studio-line rounded-lg p-6">
          <h2 className="text-lg font-bold text-wise-text-primary mb-4">Your Generations</h2>
          <GenerationHistory
            generations={generationHistory}
            onDownload={handleDownload}
            onDelete={handleDeleteGeneration}
          />
        </div>
      </div>
    </div>
  );
}
```

---

## Component Props Quick Reference

| Component | Key Props | Purpose |
|-----------|-----------|---------|
| **GenerationPrompt** | value, onChange, onGenerate | Music description textarea |
| **StyleSelector** | selectedGenres, onGenresChange | Genre picker (100+ genres) |
| **MoodSelector** | value, onChange | Mood/vibe selector (8 moods) |
| **TempoControl** | value, onChange | BPM control with tap tempo |
| **DurationSelector** | value, onChange | Track length selector |
| **VoiceSelector** | selectedVoice, onVoiceChange | Voice/narrator picker |
| **InstrumentPicker** | selectedInstruments, onInstrumentsChange | Multi-select instruments |
| **KeyScaleControl** | selectedKey, selectedScale, onKeyChange, onScaleChange | Music theory controls |
| **IntensityControl** | value, onChange | Energy level slider |
| **GenerationQueue** | jobs, onCancel, onRetry | Real-time job monitoring |
| **GenerationHistory** | generations, onPlay, onDownload | Browse generated tracks |

---

## State Management Example

```tsx
// Using Zustand for global state
import { create } from 'zustand';

interface MusicStore {
  // Form state
  prompt: string;
  genres: string[];
  mood: string;
  tempo: number;
  duration: number;
  voice?: string;
  instruments: string[];
  key: string;
  scale: string;
  intensity: number;

  // Queue & History
  generationJobs: GenerationJob[];
  generationHistory: Generation[];

  // Actions
  setPrompt: (prompt: string) => void;
  addToQueue: (job: GenerationJob) => void;
  addToHistory: (generation: Generation) => void;
  // ... etc
}

export const useMusicStore = create<MusicStore>((set) => ({
  prompt: '',
  genres: [],
  mood: 'happy',
  tempo: 120,
  duration: 30,
  voice: undefined,
  instruments: [],
  key: 'C',
  scale: 'major',
  intensity: 5,
  generationJobs: [],
  generationHistory: [],

  setPrompt: (prompt) => set({ prompt }),
  addToQueue: (job) =>
    set((state) => ({
      generationJobs: [...state.generationJobs, job],
    })),
  addToHistory: (generation) =>
    set((state) => ({
      generationHistory: [generation, ...state.generationHistory],
    })),
}));
```

---

## API Endpoints to Implement

### POST /api/music/generate

**Request:**
```json
{
  "prompt": "Upbeat electronic dance track...",
  "genres": ["EDM", "House"],
  "mood": "energetic",
  "tempo": 128,
  "duration": 30,
  "voice": "voice-f-1",
  "instruments": ["drums", "synth", "bass"],
  "key": "G",
  "scale": "major",
  "intensity": 8,
  "complexity": 7
}
```

**Response:**
```json
{
  "id": "gen-12345",
  "jobId": "job-67890",
  "status": "queued",
  "audioUrl": "https://cdn.example.com/tracks/gen-12345.mp3",
  "waveformUrl": "https://cdn.example.com/waveforms/gen-12345.svg",
  "generationTime": 45
}
```

### GET /api/music/status/:jobId

**Response:**
```json
{
  "jobId": "job-67890",
  "status": "generating",
  "progress": 65,
  "eta": 20
}
```

---

## Tips & Best Practices

1. **Validate Input**: Always check that genres are selected and prompt is not empty
2. **Show Progress**: Use GenerationQueue to keep users informed
3. **Save Preferences**: Use localStorage to remember user settings
4. **Mobile Responsive**: All components are mobile-friendly by default
5. **Error Handling**: Catch API errors and show user-friendly messages
6. **Favorites System**: Store favorite tracks for quick access
7. **Undo/Redo**: Consider adding undo for form changes
8. **Keyboard Shortcuts**: Add cmd+enter for quick generation

---

## Troubleshooting

**Q: Components not showing?**
A: Make sure you're using `'use client'` at the top of your file (these are client components)

**Q: Styles not applying?**
A: Ensure `tailwind.config.js` includes the custom colors for `wise-accent`, `studio-input`, etc.

**Q: Audio previews not working?**
A: Check browser console for CORS errors. Add your domain to CORS whitelist.

**Q: Animations too fast?**
A: Adjust Framer Motion `transition` props or disable with `prefers-reduced-motion`

---

## Performance Tips

- **Lazy Load History**: Only show 12 items per page in GenerationHistory
- **Debounce Search**: Add 300ms debounce to search inputs
- **Memoize Callbacks**: Wrap handlers in useCallback to prevent unnecessary re-renders
- **Split Code**: Import only the components you need

---

## Next Steps

1. ✅ Copy components to your project
2. ⬜ Connect to your music generation API (Suno, etc.)
3. ⬜ Add state management (Zustand/Redux)
4. ⬜ Set up authentication
5. ⬜ Add WebSocket for real-time updates
6. ⬜ Implement analytics tracking
7. ⬜ Deploy to production

**Estimated setup time**: 30 minutes to fully integrated system

---

## Support

- See `MUSIC_GENERATION_SUITE.md` for detailed component documentation
- Check `PromptBuilder.tsx` for existing implementation patterns
- Review `GenerationLibrary.tsx` for history examples
- Test with `VoiceClonerExample.tsx` for reference implementation

Happy music generating! 🎵
