'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Volume2, VolumeX, Settings, X, Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatAlert, ChatOverlayConfig, ChatConnectionStatus } from './types/chat';
import { ChatMessageComponent } from './ChatMessage';
import { ChatAlertComponent } from './ChatAlert';
import { ChatSettingsPanel } from './ChatSettingsPanel';
import { useChatOverlay } from '../../hooks/useChatOverlay';

interface ChatOverlayProps {
  /**
   * Platform: twitch, youtube, facebook
   */
  platform?: 'twitch' | 'youtube' | 'facebook' | 'mock';

  /**
   * Channel/Stream ID for connection
   */
  channelId?: string;

  /**
   * Callback when overlay settings change
   */
  onConfigChange?: (config: ChatOverlayConfig) => void;

  /**
   * Is this a preview/configuration view?
   */
  isPreview?: boolean;

  /**
   * Auto-connect on mount
   */
  autoConnect?: boolean;
}

export function ChatOverlay({
  platform = 'mock',
  channelId,
  onConfigChange,
  isPreview = false,
  autoConnect = true,
}: ChatOverlayProps) {
  const [config, setConfig] = useState<ChatOverlayConfig>({
    position: 'bottom-right',
    width: 350,
    height: 400,
    opacity: 0.9,
    fontSize: 14,
    showUsernames: true,
    showTimestamps: true,
    showEmotes: true,
    messageLimit: 50,
    autoScroll: true,
    soundEnabled: false,
    alertAnimations: true,
  });

  const [showSettings, setShowSettings] = useState(isPreview);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    alerts,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    sendMockMessage,
    playSound,
  } = useChatOverlay(platform, channelId);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && !isConnected && platform !== 'mock') {
      connect();
    }
  }, [autoConnect, isConnected, platform, connect]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (config.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, config.autoScroll]);

  // Limit messages to configured count
  const displayMessages = messages.slice(-config.messageLimit);

  const handleConfigChange = useCallback((newConfig: ChatOverlayConfig) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [onConfigChange]);

  const handlePlaySound = (soundType: 'message' | 'alert' | 'subscribe' | 'raid') => {
    if (config.soundEnabled) {
      playSound(soundType);
    }
  };

  const getPositionClasses = (position: string): string => {
    const baseClasses = 'fixed pointer-events-auto z-40';

    switch (position) {
      case 'top-left':
        return `${baseClasses} top-4 left-4`;
      case 'top-right':
        return `${baseClasses} top-4 right-4`;
      case 'bottom-left':
        return `${baseClasses} bottom-4 left-4`;
      case 'bottom-right':
        return `${baseClasses} bottom-4 right-4`;
      default:
        return `${baseClasses} bottom-4 right-4`;
    }
  };

  const containerStyle = {
    width: `${config.width}px`,
    height: `${config.height}px`,
    opacity: config.opacity,
    fontSize: `${config.fontSize}px`,
  };

  // Render preview grid when in preview mode
  if (isPreview) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Chat Overlay Preview</h3>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-slate-700 rounded transition-colors"
            title={showSettings ? 'Hide settings' : 'Show settings'}
          >
            {showSettings ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>

        {showSettings ? (
          <ChatSettingsPanel
            config={config}
            onConfigChange={handleConfigChange}
            isConnected={isConnected}
            connectionStatus={connectionStatus}
            onConnect={connect}
            onDisconnect={disconnect}
            onSendTestMessage={sendMockMessage}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Position preview grid */}
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
              <div
                key={pos}
                className={`relative w-full h-48 bg-slate-700 rounded border-2 cursor-pointer transition-all ${
                  config.position === pos ? 'border-blue-400 bg-slate-600' : 'border-slate-600 hover:border-slate-500'
                }`}
                onClick={() => handleConfigChange({ ...config, position: pos })}
              >
                <div className="absolute inset-2 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-400 overflow-hidden">
                  <div
                    className="bg-slate-900 rounded border border-slate-500 overflow-hidden shadow-lg"
                    style={{
                      width: '120px',
                      height: '140px',
                      [pos.includes('top') ? 'top' : 'bottom']: '4px',
                      [pos.includes('left') ? 'left' : 'right']: '4px',
                      position: 'absolute',
                    }}
                  >
                    <div className="h-full flex flex-col">
                      <div className="bg-slate-700 px-2 py-1 text-xs font-bold text-slate-300 border-b border-slate-600">
                        Chat
                      </div>
                      <div className="flex-1 overflow-hidden p-1 space-y-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="text-xs text-slate-400 leading-tight line-clamp-1"
                          >
                            User: message text...
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 left-2 text-xs font-mono text-slate-500">
                  {pos}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render live overlay
  return (
    <>
      {/* Main chat overlay */}
      <motion.div
        className={`${getPositionClasses(config.position)} bg-black/50 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden flex flex-col shadow-2xl`}
        style={containerStyle}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: config.opacity, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        {/* Header */}
        <div className="px-3 py-2 bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Chat</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-1">
            {config.soundEnabled ? (
              <Volume2 className="w-3 h-3 text-slate-400" />
            ) : (
              <VolumeX className="w-3 h-3 text-slate-400" />
            )}
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          <AnimatePresence mode="popLayout">
            {displayMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs text-center p-2">
                {isConnected ? 'Waiting for messages...' : 'Not connected'}
              </div>
            ) : (
              <div className="space-y-1 p-2">
                {displayMessages.map((msg) => (
                  <ChatMessageComponent
                    key={msg.id}
                    message={msg}
                    config={config}
                    isHighlighted={msg.id === highlightedMessageId}
                    onHover={() => setHighlightedMessageId(msg.id)}
                    onHoverEnd={() => setHighlightedMessageId(null)}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Alert display */}
      <div className="fixed top-0 left-0 right-0 pointer-events-none z-50 flex items-start justify-center pt-4">
        <AnimatePresence>
          {alerts.map((alert) => (
            <ChatAlertComponent
              key={alert.id}
              alert={alert}
              onSoundPlay={() => handlePlaySound(alert.type as any)}
              isAnimated={config.alertAnimations}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Settings button (always visible) */}
      <motion.button
        className="fixed bottom-4 right-4 z-30 p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all duration-200 text-white pointer-events-auto"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowSettings(true)}
        title="Chat overlay settings"
      >
        <Settings className="w-5 h-5" />
      </motion.button>

      {/* Settings panel modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />

            {/* Panel */}
            <motion.div
              className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl max-w-2xl w-full mx-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <ChatSettingsPanel
                config={config}
                onConfigChange={handleConfigChange}
                isConnected={isConnected}
                connectionStatus={connectionStatus}
                onConnect={connect}
                onDisconnect={disconnect}
                onSendTestMessage={sendMockMessage}
                onClose={() => setShowSettings(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatOverlay;
