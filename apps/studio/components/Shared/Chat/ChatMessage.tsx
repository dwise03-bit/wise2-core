'use client';

import type { ChatMessage as ChatMessageType } from '../../../types/streaming';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex gap-3 py-2 px-3 hover:bg-gray-800 transition-colors group">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
        {message.userName[0].toUpperCase()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-200">{message.userName}</span>

          {/* Badges */}
          {message.userBadges.length > 0 && (
            <div className="flex gap-1">
              {message.userBadges.includes('verified') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">
                  ✓ Verified
                </span>
              )}
              {message.userBadges.includes('subscriber') && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                  ⭐ Subscriber
                </span>
              )}
              {message.isModerator && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                  🛡️ Mod
                </span>
              )}
            </div>
          )}

          <span className="text-xs text-gray-500 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100">
            {formatTime(message.timestamp)}
          </span>
        </div>

        <p className="text-sm text-gray-300 break-words">{message.message}</p>
      </div>
    </div>
  );
}
