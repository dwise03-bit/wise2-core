'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Star } from 'lucide-react';
import { ChatMessage as ChatMessageType, ChatOverlayConfig } from './types/chat';
import { formatRelativeTime, parseMessageWithEmotes } from '../../utils/chatUtils';

interface ChatMessageProps {
  message: ChatMessageType;
  config: ChatOverlayConfig;
  isHighlighted?: boolean;
  onHover?: () => void;
  onHoverEnd?: () => void;
}

export function ChatMessageComponent({
  message,
  config,
  isHighlighted = false,
  onHover,
  onHoverEnd,
}: ChatMessageProps) {
  const [imageError, setImageError] = useState(false);

  // User color based on type
  const getUserColor = (userType: string, customColor?: string): string => {
    if (customColor) return customColor;

    switch (userType) {
      case 'broadcaster':
        return '#FF0000';
      case 'moderator':
        return '#00DD00';
      case 'subscriber':
        return '#8840E0';
      case 'vip':
        return '#FFD700';
      default:
        return '#FFFFFF';
    }
  };

  const userColor = getUserColor(message.userType, message.color);

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'moderator':
        return <Shield className="w-3 h-3" />;
      case 'subscriber':
        return <Star className="w-3 h-3" />;
      case 'vip':
        return <Crown className="w-3 h-3" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`px-2 py-1.5 rounded transition-colors group ${
        isHighlighted
          ? 'bg-white/10'
          : 'hover:bg-white/5'
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >
      {/* Message header with username and badges */}
      <div className="flex items-center gap-1 mb-0.5">
        {/* Avatar */}
        {config.showUsernames && message.userAvatar && !imageError && (
          <img
            src={message.userAvatar}
            alt={message.userName}
            className="w-5 h-5 rounded-full flex-shrink-0"
            onError={() => setImageError(true)}
          />
        )}

        {/* Username */}
        <span
          className="font-bold text-xs leading-none truncate"
          style={{ color: userColor }}
        >
          {message.userName}
        </span>

        {/* Badges */}
        {config.showUsernames && message.badges.length > 0 && (
          <div className="flex gap-0.5">
            {message.badges.map((badge) => (
              <div
                key={badge.type}
                className="flex items-center justify-center bg-white/10 rounded px-1 py-0.5 text-xs"
                title={badge.label}
              >
                {getBadgeIcon(badge.type)}
              </div>
            ))}
          </div>
        )}

        {/* Timestamp */}
        {config.showTimestamps && (
          <span className="text-xs text-slate-500 leading-none">
            {formatRelativeTime(message.timestamp)}
          </span>
        )}
      </div>

      {/* Message text with emotes */}
      <div className="text-xs text-slate-100 leading-snug break-words">
        {config.showEmotes && message.emotes.length > 0 ? (
          parseMessageWithEmotes(message.message, message.emotes, {
            renderEmote: (emote) => (
              <img
                key={emote.id}
                src={emote.url}
                alt={emote.name}
                className="inline-block h-5 align-middle mx-0.5"
                title={emote.name}
              />
            ),
          })
        ) : (
          message.message
        )}
      </div>

      {/* Reply indicator */}
      {message.isReply && message.replyTo && (
        <div className="text-xs text-slate-400 mt-0.5 pl-2 border-l border-slate-600">
          Replying to thread
        </div>
      )}
    </motion.div>
  );
}

export default ChatMessageComponent;
