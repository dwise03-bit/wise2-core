'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ChatMessage, ChatAlert, ChatConnectionStatus, ChatPlatform } from '../components/LiveStudio/types/chat';
import { generateMockMessage, generateMockAlert } from '../utils/chatUtils';
import { ChatConnectorBase } from '../services/ChatConnectorBase';
import { MockConnector } from '../services/MockConnector';
import { TwitchConnector } from '../services/TwitchConnector';
import { YouTubeConnector } from '../services/YouTubeConnector';
import { FacebookConnector } from '../services/FacebookConnector';

interface UseChatOverlayOptions {
  maxMessages?: number;
  autoConnect?: boolean;
  onMessageReceived?: (message: ChatMessage) => void;
  onAlertReceived?: (alert: ChatAlert) => void;
}

interface PlatformConfig {
  platform: ChatPlatform;
  channelId?: string;
  accessToken?: string;
  [key: string]: any;
}

export function useChatOverlay(
  platforms: ChatPlatform | ChatPlatform[] = ['mock'],
  configs?: Record<ChatPlatform, PlatformConfig>,
  options: UseChatOverlayOptions = {}
) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [alerts, setAlerts] = useState<ChatAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ChatConnectionStatus>('idle');
  const [activePlatforms, setActivePlatforms] = useState<ChatPlatform[]>(
    Array.isArray(platforms) ? platforms : [platforms]
  );

  const maxMessages = options.maxMessages || 500;
  const connectorsRef = useRef<Map<ChatPlatform, ChatConnectorBase>>(new Map());
  const unsubscribeRef = useRef<Map<ChatPlatform, (() => void)[]>>(new Map());

  /**
   * Create connector for a platform
   */
  const createConnector = useCallback((platform: ChatPlatform): ChatConnectorBase => {
    const config = configs?.[platform];

    switch (platform) {
      case 'twitch':
        if (!config?.accessToken || !config?.channelId) {
          throw new Error('Twitch requires accessToken and channelId');
        }
        return new TwitchConnector({
          channelId: config.channelId,
          channelName: config.channelName || '',
          accessToken: config.accessToken,
        });

      case 'youtube':
        if (!config?.accessToken || !config?.channelId) {
          throw new Error('YouTube requires accessToken and channelId');
        }
        return new YouTubeConnector({
          channelId: config.channelId,
          accessToken: config.accessToken,
          liveChatId: config.liveChatId,
        });

      case 'facebook':
        if (!config?.accessToken || !config?.pageId) {
          throw new Error('Facebook requires accessToken and pageId');
        }
        return new FacebookConnector({
          pageId: config.pageId,
          liveVideoId: config.liveVideoId || '',
          accessToken: config.accessToken,
        });

      case 'mock':
      default:
        return new MockConnector();
    }
  }, [configs]);

  /**
   * Add message to display (with history limit)
   */
  const addMessage = useCallback(
    (message: ChatMessage) => {
      options.onMessageReceived?.(message);

      setMessages((prev) => {
        const updated = [...prev, message];
        return updated.length > maxMessages ? updated.slice(-maxMessages) : updated;
      });
    },
    [maxMessages, options]
  );

  /**
   * Add alert (with auto-remove)
   */
  const addAlert = useCallback(
    (alert: ChatAlert) => {
      options.onAlertReceived?.(alert);

      setAlerts((prev) => [...prev, alert]);

      // Remove alert after duration
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
      }, alert.duration);
    },
    [options]
  );

  /**
   * Connect to specified platforms
   */
  const connect = useCallback(async () => {
    setConnectionStatus('connecting');

    try {
      const platformsToConnect: ChatPlatform[] =
        activePlatforms.length > 0 ? activePlatforms : ['mock'];

      for (const platform of platformsToConnect) {
        let connector = connectorsRef.current.get(platform);

        if (!connector) {
          connector = createConnector(platform);
          connectorsRef.current.set(platform, connector);
        }

        // Subscribe to events
        const unsubscribers: (() => void)[] = [];

        unsubscribers.push(
          connector.onMessage((message) => {
            addMessage(message);
          })
        );

        unsubscribers.push(
          connector.onAlert((alert) => {
            addAlert(alert);
          })
        );

        unsubscribeRef.current.set(platform, unsubscribers);

        // Connect
        await connector.connect();
      }

      setIsConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Chat connection error:', error);
      setConnectionStatus('error');
      setIsConnected(false);
    }
  }, [activePlatforms, createConnector, addMessage, addAlert]);

  /**
   * Disconnect from all platforms
   */
  const disconnect = useCallback(async () => {
    setConnectionStatus('disconnecting');

    // Unsubscribe from all events
    for (const [platform, unsubscribers] of unsubscribeRef.current) {
      unsubscribers.forEach((unsub) => unsub());
      unsubscribeRef.current.delete(platform);
    }

    // Disconnect all connectors
    for (const connector of connectorsRef.current.values()) {
      await connector.disconnect();
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    setMessages([]);
    setAlerts([]);
  }, []);

  /**
   * Send message to active platform
   */
  const sendMessage = useCallback(
    async (text: string, platform?: ChatPlatform) => {
      const targetPlatform = platform || activePlatforms[0];

      if (!targetPlatform) {
        throw new Error('No platform specified');
      }

      const connector = connectorsRef.current.get(targetPlatform);

      if (!connector) {
        throw new Error(`No connector for platform: ${targetPlatform}`);
      }

      await connector.sendMessage(text);
    },
    [activePlatforms]
  );

  /**
   * Clear all messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Play sound (placeholder)
   */
  const playSound = useCallback((type: 'message' | 'alert' | 'subscribe' | 'raid') => {
    // In production, would play actual sounds
    // Could use Web Audio API or HTML5 audio elements
    console.log(`Play sound: ${type}`);
  }, []);

  /**
   * Send mock message (for testing)
   */
  const sendMockMessage = useCallback(() => {
    addMessage(generateMockMessage());
    if (Math.random() > 0.5) {
      addAlert(generateMockAlert());
    }
  }, [addMessage, addAlert]);

  /**
   * Add a platform to active platforms
   */
  const addPlatform = useCallback((platform: ChatPlatform) => {
    setActivePlatforms((prev) => {
      if (!prev.includes(platform)) {
        return [...prev, platform];
      }
      return prev;
    });
  }, []);

  /**
   * Remove a platform from active platforms
   */
  const removePlatform = useCallback((platform: ChatPlatform) => {
    setActivePlatforms((prev) => prev.filter((p) => p !== platform));
  }, []);

  // Auto-disconnect on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
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
    addMessage,
    addAlert,
    addPlatform,
    removePlatform,
  };
}

export default useChatOverlay;
