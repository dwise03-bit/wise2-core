'use client';

import { useState, useRef } from 'react';

export interface ChatInputProps {
  // eslint-disable-next-line no-unused-vars
  onSendMessage: (message: string) => void;
  isDisabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

interface EmojiCategory {
  label: string;
  emojis: string[];
}

export function ChatInput({
  onSendMessage,
  isDisabled = false,
  placeholder = 'Say something...',
  maxLength = 500,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Common emojis grouped by category
  const emojiCategories: EmojiCategory[] = [
    {
      label: 'Smileys',
      emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '😘', '😗', '😚', '😙'],
    },
    {
      label: 'Thumbs',
      emojis: ['👍', '👎', '👌', '✌️', '🤘', '🤞', '🤟', '🤙', '👏', '👋', '🙌', '🙏'],
    },
    {
      label: 'Hand',
      emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎'],
    },
    {
      label: 'Hearts',
      emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💕', '💞', '💓', '💗', '💖', '💘'],
    },
    {
      label: 'Fire',
      emojis: ['🔥', '⚡', '✨', '💫', '⭐', '🌟', '💥', '🎆', '🎇'],
    },
  ];

  // Validation: check message length
  const isMessageValid = message.trim().length > 0 && message.length <= maxLength;
  const remainingChars = maxLength - message.length;

  const handleSend = () => {
    if (isMessageValid && !isDisabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMessage = e.target.value;
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900 p-3 space-y-2">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2"
        >
          {emojiCategories.map((category) => (
            <div key={category.label}>
              <div className="text-xs text-gray-400 font-semibold mb-1">{category.label}</div>
              <div className="flex flex-wrap gap-2">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-lg hover:bg-gray-700 rounded p-1 transition-colors"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          disabled={isDisabled}
          className="px-2 py-2 text-xl hover:bg-gray-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          title="Add emoji"
        >
          😊
        </button>

        {/* Message Input */}
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          maxLength={maxLength}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isDisabled || !isMessageValid}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white text-sm font-semibold rounded transition-colors disabled:cursor-not-allowed flex-shrink-0"
        >
          Send
        </button>
      </div>

      {/* Character Count */}
      {message.length > 0 && (
        <div className={`text-xs ${remainingChars < 50 ? 'text-red-400' : 'text-gray-500'}`}>
          {remainingChars} characters remaining
        </div>
      )}

      {/* Disabled State Message */}
      {isDisabled && (
        <div className="text-xs text-gray-500 text-center">
          Chat is currently disabled
        </div>
      )}
    </div>
  );
}
