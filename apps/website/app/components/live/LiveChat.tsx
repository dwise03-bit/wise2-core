'use client';

import { useRef, useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

export function LiveChat({
  roomId,
  messages,
  socket,
  isConnected,
}: {
  roomId: string;
  messages: any[];
  socket: Socket | null;
  isConnected: boolean;
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket || !isConnected) return;

    socket.emit('chat.message', { roomId, message: input });
    setInput('');
  };

  return (
    <div className="h-64 flex flex-col bg-black">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg: any) => (
          <div key={msg.id} className="text-sm">
            <span className="text-blue-400">{msg.userName}</span>
            <span className="text-gray-400 mx-1">:</span>
            <span className="text-gray-200">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="flex-1 bg-gray-900 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={!isConnected || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded px-4 py-2 text-sm font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
