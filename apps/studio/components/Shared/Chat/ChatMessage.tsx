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
    <div className="group flex gap-3 border-b border-white/5 px-3 py-3 transition-colors hover:bg-white/[0.03]">
      {/* Avatar */}
      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarColor(message.userName)} text-xs font-bold text-white shadow-[0_0_18px_rgba(0,153,255,0.18)]`}>
        {message.userName[0].toUpperCase()}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-white">{message.userName}</span>

          {/* Badges */}
          {message.isModerator && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-300">
              🛡️ Mod
            </span>
          )}
          {message.userBadges.includes('verified') && (
            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-300">
              ✓ Verified
            </span>
          )}
          {message.userBadges.includes('subscriber') && (
            <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
              ⭐ Subscriber
            </span>
          )}
          {message.userBadges.includes('vip') && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
              👑 VIP
            </span>
          )}

          <span className="ml-auto flex-shrink-0 text-xs text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Message Text with emoji and formatting support */}
        <p className="whitespace-pre-wrap break-words text-sm text-slate-300">{message.message}</p>
      </div>
    </div>
  );
}
