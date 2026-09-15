'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Square, Zap, Volume2, Eye } from 'lucide-react';

interface StreamStatistics {
  videoBitrate: number;
  fps: number;
  resolution: string;
  latency: number;
  viewers: number;
  isRecording: boolean;
}

interface LiveStreamViewerProps {
  jobId: string;
  onAnnotation?: (annotation: AnnotationDrawing) => void;
}

interface AnnotationDrawing {
  type: 'circle' | 'arrow' | 'rectangle' | 'text' | 'freehand';
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  color: string;
  text?: string;
}

export function LiveStreamViewer({ jobId, onAnnotation }: LiveStreamViewerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [streamStats, setStreamStats] = useState<StreamStatistics | null>(null);
  const [selectedTool, setSelectedTool] = useState<string>('circle');
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [viewers, setViewers] = useState<any[]>([]);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
        { urls: ['stun:stun1.l.google.com:19302'] },
      ],
    });

    // Setup video element to receive stream
    peerConnection.ontrack = (event) => {
      if (videoRef.current) {
        videoRef.current.srcObject = event.streams[0];
      }
    };

    // Subscribe to stream
    const subscribeToStream = async () => {
      try {
        const dtlsParameters = await peerConnection.createAnswer();
        peerConnection.setLocalDescription(dtlsParameters);

        const response = await fetch(`/api/jobs/${jobId}/stream/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dtlsParameters }),
        });

        const data = await response.json();

        // Apply remote description
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: 'offer',
            sdp: data.rtpParameters,
          })
        );
      } catch (error) {
        console.error('Failed to subscribe to stream:', error);
      }
    };

    subscribeToStream();

    // Poll for stream stats
    const statsInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/stream/stats`);
        const stats = await response.json();
        setStreamStats(stats);
      } catch (error) {
        console.error('Failed to fetch stream stats:', error);
      }
    }, 1000);

    // Fetch viewers list
    const viewersInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}/stream/viewers`);
        const data = await response.json();
        setViewers(data);
      } catch (error) {
        console.error('Failed to fetch viewers:', error);
      }
    }, 5000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(viewersInterval);
      peerConnection.close();
    };
  }, [jobId]);

  // Drawing canvas handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDrawStart({ x, y });
    setIsDrawing(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    redrawCanvas(x, y);
  };

  const handleCanvasMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x2 = e.clientX - rect.left;
    const y2 = e.clientY - rect.top;

    const annotation: AnnotationDrawing = {
      type: selectedTool as any,
      x: drawStart.x,
      y: drawStart.y,
      x2,
      y2,
      color: selectedColor,
    };

    onAnnotation?.(annotation);
    setIsDrawing(false);
    clearCanvas();
  };

  const redrawCanvas = (x2: number, y2: number) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    clearCanvas();

    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor + '33';
    ctx.lineWidth = 2;

    switch (selectedTool) {
      case 'circle': {
        const radius = Math.sqrt(Math.pow(x2 - drawStart.x, 2) + Math.pow(y2 - drawStart.y, 2));
        ctx.beginPath();
        ctx.arc(drawStart.x, drawStart.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'rectangle': {
        const width = x2 - drawStart.x;
        const height = y2 - drawStart.y;
        ctx.fillRect(drawStart.x, drawStart.y, width, height);
        ctx.strokeRect(drawStart.x, drawStart.y, width, height);
        break;
      }
      case 'arrow': {
        const headlen = 15;
        const angle = Math.atan2(y2 - drawStart.y, x2 - drawStart.x);
        ctx.beginPath();
        ctx.moveTo(drawStart.x, drawStart.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headlen * Math.cos(angle - Math.PI / 6), y2 - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headlen * Math.cos(angle + Math.PI / 6), y2 - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
        break;
      }
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const startRecording = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/stream/record/start`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsRecording(true);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/stream/record/stop`, {
        method: 'POST',
      });
      if (response.ok) {
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  return (
    <Card className="w-full border-cyan-500/20 bg-black">
      <CardHeader className="border-b border-cyan-500/20">
        <div className="flex justify-between items-center">
          <CardTitle className="text-cyan-400">Live Stream</CardTitle>
          <div className="flex gap-2">
            {isRecording ? (
              <Button
                size="sm"
                variant="destructive"
                onClick={stopRecording}
                className="gap-2"
              >
                <Square size={16} />
                Stop Recording
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={startRecording}
                className="gap-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
              >
                <Play size={16} />
                Start Recording
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Video feed */}
        <div className="relative w-full bg-black rounded-lg overflow-hidden border border-cyan-500/30">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto"
          />
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="absolute inset-0 cursor-crosshair"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={() => setIsDrawing(false)}
          />

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/80 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-red-200 rounded-full animate-pulse" />
              <span className="text-white text-xs font-semibold">REC</span>
            </div>
          )}

          {/* Stats overlay */}
          {streamStats && (
            <div className="absolute bottom-4 left-4 bg-black/70 rounded p-2 text-xs text-cyan-400 space-y-1 font-mono">
              <div>📊 {streamStats.videoBitrate} Mbps</div>
              <div>🎬 {streamStats.fps} FPS</div>
              <div>📐 {streamStats.resolution}</div>
              <div>⏱️ {streamStats.latency}ms</div>
            </div>
          )}

          {/* Viewer count */}
          {viewers.length > 0 && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/70 rounded px-2 py-1 text-xs text-cyan-400">
              <Eye size={14} />
              {viewers.length} viewing
            </div>
          )}
        </div>

        {/* Annotation tools */}
        <div className="flex gap-2 flex-wrap">
          {['circle', 'arrow', 'rectangle', 'text'].map((tool) => (
            <Button
              key={tool}
              size="sm"
              variant={selectedTool === tool ? 'default' : 'outline'}
              onClick={() => setSelectedTool(tool)}
              className={selectedTool === tool ? 'bg-cyan-500' : ''}
            >
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </Button>
          ))}

          {/* Color picker */}
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-10 h-10 rounded border border-cyan-500/30 cursor-pointer"
          />
        </div>

        {/* Viewers list */}
        {viewers.length > 0 && (
          <div className="bg-black/50 rounded p-3 border border-cyan-500/20">
            <h4 className="text-sm text-cyan-400 font-semibold mb-2">Active Supervisors</h4>
            <div className="space-y-1">
              {viewers.map((viewer: any) => (
                <div key={viewer.supervisorId} className="text-xs text-gray-400">
                  {viewer.name} (joined {new Date(viewer.joinedAt).toLocaleTimeString()})
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
