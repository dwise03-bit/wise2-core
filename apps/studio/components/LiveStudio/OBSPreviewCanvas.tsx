'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export interface Source {
  id: string;
  name: string;
  type: 'screen' | 'camera' | 'browser' | 'audio' | 'text' | 'image';
  visible: boolean;
  zIndex: number;
  properties: Record<string, any>;
}

interface OBSPreviewCanvasProps {
  sources: Source[];
  resolution: string; // "1920x1080", "1280x720", etc.
  fps: number;
  isLive: boolean;
}

export function OBSPreviewCanvas({
  sources,
  resolution,
  fps,
  isLive,
}: OBSPreviewCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fpsCounterRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(Date.now());

  const [displayFps, setDisplayFps] = React.useState(fps);
  const [time, setTime] = React.useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Parse resolution
  const [width, height] = resolution.split('x').map(Number);
  const aspectRatio = width / height;

  // Calculate canvas size to fit container
  const canvasWidth = Math.min(800, window.innerWidth - 40);
  const canvasHeight = canvasWidth / aspectRatio;

  const getSourceStyle = (source: Source) => {
    const props = source.properties;
    let x = props.x || 0;
    let y = props.y || 0;
    let sourceWidth = props.width || '100%';
    let sourceHeight = props.height || '100%';

    // Convert percentage strings to pixels if needed
    if (typeof sourceWidth === 'string' && sourceWidth.includes('%')) {
      sourceWidth = (canvasWidth * parseInt(sourceWidth)) / 100;
    }
    if (typeof sourceHeight === 'string' && sourceHeight.includes('%')) {
      sourceHeight = (canvasHeight * parseInt(sourceHeight)) / 100;
    }

    return {
      position: 'absolute',
      left: x,
      top: y,
      width: sourceWidth,
      height: sourceHeight,
      transform: `scale(${props.scaleX || 1}, ${props.scaleY || 1}) rotate(${props.rotation || 0}deg)`,
      opacity: (props.opacity || 100) / 100,
      zIndex: source.zIndex,
    } as React.CSSProperties;
  };

  return (
    <div className="flex-1 flex flex-col bg-black rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-black to-gray-950">
        <div
          ref={canvasRef}
          className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
          style={{
            width: canvasWidth,
            height: canvasHeight,
            aspectRatio: `${width}/${height}`,
            border: isLive ? '2px solid #ef4444' : '1px solid #4b5563',
          }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
            <span className="text-gray-700 text-sm font-mono">Preview</span>
          </div>

          {/* Rendered Sources */}
          {sources
            .filter((s) => s.visible)
            .sort((a, b) => b.zIndex - a.zIndex)
            .map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: (source.properties.opacity || 100) / 100 }}
                className="absolute select-none pointer-events-none"
                style={getSourceStyle(source)}
              >
                {source.type === 'camera' && (
                  <div className="w-full h-full bg-blue-900/30 border border-blue-500/30 flex items-center justify-center rounded">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-blue-500/50 mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                      <p className="text-xs text-blue-400">{source.name}</p>
                    </div>
                  </div>
                )}

                {source.type === 'screen' && (
                  <div className="w-full h-full bg-green-900/30 border border-green-500/30 flex items-center justify-center rounded">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-green-500/50 mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" />
                      </svg>
                      <p className="text-xs text-green-400">{source.name}</p>
                    </div>
                  </div>
                )}

                {source.type === 'browser' && (
                  <div className="w-full h-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center rounded overflow-hidden">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-purple-500/50 mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 12H4V6h16v10z" />
                      </svg>
                      <p className="text-xs text-purple-400 truncate px-2">{source.name}</p>
                      {source.properties.url && (
                        <p className="text-xs text-purple-300/60 truncate px-2">
                          {source.properties.url}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {source.type === 'text' && (
                  <div className="w-full h-full flex items-center justify-center bg-transparent">
                    <div
                      className="text-center"
                      style={{
                        color: source.properties.color || '#ffffff',
                        fontSize: `${source.properties.fontSize || 24}px`,
                        fontFamily: source.properties.fontFamily || 'Arial',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      {source.properties.text || 'Sample Text'}
                    </div>
                  </div>
                )}

                {source.type === 'audio' && (
                  <div className="w-full h-full bg-orange-900/30 border border-orange-500/30 flex items-center justify-center rounded">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-orange-500/50 mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                      </svg>
                      <p className="text-xs text-orange-400">{source.name}</p>
                    </div>
                  </div>
                )}

                {source.type === 'image' && (
                  <div className="w-full h-full bg-pink-900/30 border border-pink-500/30 flex items-center justify-center rounded">
                    <div className="text-center">
                      <svg
                        className="w-12 h-12 mx-auto text-pink-500/50 mb-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                      </svg>
                      <p className="text-xs text-pink-400">{source.name}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

          {/* Overlay Info */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between">
            {/* Top-left: Resolution */}
            <div className="p-3">
              <div className="bg-black/60 backdrop-blur rounded px-2 py-1 inline-block">
                <div className="text-white font-mono text-xs font-bold">
                  {resolution}
                </div>
              </div>
            </div>

            {/* Bottom: FPS & Time */}
            <div className="p-3 flex items-center justify-between">
              <div className="bg-black/60 backdrop-blur rounded px-3 py-1.5 inline-block">
                <div className="text-green-400 font-mono text-xs font-bold">
                  {displayFps} FPS
                </div>
              </div>

              {isLive && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-red-600/90 backdrop-blur rounded px-3 py-1.5 inline-flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="text-white font-mono text-xs font-bold">LIVE</div>
                </motion.div>
              )}

              <div className="bg-black/60 backdrop-blur rounded px-3 py-1.5 inline-block">
                <div className="text-gray-400 font-mono text-xs">
                  {time.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* No Sources Message */}
          {sources.filter((s) => s.visible).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">No visible sources</p>
                <p className="text-gray-600 text-xs">Add sources and toggle visibility to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Bar */}
      <div className="bg-gray-900 border-t border-gray-800 px-4 py-2 text-xs text-gray-500 flex items-center justify-between">
        <div>
          {sources.length} sources •{' '}
          {sources.filter((s) => s.visible).length} visible
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>CPU: --</span>
          <span>GPU: --</span>
          <span>Memory: --</span>
        </div>
      </div>
    </div>
  );
}
