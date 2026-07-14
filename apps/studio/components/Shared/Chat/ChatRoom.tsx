'use client';

import { ChatList } from './ChatList';
import { ChatInput } from './ChatInput';
import { useChat } from '../../../hooks/useChat';

export interface ChatRoomProps {
  /**
   * Room title (optional, for display)
   */
  title?: string;

  /**
   * Whether chat is enabled
   */
  isEnabled?: boolean;

  /**
   * Number of active users (optional, for display)
   */
  activeUsers?: number;
}

export function ChatRoom({ title = 'CHAT', isEnabled = true, activeUsers = 0 }: ChatRoomProps) {
  const { messages, addMessage } = useChat();

  const handleSendMessage = (messageText: string) => {
    addMessage({
      userId: 'current-user',
      userName: 'You',
      message: messageText,
      userBadges: ['verified'],
      isModerator: false,
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h3 className="text-sm font-bold text-gray-300">{title}</h3>
        {activeUsers > 0 && (
          <span className="text-xs text-gray-500">
            {activeUsers.toLocaleString()} {activeUsers === 1 ? 'viewer' : 'viewers'}
          </span>
        )}
      </div>

      {/* Chat Messages */}
      <ChatList messages={messages} />

      {/* Chat Input */}
      {isEnabled && <ChatInput onSendMessage={handleSendMessage} placeholder="Say something..." />}

      {!isEnabled && (
        <div className="p-4 text-center text-gray-500 text-sm border-t border-gray-700">
          Chat is currently disabled
        </div>
      )}
    </div>
  );
}
