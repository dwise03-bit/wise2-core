'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Heart,
  Star,
  Crown,
  Send,
  X,
  Settings,
  AlertCircle,
  Users,
  TrendingUp,
} from 'lucide-react';

export type ChatPlatform = 'twitch' | 'youtube' | 'facebook' | 'custom';
export type AlertType = 'follow' | 'subscribe' | 'donate' | 'raid';
export type CornerPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  platform: ChatPlatform;
  isModerator?: boolean;
  isHost?: boolean;
  isSubscriber?: boolean;
  color?: string;
  avatarUrl?: string;
}

export interface ChatAlert {
  id: string;
  type: AlertType;
  username: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ChatOverlayConfig {
  platforms: ChatPlatform[];
  credentials: Record<ChatPlatform, { apiKey?: string; channelId?: string; [key: string]: any }>;
  position: CornerPosition;
  fontSize: number;
  backgroundOpacity: number;
  maxMessages: number;
  showAlerts: boolean;
  alertDuration: number; // in seconds
  enableEmojis: boolean;
  enableMentions: boolean;
  filterSpam: boolean;
}

interface OBSChatOverlayProps {
  config: ChatOverlayConfig;
  isVisible: boolean;
  onConfigChange: (config: ChatOverlayConfig) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onAlertTriggered?: (alert: ChatAlert) => void;
}

const POSITION_STYLES: Record<CornerPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
};

const POSITION_LABELS: Record<CornerPosition, string> = {
  'top-left': 'Top Left',
  'top-right': 'Top Right',
  'bottom-left': 'Bottom Left',
  'bottom-right': 'Bottom Right',
};

export function OBSChatOverlay({
  config,
  isVisible,
  onConfigChange,
  onMessageReceived,
  onAlertTriggered,
}: OBSChatOverlayProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<ChatAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to chat platforms
  useEffect(() => {
    if (!isVisible || !config.platforms.length) {
      setIsConnected(false);
      return;
    }

    const connectToChat = async () => {
      try {
        setConnectionError(null);

        // Connect to each platform
        for (const platform of config.platforms) {
          const credentials = config.credentials[platform];

          if (!credentials || !credentials.apiKey) {
            console.warn(`No credentials for ${platform}`);
            continue;
          }

          // Initialize platform-specific connection
          await initializePlatformConnection(platform, credentials);
        }

        setIsConnected(true);
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : 'Failed to connect to chat'
        );
        setIsConnected(false);
      }
    };

    connectToChat();

    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, [isVisible, config.platforms, config.credentials]);

  // Initialize platform-specific connection
  const initializePlatformConnection = async (
    platform: ChatPlatform,
    credentials: any
  ) => {
    switch (platform) {
      case 'twitch':
        return initializeTwitchChat(credentials);
      case 'youtube':
        return initializeYouTubeChat(credentials);
      case 'facebook':
        return initializeFacebookChat(credentials);
      case 'custom':
        return initializeCustomChat(credentials);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  };

  // Twitch Chat Integration
  const initializeTwitchChat = async (credentials: any) => {
    // In production, this would use Twitch TMI.js or API
    // For now, we'll set up a mock implementation
    console.log('Connecting to Twitch chat...', credentials);

    // Mock: Simulate receiving messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'StreamHost',
        message: 'Welcome to the stream!',
        timestamp: new Date(),
        platform: 'twitch',
        isHost: true,
        color: '#a970ff',
      },
      {
        id: '2',
        username: 'ModeratorUser',
        message: 'Thanks for being here everyone',
        timestamp: new Date(Date.now() - 5000),
        platform: 'twitch',
        isModerator: true,
        color: '#00ad33',
      },
    ];

    setMessages(mockMessages);
  };

  // YouTube Chat Integration
  const initializeYouTubeChat = async (credentials: any) => {
    console.log('Connecting to YouTube chat...', credentials);

    // In production, this would use YouTube Data API v3
    // For now, we'll set up a mock implementation
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'YouTubeUser',
        message: 'Great livestream!',
        timestamp: new Date(),
        platform: 'youtube',
        isSubscriber: true,
      },
    ];

    setMessages(mockMessages);
  };

  // Facebook Chat Integration
  const initializeFacebookChat = async (credentials: any) => {
    console.log('Connecting to Facebook chat...', credentials);

    // In production, this would use Facebook Graph API
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'FacebookUser',
        message: 'Love this content!',
        timestamp: new Date(),
        platform: 'facebook',
      },
    ];

    setMessages(mockMessages);
  };

  // Custom Chat Integration
  const initializeCustomChat = async (credentials: any) => {
    console.log('Connecting to custom chat...', credentials);

    // In production, this could connect to a WebSocket, IRC, or custom API
    if (credentials.webhookUrl) {
      // Set up webhook listener
      console.log('Webhook URL:', credentials.webhookUrl);
    }
  };

  // Add message to display
  const addMessage = useCallback(
    (message: ChatMessage) => {
      // Filter spam if enabled
      if (config.filterSpam && isSpam(message.message)) {
        return;
      }

      setMessages((prev) => {
        const updated = [message, ...prev];
        if (updated.length > config.maxMessages) {
          return updated.slice(0, config.maxMessages);
        }
        return updated;
      });

      onMessageReceived?.(message);
    },
    [config.maxMessages, config.filterSpam, onMessageReceived]
  );

  // Add alert
  const addAlert = useCallback(
    (alert: ChatAlert) => {
      setAlerts((prev) => [alert, ...prev]);
      onAlertTriggered?.(alert);

      // Auto-remove alert after duration
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      }, config.alertDuration * 1000);
    },
    [config.alertDuration, onAlertTriggered]
  );

  // Spam filter
  const isSpam = (message: string): boolean => {
    // Simple spam detection
    const spamPatterns = [
      /(?:bit\.ly|tinyurl|goo\.gl|youtu\.be)/gi, // URL shorteners
      /(?:follow|sub|subscribe|like|rate).*(?:link|channel)/gi,
      /(?:click here|join us|sign up).*(?:link|url)/gi,
    ];

    return spamPatterns.some((pattern) => pattern.test(message));
  };

  // Format message with emoji and mention support
  const formatMessage = (text: string): React.ReactNode => {
    if (!config.enableEmojis && !config.enableMentions) {
      return text;
    }

    let formatted = text;

    // Add mention highlighting
    if (config.enableMentions) {
      formatted = formatted.replace(
        /@(\w+)/g,
        '<span class="text-blue-400">@$1</span>'
      );
    }

    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const positionClass = isVisible ? POSITION_STYLES[config.position] : '';

  return (
    <>
      {/* Chat Overlay Display */}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed ${positionClass} z-40 w-80 max-h-96 flex flex-col pointer-events-none`}
        >
          {/* Chat Container */}
          <div
            className="flex flex-col h-full rounded-lg border border-gray-700 shadow-2xl overflow-hidden"
            style={{
              backgroundColor: `rgba(0, 0, 0, ${config.backgroundOpacity / 100})`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-gray-700 bg-gray-900/50 px-3 py-2 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <MessageCircle size={16} className="text-blue-400" />
                <span className="text-xs font-bold text-white">LIVE CHAT</span>
                {isConnected ? (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                ) : (
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </div>
              <motion.button
                onClick={() => setShowSettings(!showSettings)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1 hover:bg-gray-800 rounded transition"
              >
                <Settings size={14} className="text-gray-400" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 px-3 py-2">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 text-xs text-center">
                  <span>Waiting for chat messages...</span>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs"
                  >
                    <div className="flex gap-2">
                      {/* Avatar */}
                      {msg.avatarUrl ? (
                        <img
                          src={msg.avatarUrl}
                          alt={msg.username}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {msg.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span
                            className="font-bold text-white"
                            style={{ color: msg.color || 'white' }}
                          >
                            {msg.username}
                          </span>

                          {/* Badges */}
                          {msg.isHost && (
                            <Crown size={12} className="text-red-500 flex-shrink-0" />
                          )}
                          {msg.isModerator && (
                            <span className="text-xs bg-green-600 text-white px-1.5 rounded flex-shrink-0">
                              MOD
                            </span>
                          )}
                          {msg.isSubscriber && (
                            <Star size={12} className="text-yellow-500 flex-shrink-0" />
                          )}

                          {/* Timestamp */}
                          <span className="text-gray-500 ml-auto text-xs flex-shrink-0">
                            {msg.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-gray-300 break-words">
                          {formatMessage(msg.message)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Connection Status */}
            {connectionError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-t border-gray-700 bg-red-900/20 px-3 py-2 flex items-center gap-2 text-xs text-red-300"
              >
                <AlertCircle size={14} />
                <span>{connectionError}</span>
              </motion.div>
            )}
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 p-3 rounded-lg border border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg text-white text-xs font-bold"
              >
                <div className="flex items-center gap-2 mb-1">
                  {alert.type === 'follow' && (
                    <Heart size={14} className="text-pink-300" />
                  )}
                  {alert.type === 'subscribe' && (
                    <Star size={14} className="text-yellow-300" />
                  )}
                  {alert.type === 'raid' && (
                    <TrendingUp size={14} className="text-orange-300" />
                  )}
                  <span className="uppercase">{alert.type}</span>
                </div>
                <div className="text-sm">
                  {alert.username} {alert.message}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center pointer-events-auto"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings size={20} className="text-blue-400" />
                  Chat Settings
                </h3>
                <motion.button
                  onClick={() => setShowSettings(false)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 hover:bg-gray-800 rounded transition"
                >
                  <X size={18} className="text-gray-400" />
                </motion.button>
              </div>

              <div className="space-y-4">
                {/* Position */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    POSITION
                  </label>
                  <select
                    value={config.position}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        position: e.target.value as CornerPosition,
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  >
                    {(Object.keys(POSITION_LABELS) as CornerPosition[]).map(
                      (pos) => (
                        <option key={pos} value={pos}>
                          {POSITION_LABELS[pos]}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    FONT SIZE: {config.fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="18"
                    value={config.fontSize}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        fontSize: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Background Opacity */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    BACKGROUND OPACITY: {config.backgroundOpacity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.backgroundOpacity}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        backgroundOpacity: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>

                {/* Max Messages */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    MAX MESSAGES
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={config.maxMessages}
                    onChange={(e) =>
                      onConfigChange({
                        ...config,
                        maxMessages: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:border-blue-500 focus:outline-none transition"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.showAlerts}
                      onChange={(e) =>
                        onConfigChange({
                          ...config,
                          showAlerts: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Show Alerts
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableEmojis}
                      onChange={(e) =>
                        onConfigChange({
                          ...config,
                          enableEmojis: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Enable Emojis
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.enableMentions}
                      onChange={(e) =>
                        onConfigChange({
                          ...config,
                          enableMentions: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Highlight Mentions
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.filterSpam}
                      onChange={(e) =>
                        onConfigChange({
                          ...config,
                          filterSpam: e.target.checked,
                        })
                      }
                      className="rounded"
                    />
                    Filter Spam
                  </label>
                </div>

                {/* Platforms */}
                <div>
                  <label className="text-xs font-bold text-gray-300 block mb-2">
                    PLATFORMS
                  </label>
                  <div className="space-y-2">
                    {(['twitch', 'youtube', 'facebook', 'custom'] as const).map(
                      (platform) => (
                        <label
                          key={platform}
                          className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={config.platforms.includes(platform)}
                            onChange={(e) => {
                              const newPlatforms = e.target.checked
                                ? [...config.platforms, platform]
                                : config.platforms.filter((p) => p !== platform);
                              onConfigChange({
                                ...config,
                                platforms: newPlatforms,
                              });
                            }}
                            className="rounded"
                          />
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </label>
                      )
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
