'use client';

import { useEffect, useRef, useState } from 'react';

interface AuditRecorderProps {
  sessionId: string;
}

export default function AuditRecorder({ sessionId }: AuditRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize audio context and get microphone access
  const initializeAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      micStreamRef.current = stream;

      // Create audio context for waveform visualization
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;

      // Start waveform animation
      updateWaveform();

      setError(null);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMsg);
      console.error('Audio initialization error:', err);
      return false;
    }
  };

  // Update waveform visualization
  const updateWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Normalize data to 0-1 range
    const normalized = Array.from(dataArray).map(val => val / 255);
    setWaveformData(normalized);

    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  };

  // Start recording
  const startRecording = async () => {
    if (isRecording) return;

    const initialized = await initializeAudio();
    if (!initialized || !mediaRecorderRef.current) return;

    const recorder = mediaRecorderRef.current;
    const chunks: Blob[] = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      await uploadRecording(audioBlob);
    };

    recorder.start();
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  // Pause recording
  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setIsPaused(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Stop microphone access
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  // Upload recording to S3
  const uploadRecording = async (audioBlob: Blob) => {
    try {
      setUploadProgress(0);

      // Get presigned URL from backend
      const uploadResponse = await fetch(`/api/v1/audits/${sessionId}/recording/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          filename: `recording-${Date.now()}.webm`,
          recordingType: 'audio',
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { recordingId, s3Key, presignedUrl } = await uploadResponse.json();

      // Upload to S3 using presigned URL
      const formData = new FormData();
      formData.append('file', audioBlob);

      const s3Upload = await fetch(presignedUrl, {
        method: 'PUT',
        body: audioBlob,
        headers: {
          'Content-Type': 'audio/webm',
        },
      });

      if (!s3Upload.ok) {
        throw new Error('Failed to upload to S3');
      }

      setUploadProgress(100);

      // Confirm upload with backend
      await fetch(`/api/v1/audits/${sessionId}/recording/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          recordingId,
          s3Key,
          duration: recordingTime,
          fileSize: audioBlob.size,
        }),
      });

      setError(null);
      // Trigger refresh of recordings list
      window.dispatchEvent(new CustomEvent('recording-uploaded', { detail: { recordingId } }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      console.error('Upload error:', err);
    } finally {
      setUploadProgress(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <h2 className="text-xl font-bold mb-6">Record Evidence</h2>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Waveform Visualization */}
      <div className="mb-8 bg-slate-900 rounded-lg p-4 h-24 flex items-center justify-center">
        <div className="flex items-end gap-1 h-full w-full justify-center">
          {waveformData.length > 0 ? (
            waveformData.slice(0, 32).map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                style={{
                  height: `${Math.max(value * 100, 10)}%`,
                  opacity: isRecording ? 1 : 0.5,
                }}
              />
            ))
          ) : (
            <div className="text-slate-500 text-sm">Ready to record...</div>
          )}
        </div>
      </div>

      {/* Recording Time */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-mono font-bold ${
          isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400'
        }`}>
          {formatTime(recordingTime)}
        </div>
        {isRecording && (
          <div className="text-sm text-red-400 mt-2">Recording in progress...</div>
        )}
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-slate-400">Uploading...</span>
            <span className="text-sm text-slate-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition"
          >
            Start Recording
          </button>
        ) : (
          <>
            <button
              onClick={pauseRecording}
              className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition"
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition"
            >
              Stop & Upload
            </button>
          </>
        )}
      </div>

      <div className="text-xs text-slate-500 mt-6 text-center">
        Audio-only recording recommended. Recordings are stored securely and retained for 7 years.
      </div>
    </div>
  );
}
