'use client';

import type { ChatMessage as ChatMessageType } from '../../../types/streaming';

export interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Generate avatar with consistent color based on username
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-red-500 to-red-600',
      'from-orange-500 to-orange-600',
      'from-yellow-500 to-yellow-600',
      'from-green-500 to-green-600',
      'from-teal-500 to-teal-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex gap-3 py-2 px-3 hover:bg-gray-800/50 transition-colors group">
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(message.userName)} flex-shrink-0 flex items-center justify-center text-xs font-bold text-white shadow-sm`}>
        {message.userName[0].toUpperCase()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-gray-200">{message.userName}</span>

          {/* Badges */}
          {message.isModerator && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded font-medium">
              🛡️ Mod
            </span>
          )}
          {message.userBadges.includes('verified') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded font-medium">
              ✓ Verified
            </span>
          )}
          {message.userBadges.includes('subscriber') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">
              ⭐ Subscriber
            </span>
          )}
          {message.userBadges.includes('vip') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded font-medium">
              👑 VIP
            </span>
          )}

          <span className="text-xs text-gray-500 ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Text with emoji and formatting support */}
        <p className="text-sm text-gray-300 break-words whitespace-pre-wrap">{message.message}</p>
      </div>
    </div>
  );
}
