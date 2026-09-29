'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video, Square, Download } from 'lucide-react';

interface ScreenRecorderProps {
  isRecording: boolean;
  onToggle: (state: boolean) => void;
}

export default function ScreenRecorder({ isRecording, onToggle }: ScreenRecorderProps) {
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      // Get display media (screen)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: false,
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedChunks([blob]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (error) {
      console.error('Recording failed:', error);
      onToggle(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const downloadRecording = () => {
    if (recordedChunks.length === 0) return;

    const blob = recordedChunks[0];
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-session-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {isRecording && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/50 rounded-full"
        >
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-red-300">{formatTime(duration)}</span>
        </motion.div>
      )}

      <button
        onClick={() => onToggle(!isRecording)}
        className={`p-2 rounded-lg transition border flex items-center gap-2 px-3 ${
          isRecording
            ? 'bg-red-900/30 border-red-500/50 text-red-300 hover:bg-red-900/50'
            : 'bg-violet-900/20 border-violet-400/20 text-violet-300 hover:bg-violet-900/30'
        }`}
      >
        {isRecording ? (
          <>
            <Square className="w-4 h-4" />
            <span className="text-xs font-semibold">Stop Recording</span>
          </>
        ) : (
          <>
            <Video className="w-4 h-4" />
            <span className="text-xs font-semibold">Record Session</span>
          </>
        )}
      </button>

      {recordedChunks.length > 0 && !isRecording && (
        <button
          onClick={downloadRecording}
          className="p-2 rounded-lg bg-green-900/30 border border-green-500/50 text-green-300 hover:bg-green-900/50 transition flex items-center gap-2 px-3"
        >
          <Download className="w-4 h-4" />
          <span className="text-xs font-semibold">Download</span>
        </button>
      )}
    </div>
  );
}
