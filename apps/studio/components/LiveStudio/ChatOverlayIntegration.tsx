'use client';

import React, { useState, useEffect } from 'react';
import { ChatOverlay } from './ChatOverlay';
import { useChatOverlay } from '../../hooks/useChatOverlay';
import { ChatPlatform, ChatOverlayConfig, createDefaultChatConfig } from './types/chat';

interface ChatOverlayIntegrationProps {
  /**
   * Active streaming platforms
   */
  platforms?: ChatPlatform[];

  /**
   * Platform-specific configurations
   */
  platformConfigs?: Record<ChatPlatform, Record<string, any>>;

  /**
   * Initial overlay configuration
   */
  initialConfig?: Partial<ChatOverlayConfig>;

  /**
   * Callback when configuration changes
   */
  onConfigChange?: (config: ChatOverlayConfig) => void;

  /**
   * Enable live streaming
   */
  liveMode?: boolean;

  /**
   * Show in preview/configuration mode
   */
  previewMode?: boolean;
}

/**
 * Complete chat overlay integration for Live Studio
 * Supports multi-platform chat aggregation with unified UI
 */
export function ChatOverlayIntegration({
  platforms = ['mock'],
  platformConfigs = {} as any,
  initialConfig = {},
  onConfigChange,
  liveMode = true,
  previewMode = false,
}: ChatOverlayIntegrationProps) {
  const [config, setConfig] = useState<ChatOverlayConfig>(() => ({
    ...createDefaultChatConfig(),
    ...initialConfig,
  }));

  // Initialize chat hook with platforms
  const {
    messages,
    alerts,
    isConnected,
    connectionStatus,
    activePlatforms,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    playSound,
    sendMockMessage,
    addPlatform,
    removePlatform,
  } = useChatOverlay(platforms, platformConfigs as any, {
    maxMessages: config.messageLimit,
    autoConnect: liveMode && !previewMode,
  });

  // Handle configuration changes
  const handleConfigChange = (newConfig: ChatOverlayConfig) => {
    setConfig(newConfig);
    onConfigChange?.(newConfig);

    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'chatOverlayConfig',
        JSON.stringify(newConfig)
      );
    }
  };

  // Load persisted config on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('chatOverlayConfig');
        if (saved) {
          const parsed = JSON.parse(saved);
          setConfig((prev) => ({
            ...prev,
            ...parsed,
          }));
        }
      } catch (e) {
        console.warn('Failed to load chat config:', e);
      }
    }
  }, []);

  // Auto-connect when liveMode is enabled
  useEffect(() => {
    if (liveMode && !previewMode && !isConnected) {
      connect();
    }

    return () => {
      if (!liveMode) {
        disconnect();
      }
    };
  }, [liveMode, previewMode, isConnected, connect, disconnect]);

  // Render the overlay
  return (
    <ChatOverlay
      platform={platforms[0] || 'mock'}
      channelId={platformConfigs[platforms[0] || 'mock']?.channelId}
      onConfigChange={handleConfigChange}
      isPreview={previewMode}
      autoConnect={!previewMode}
    />
  );
}

export default ChatOverlayIntegration;

/**
 * Example usage within Live Studio
 */
export function LiveStudioWithChat() {
  const [activeTab, setActiveTab] = useState<'stream' | 'chat'>('stream');

  return (
    <div className="flex h-full gap-4">
      {/* Main stream preview */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 bg-black rounded-lg flex items-center justify-center">
          {/* Stream preview canvas goes here */}
          <div className="text-white text-center">
            <p>Stream Preview</p>
            <p className="text-sm text-slate-400 mt-2">1920x1080 @ 60fps</p>
          </div>
        </div>

        {/* Chat overlay (positioned over stream in production) */}
        <ChatOverlayIntegration
          platforms={['twitch', 'youtube', 'facebook'] as any}
          platformConfigs={{
            twitch: {
              channelId: process.env.NEXT_PUBLIC_TWITCH_CHANNEL_ID,
              channelName: process.env.NEXT_PUBLIC_TWITCH_CHANNEL_NAME,
              accessToken: process.env.NEXT_PUBLIC_TWITCH_TOKEN,
            },
            youtube: {
              channelId: process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID,
              accessToken: process.env.NEXT_PUBLIC_YOUTUBE_TOKEN,
            },
            facebook: {
              pageId: process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID,
              liveVideoId: process.env.NEXT_PUBLIC_FACEBOOK_VIDEO_ID,
              accessToken: process.env.NEXT_PUBLIC_FACEBOOK_TOKEN,
            },
          } as any}
          liveMode={activeTab === 'stream'}
          previewMode={activeTab === 'chat'}
        />
      </div>

      {/* Chat panel (optional, for viewing on separate screen) */}
      {activeTab === 'chat' && (
        <div className="w-96 flex flex-col bg-slate-900 rounded-lg border border-slate-700">
          <div className="px-4 py-3 border-b border-slate-700">
            <h3 className="font-bold text-white">Live Chat</h3>
            <p className="text-xs text-slate-400">Multi-platform aggregation</p>
          </div>
          {/* Chat messages would be displayed here */}
        </div>
      )}
    </div>
  );
}

/**
 * Minimal example
 */
export function MinimalChatOverlay() {
  return (
    <ChatOverlayIntegration
      platforms={['mock']}
      liveMode={true}
      previewMode={false}
    />
  );
}

/**
 * Configuration preview
 */
export function ChatConfigurationPreview() {
  return (
    <ChatOverlayIntegration
      platforms={['mock']}
      previewMode={true}
      liveMode={false}
    />
  );
}
