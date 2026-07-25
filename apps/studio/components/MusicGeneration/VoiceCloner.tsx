'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Square,
  RotateCcw,
  Upload,
  Play,
  Pause,
  Trash2,
  Plus,
  Volume2,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader,
  Settings2,
  Copy,
  Music,
  Activity,
  ChevronDown,
} from 'lucide-react';

/**
 * Voice Cloning Component
 * Production-grade voice recording, uploading, training, and customization
 * Features: Recording, file upload, sample preview, training progress, voice library, customization
 */

// Types
interface ClonedVoice {
  id: string;
  name: string;
  createdAt: number;
  samples: AudioSample[];
  qualityScore: number; // 1-5 stars
  trainingStatus: 'queued' | 'processing' | 'ready' | 'failed';
  trainingProgress: number; // 0-100
  customization: VoiceCustomization;
}

interface AudioSample {
  id: string;
  url: string;
  duration: number;
  uploadedAt: number;
  waveformData?: number[];
}

interface VoiceCustomization {
  pitch: number; // -24 to +24 semitones
  vibrato: number; // 0-100
  breathiness: number; // 0-100
  character: 'breathy' | 'raspy' | 'clear' | 'warm' | 'powerful' | 'soft';
}

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioData: AudioBuffer | null;
  mediaRecorder: MediaRecorder | null;
}

// Constants
const MIN_RECORDING_DURATION = 5000; // 5 seconds
const MAX_RECORDING_DURATION = 30000; // 30 seconds
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'audio/ogg'];
const VOICE_SUGGESTIONS = ['Sarah - Warm', 'James - Deep', 'Luna - Bright', 'Alex - Neutral'];
const VOCAL_CHARACTERS = ['breathy', 'raspy', 'clear', 'warm', 'powerful', 'soft'] as const;

// Utility function to format time
const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
};

// Utility to generate waveform data
const generateWaveformData = (audioBuffer: AudioBuffer, samples = 100) => {
  const rawData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(rawData.length / samples);
  const filteredData: number[] = [];

  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(rawData[i * blockSize + j]);
    }
    filteredData.push(sum / blockSize);
  }

  return filteredData;
};

// Main Component
export function VoiceCloner() {
  // Recording state
  const [recording, setRecording] = useState<RecordingState>({
    isRecording: false,
    duration: 0,
    audioData: null,
    mediaRecorder: null,
  });

  // Upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Preview state
  const [previewAudio, setPreviewAudio] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(100);
  const [normalizeAudio, setNormalizeAudio] = useState(true);

  // Voice naming
  const [voiceName, setVoiceName] = useState('');
  const [nameError, setNameError] = useState('');

  // Voice library
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<ClonedVoice | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customization, setCustomization] = useState<VoiceCustomization>({
    pitch: 0,
    vibrato: 50,
    breathiness: 50,
    character: 'clear',
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'record' | 'upload' | 'library' | 'customize'>('record');
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [showLevelWarning, setShowLevelWarning] = useState(false);
  const [inputError, setInputError] = useState('');

  // Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio context
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Recording timer
  useEffect(() => {
    if (recording.isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecording((prev) => ({
          ...prev,
          duration: prev.duration + 100,
        }));
      }, 100);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recording.isRecording]);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      setInputError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = audioContextRef.current!;

      // Create analyser for level monitoring
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const decoded = await audioContext.decodeAudioData(arrayBuffer);
        setRecording((prev) => ({
          ...prev,
          audioData: decoded,
          isRecording: false,
        }));
        setPreviewAudio(decoded);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setRecording((prev) => ({
        ...prev,
        isRecording: true,
        duration: 0,
        mediaRecorder,
      }));

      analyserRef.current = analyser;

      // Monitor input level
      const monitorLevel = () => {
        if (!analyser) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setRecordingLevel(average);

        if (average < 10) {
          setShowLevelWarning(true);
        } else if (average > 200) {
          setShowLevelWarning(true);
        } else {
          setShowLevelWarning(false);
        }

        if (recording.duration < MAX_RECORDING_DURATION) {
          requestAnimationFrame(monitorLevel);
        }
      };
      monitorLevel();
    } catch (error) {
      setInputError('Microphone access denied. Please check permissions.');
    }
  }, [recording.duration]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recording.mediaRecorder && recording.isRecording) {
      recording.mediaRecorder.stop();
      setRecording((prev) => ({
        ...prev,
        isRecording: false,
      }));
    }
  }, [recording.mediaRecorder, recording.isRecording]);

  // Cancel recording
  const cancelRecording = useCallback(() => {
    stopRecording();
    setRecording({
      isRecording: false,
      duration: 0,
      audioData: null,
      mediaRecorder: null,
    });
    setPreviewAudio(null);
    setInputError('');
  }, [stopRecording]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setInputError('');

      if (!SUPPORTED_FORMATS.includes(file.type)) {
        setInputError('Unsupported format. Use WAV, MP3, M4A, or OGG.');
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setInputError('File too large. Maximum 5MB.');
        return;
      }

      setUploadedFile(file);

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setUploadProgress(progress);
      }, 200);

      // Decode audio
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = audioContextRef.current!;
      const decoded = await audioContext.decodeAudioData(arrayBuffer);
      setPreviewAudio(decoded);
    } catch (error) {
      setInputError('Failed to process audio file.');
    }
  }, []);

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-wise-accent', 'bg-wise-surface-secondary');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-wise-accent', 'bg-wise-surface-secondary');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-wise-accent', 'bg-wise-surface-secondary');
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  // Validate voice name
  const validateVoiceName = () => {
    if (!voiceName.trim()) {
      setNameError('Voice name required');
      return false;
    }
    if (voiceName.length > 30) {
      setNameError('Maximum 30 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  // Train voice
  const trainVoice = useCallback(() => {
    if (!validateVoiceName() || !previewAudio) return;

    const newVoice: ClonedVoice = {
      id: Math.random().toString(36).substr(2, 9),
      name: voiceName,
      createdAt: Date.now(),
      samples: [
        {
          id: Math.random().toString(36).substr(2, 9),
          url: '',
          duration: previewAudio.duration,
          uploadedAt: Date.now(),
          waveformData: generateWaveformData(previewAudio),
        },
      ],
      qualityScore: 3.5,
      trainingStatus: 'queued',
      trainingProgress: 0,
      customization: {
        pitch: 0,
        vibrato: 50,
        breathiness: 50,
        character: 'clear',
      },
    };

    setClonedVoices((prev) => [...prev, newVoice]);

    // Simulate training progress
    setTimeout(() => {
      setClonedVoices((prev) =>
        prev.map((v) =>
          v.id === newVoice.id
            ? { ...v, trainingStatus: 'processing', trainingProgress: 0 }
            : v
        )
      );

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setClonedVoices((prev) =>
            prev.map((v) =>
              v.id === newVoice.id
                ? { ...v, trainingStatus: 'ready', trainingProgress: 100 }
                : v
            )
          );
        } else {
          setClonedVoices((prev) =>
            prev.map((v) =>
              v.id === newVoice.id ? { ...v, trainingProgress: progress } : v
            )
          );
        }
      }, 800);
    }, 1000);

    // Reset form
    setVoiceName('');
    setPreviewAudio(null);
    setUploadedFile(null);
    setUploadProgress(0);
    setActiveTab('library');
  }, [previewAudio, voiceName]);

  // Play sample preview
  const playPreview = useCallback(() => {
    if (!previewAudio || !previewAudioRef.current) return;

    const audioContext = audioContextRef.current!;
    const offlineContext = new OfflineAudioContext(
      previewAudio.numberOfChannels,
      previewAudio.length,
      previewAudio.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = previewAudio;
    source.connect(offlineContext.destination);
    source.start(0);

    offlineContext.startRendering().then((rendered) => {
      const blob = new Blob([rendered], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      previewAudioRef.current!.src = url;
      previewAudioRef.current!.play();
      setIsPlaying(true);
    });
  }, [previewAudio]);

  const pausePreview = useCallback(() => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Delete voice
  const deleteVoice = (voiceId: string) => {
    setClonedVoices((prev) => prev.filter((v) => v.id !== voiceId));
    setSelectedVoice(null);
    setShowCustomization(false);
  };

  // Render waveform
  useEffect(() => {
    if (!waveformCanvasRef.current || !previewAudio) return;

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const rawData = previewAudio.getChannelData(0);
    const samples = 200;
    const blockSize = Math.floor(rawData.length / samples);

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.fillStyle = '#0D1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#39FF14';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[i * blockSize + j]);
      }
      const average = sum / blockSize;
      const x = (i / samples) * canvas.width;
      const y = canvas.height / 2 - average * canvas.height * 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
  }, [previewAudio]);

  // Render tabs
  const RecordTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Recording State */}
      <div className="bg-gradient-to-br from-studio-panel to-studio-raised border border-wise-medium rounded-xl p-8">
        {!recording.isRecording && !previewAudio ? (
          <div className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-wise-accent/10 border border-wise-accent/30">
              <Mic className="h-8 w-8 text-wise-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-wise-text-primary">Record Your Voice</h3>
              <p className="text-sm text-wise-text-muted mt-1">5-30 seconds minimum</p>
            </div>
            <motion.button
              onClick={startRecording}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-wise-accent text-studio-bg font-semibold hover:bg-wise-accent-bright transition"
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </motion.button>
          </div>
        ) : recording.isRecording ? (
          <div className="space-y-6">
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-wise-accent-red/20 border border-wise-accent-red"
              >
                <Mic className="h-8 w-8 text-wise-accent-red" />
              </motion.div>
              <p className="text-2xl font-bold text-wise-accent mt-4">
                {formatTime(recording.duration)}
              </p>
              <p className="text-xs text-wise-text-muted mt-2">
                {recording.duration >= MIN_RECORDING_DURATION ? '✓ Recording' : 'Keep recording...'}
              </p>
            </div>

            {/* Input Level Meter */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-wise-text-muted uppercase">
                  Input Level
                </label>
                <span className="text-xs text-wise-text-muted">
                  {recordingLevel.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-studio-line rounded-full overflow-hidden">
                <motion.div
                  className={`h-full transition-all ${
                    recordingLevel < 20 || recordingLevel > 200
                      ? 'bg-wise-accent-red'
                      : 'bg-wise-accent'
                  }`}
                  style={{ width: `${Math.min((recordingLevel / 255) * 100, 100)}%` }}
                />
              </div>
              {showLevelWarning && (
                <div className="flex items-center gap-2 text-xs text-wise-accent-red">
                  <AlertCircle className="h-4 w-4" />
                  {recordingLevel < 20 ? 'Too quiet' : 'Too loud'}
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-wise-surface/50 rounded-lg p-3 border border-wise-medium">
              <p className="text-xs text-wise-text-muted">
                💡 Speak clearly, minimize background noise, maintain consistent volume
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              <motion.button
                onClick={stopRecording}
                disabled={recording.duration < MIN_RECORDING_DURATION}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-wise-primary text-white font-semibold hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Square className="h-5 w-5" />
                {recording.duration >= MIN_RECORDING_DURATION ? 'Stop Recording' : 'Keep Recording'}
              </motion.button>
              <motion.button
                onClick={cancelRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-3 rounded-lg bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary font-semibold transition"
              >
                <RotateCcw className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-wise-text-secondary">Sample recorded successfully</p>
            <div className="flex gap-3">
              <motion.button
                onClick={() => {
                  cancelRecording();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary font-semibold transition"
              >
                Re-record
              </motion.button>
              <motion.button
                onClick={() => setActiveTab('upload')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold transition"
              >
                Next
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const UploadTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Drag and Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-wise-medium hover:border-wise-accent rounded-xl p-12 text-center cursor-pointer transition-all bg-wise-surface/30"
      >
        <Upload className="h-12 w-12 text-wise-text-muted mx-auto mb-3" />
        <h3 className="font-semibold text-wise-text-primary mb-1">Drag audio file here</h3>
        <p className="text-sm text-wise-text-muted mb-4">
          WAV, MP3, M4A, OGG • Max 5MB
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-wise-accent text-studio-bg font-semibold"
        >
          Browse Files
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadedFile && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-wise-text-primary">{uploadedFile.name}</span>
            <span className="text-xs text-wise-text-muted">{uploadProgress.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-studio-line rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-wise-accent"
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview */}
      {previewAudio && (
        <div className="bg-studio-panel border border-wise-medium rounded-xl p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold text-wise-text-muted uppercase mb-2">Waveform Preview</p>
            <canvas
              ref={waveformCanvasRef}
              className="w-full h-20 rounded-lg bg-studio-raised"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-wise-text-secondary">
              Duration: {formatTime(previewAudio.duration * 1000)}
            </span>
            <motion.button
              onClick={isPlaying ? pausePreview : playPreview}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-wise-accent text-studio-bg font-semibold"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </motion.button>
            <audio ref={previewAudioRef} onEnded={() => setIsPlaying(false)} />
          </div>

          {/* Trimming */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-wise-text-muted uppercase">Trim Sample</label>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={trimStart}
                onChange={(e) => setTrimStart(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-wise-text-muted">
                {Math.round((trimStart / 100) * (previewAudio.duration * 1000)) / 1000}s
              </span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="range"
                min="0"
                max="100"
                value={trimEnd}
                onChange={(e) => setTrimEnd(Number(e.target.value))}
                className="flex-1"
              />
              <span className="text-xs text-wise-text-muted">
                {Math.round((trimEnd / 100) * (previewAudio.duration * 1000)) / 1000}s
              </span>
            </div>
          </div>

          {/* Normalization */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeAudio}
              onChange={(e) => setNormalizeAudio(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm text-wise-text-secondary">Normalize volume</span>
          </label>
        </div>
      )}

      {/* Next Button */}
      <div className="flex gap-3">
        <motion.button
          onClick={() => setActiveTab('record')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-3 rounded-lg bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary font-semibold transition"
        >
          Back
        </motion.button>
        <motion.button
          onClick={() => setActiveTab('upload')}
          disabled={!previewAudio}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-4 py-3 rounded-lg bg-wise-primary hover:bg-wise-primary-hover text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Continue
        </motion.button>
      </div>

      {/* Error */}
      {inputError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-wise-accent-red/10 border border-wise-accent-red/30 text-wise-accent-red text-sm">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {inputError}
        </div>
      )}
    </motion.div>
  );

  const LibraryTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {clonedVoices.length === 0 ? (
        <div className="text-center py-12 bg-studio-panel border border-wise-medium rounded-xl">
          <Music className="h-12 w-12 text-wise-text-muted mx-auto mb-3" />
          <p className="text-wise-text-secondary mb-1">No cloned voices yet</p>
          <p className="text-sm text-wise-text-muted">Record or upload a sample to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clonedVoices.map((voice) => (
            <motion.div
              key={voice.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-studio-panel border border-wise-medium rounded-lg p-4 hover:border-wise-accent/50 transition cursor-pointer"
              onClick={() => {
                setSelectedVoice(voice);
                setCustomization(voice.customization);
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-wise-text-primary">{voice.name}</h4>
                  <p className="text-xs text-wise-text-muted mt-1">
                    {voice.samples.length} sample{voice.samples.length !== 1 ? 's' : ''} •{' '}
                    {new Date(voice.createdAt).toLocaleDateString()}
                  </p>

                  {/* Quality Stars */}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < Math.round(voice.qualityScore)
                            ? 'text-wise-accent-orange'
                            : 'text-wise-text-muted'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Training Status */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-wise-text-muted">
                        {voice.trainingStatus === 'ready' && '✓ Ready to use'}
                        {voice.trainingStatus === 'processing' && 'Training...'}
                        {voice.trainingStatus === 'queued' && 'Queued'}
                        {voice.trainingStatus === 'failed' && 'Training failed'}
                      </span>
                      {voice.trainingStatus !== 'ready' && (
                        <span className="text-xs text-wise-text-muted">{voice.trainingProgress.toFixed(0)}%</span>
                      )}
                    </div>
                    {voice.trainingStatus !== 'ready' && (
                      <div className="h-1 bg-studio-line rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-wise-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${voice.trainingProgress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {voice.trainingStatus === 'ready' && (
                    <>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVoice(voice);
                          setShowCustomization(true);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-wise-surface-secondary hover:bg-wise-accent/20 text-wise-text-primary transition"
                        title="Customize"
                      >
                        <Settings2 className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 rounded-lg bg-wise-surface-secondary hover:bg-wise-accent/20 text-wise-text-primary transition"
                        title="Preview"
                      >
                        <Play className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVoice(voice.id);
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg bg-wise-accent-red/10 hover:bg-wise-accent-red/20 text-wise-accent-red transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create New */}
      <motion.button
        onClick={() => {
          setActiveTab('record');
          setRecording({
            isRecording: false,
            duration: 0,
            audioData: null,
            mediaRecorder: null,
          });
          setPreviewAudio(null);
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-lg border-2 border-dashed border-wise-medium hover:border-wise-accent text-wise-text-secondary hover:text-wise-accent transition flex items-center justify-center gap-2"
      >
        <Plus className="h-5 w-5" />
        Add New Voice
      </motion.button>
    </motion.div>
  );

  const CustomizationTab = () =>
    selectedVoice ? (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h3 className="font-semibold text-wise-text-primary mb-1">{selectedVoice.name}</h3>
          <p className="text-sm text-wise-text-muted">Customize voice characteristics</p>
        </div>

        {/* Pitch Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-wise-text-primary">Pitch</label>
            <span className="text-sm text-wise-accent">
              {customization.pitch > 0 ? '+' : ''}{customization.pitch} semitones
            </span>
          </div>
          <input
            type="range"
            min="-24"
            max="24"
            value={customization.pitch}
            onChange={(e) =>
              setCustomization((prev) => ({ ...prev, pitch: Number(e.target.value) }))
            }
            className="w-full"
          />
          <div className="flex justify-between text-xs text-wise-text-muted">
            <span>Lower</span>
            <span>Higher</span>
          </div>
        </div>

        {/* Vibrato Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-wise-text-primary">Vibrato</label>
            <span className="text-sm text-wise-accent">{customization.vibrato}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={customization.vibrato}
            onChange={(e) =>
              setCustomization((prev) => ({ ...prev, vibrato: Number(e.target.value) }))
            }
            className="w-full"
          />
        </div>

        {/* Breathiness Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-wise-text-primary">Breathiness</label>
            <span className="text-sm text-wise-accent">{customization.breathiness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={customization.breathiness}
            onChange={(e) =>
              setCustomization((prev) => ({ ...prev, breathiness: Number(e.target.value) }))
            }
            className="w-full"
          />
        </div>

        {/* Character Selector */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-wise-text-primary">Vocal Character</label>
          <div className="grid grid-cols-2 gap-2">
            {VOCAL_CHARACTERS.map((char) => (
              <motion.button
                key={char}
                onClick={() =>
                  setCustomization((prev) => ({
                    ...prev,
                    character: char as any,
                  }))
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition capitalize ${
                  customization.character === char
                    ? 'bg-wise-accent text-studio-bg'
                    : 'bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary'
                }`}
              >
                {char}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <motion.button
            onClick={() => setShowCustomization(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-3 rounded-lg bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary font-semibold transition"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={() => {
              setClonedVoices((prev) =>
                prev.map((v) => (v.id === selectedVoice.id ? { ...v, customization } : v))
              );
              setShowCustomization(false);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-1 px-4 py-3 rounded-lg bg-wise-accent text-studio-bg font-semibold transition"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    ) : null;

  // Render Voice Naming Section
  const RenderVoiceNaming = () => (
    <div className="bg-studio-panel border border-wise-medium rounded-xl p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-wise-text-primary mb-2">Voice Name</label>
        <input
          type="text"
          value={voiceName}
          onChange={(e) => setVoiceName(e.target.value)}
          placeholder="e.g., Sarah - Warm"
          className="w-full px-4 py-2 rounded-lg bg-studio-input border border-wise-medium text-wise-text-primary placeholder-wise-text-muted focus:outline-none focus:border-wise-accent"
        />
        {nameError && (
          <p className="text-xs text-wise-accent-red mt-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {nameError}
          </p>
        )}
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 flex-wrap">
        {VOICE_SUGGESTIONS.map((suggestion) => (
          <motion.button
            key={suggestion}
            onClick={() => setVoiceName(suggestion)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-xs px-3 py-1 rounded-full bg-wise-surface-secondary hover:bg-wise-accent/20 text-wise-text-secondary hover:text-wise-accent transition"
          >
            {suggestion}
          </motion.button>
        ))}
      </div>

      {/* Train Button */}
      <motion.button
        onClick={trainVoice}
        disabled={!voiceName.trim() || !previewAudio}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-wise-accent text-studio-bg font-semibold hover:bg-wise-accent-bright disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <Zap className="h-5 w-5" />
        Train Voice
      </motion.button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-wise-text-primary flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-wise-accent/20 border border-wise-accent/40 flex items-center justify-center">
            <Mic className="h-6 w-6 text-wise-accent" />
          </div>
          Voice Cloning Studio
        </h2>
        <p className="text-wise-text-muted mt-2">
          Create custom AI voices by recording or uploading audio samples
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'record', label: 'Record', icon: Mic },
          { id: 'upload', label: 'Upload', icon: Upload },
          { id: 'library', label: 'Library', icon: Music },
        ].map(({ id, label, icon: Icon }) => (
          <motion.button
            key={id}
            onClick={() => {
              if (id === 'upload' && !previewAudio) {
                setInputError('Record or upload a sample first');
                return;
              }
              setActiveTab(id as any);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition whitespace-nowrap ${
              activeTab === id
                ? 'bg-wise-accent text-studio-bg'
                : 'bg-wise-surface-secondary hover:bg-wise-surface text-wise-text-primary'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'record' && <RecordTab />}
          {activeTab === 'upload' && <UploadTab />}
          {activeTab === 'library' && <LibraryTab />}
        </AnimatePresence>

        {/* Voice Naming (shown after preview) */}
        {previewAudio && activeTab !== 'library' && !showCustomization && (
          <RenderVoiceNaming />
        )}

        {/* Customization Panel */}
        {showCustomization && <CustomizationTab />}
      </div>

      {/* Hidden Audio Elements */}
      <audio ref={previewAudioRef} crossOrigin="anonymous" />
    </motion.div>
  );
}

export default VoiceCloner;
