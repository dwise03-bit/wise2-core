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
    <div className="space-y-2 border-t border-white/10 bg-black/30 p-3">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="max-h-40 space-y-2 overflow-y-auto rounded-2xl border border-white/10 bg-black/70 p-3 backdrop-blur-2xl"
        >
          {emojiCategories.map((category) => (
            <div key={category.label}>
              <div className="text-xs text-gray-400 font-semibold mb-1">{category.label}</div>
              <div className="flex flex-wrap gap-2">
                {category.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="rounded p-1 text-lg transition-colors hover:bg-white/10"
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
          className="flex-shrink-0 rounded-xl px-2 py-2 text-xl transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
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
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 backdrop-blur focus:outline-none focus:border-cyan-400/50 disabled:cursor-not-allowed disabled:opacity-50"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isDisabled || !isMessageValid}
          className="flex-shrink-0 rounded-xl bg-[linear-gradient(135deg,#00d9ff,#005eff)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700"
        >
          Send
        </button>
      </div>

      {/* Character Count */}
      {message.length > 0 && (
        <div className={`text-xs ${remainingChars < 50 ? 'text-red-300' : 'text-slate-500'}`}>
          {remainingChars} characters remaining
        </div>
      )}

      {/* Disabled State Message */}
      {isDisabled && (
        <div className="text-center text-xs text-slate-500">
          Chat is currently disabled
        </div>
      )}
    </div>
  );
}
