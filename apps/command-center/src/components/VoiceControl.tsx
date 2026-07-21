'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TranscriptMessage {
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export const VoiceControl: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [language, setLanguage] = useState('en');
  const [volume, setVolume] = useState(50);
  const wsRef = useRef<WebSocket | null>(null);
  const micRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/voice`);

    ws.onopen = () => {
      console.log('Voice WebSocket connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleVoiceMessage(message);
    };

    ws.onerror = (error) => {
      console.error('Voice WebSocket error:', error);
    };

    wsRef.current = ws;
  };

  const handleVoiceMessage = (message: any) => {
    switch (message.type) {
      case 'transcript':
        addTranscript('user', message.text);
        break;
      case 'response':
        addTranscript('assistant', message.text);
        break;
      case 'error':
        console.error('Voice error:', message.error);
        break;
    }
  };

  const addTranscript = (type: 'user' | 'assistant', text: string) => {
    setTranscript((prev) => [...prev, { type, text, timestamp: new Date() }]);
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micRef.current = stream;
      setIsListening(true);

      // Send start-session message
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'start-session',
          userId: 'current-user',
        }));
      }

      // Send audio chunks
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        const pcmData = this.float32ToPCM(audioData);
        const base64Audio = this.bufferToBase64(pcmData);

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'audio-chunk',
            data: base64Audio,
          }));
        }
      };
    } catch (error) {
      console.error('Failed to start listening:', error);
    }
  };

  const stopListening = () => {
    setIsListening(false);

    if (micRef.current) {
      micRef.current.getTracks().forEach((track) => track.stop());
      micRef.current = null;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop-session' }));
    }
  };

  const float32ToPCM = (float32Array: Float32Array): Int16Array => {
    const pcm = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return pcm;
  };

  const bufferToBase64 = (buffer: Int16Array): string => {
    const bytes = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Voice Assistant</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 bg-white shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Voice Control</h3>
            <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500' : 'bg-gray-400'}`} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="ja">Japanese</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Volume: {volume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-full px-4 py-3 rounded text-white font-medium ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? 'Stop Listening' : 'Start Listening'}
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4 bg-white shadow-md">
          <h3 className="font-bold mb-4">Transcript</h3>
          <div className="h-96 overflow-y-auto bg-gray-50 rounded p-3 space-y-2">
            {transcript.length === 0 ? (
              <p className="text-gray-500 text-sm">No transcript yet...</p>
            ) : (
              transcript.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded text-sm ${
                    msg.type === 'user'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-green-100 text-green-900'
                  }`}
                >
                  <strong>{msg.type === 'user' ? 'You' : 'Assistant'}:</strong> {msg.text}
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setTranscript([])}
            className="mt-3 w-full px-4 py-2 border rounded text-sm hover:bg-gray-50"
          >
            Clear Transcript
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
