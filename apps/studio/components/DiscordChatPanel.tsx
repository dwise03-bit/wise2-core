'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDiscordChat } from '../hooks/useDiscordChat';

export function DiscordChatPanel() {
  const chat = useDiscordChat();
  const [messageInput, setMessageInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  const handleConnect = () => {
    if (!isConnected) {
      chat.connect();
      setIsConnected(true);
      chat.markAsRead();
    } else {
      chat.disconnect();
      setIsConnected(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      chat.sendMessage(messageInput);
      setMessageInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex flex-col h-full space-y-3"
    >
      {/* Header with Connection Status */}
      <motion.div
        className="bg-wise-surface rounded-lg p-4 border border-wise-medium flex items-center justify-between"
        whileHover={{ scale: 1.01 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-3 h-3 rounded-full ${
              chat.isConnected ? 'bg-green-500' : 'bg-gray-500'
            }`}
            animate={chat.isConnected ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div>
            <div className="font-semibold text-sm">Discord Chat</div>
            <div className="text-xs text-wise-text-muted">
              {chat.viewers.length} viewer{chat.viewers.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleConnect}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
            chat.isConnected
              ? 'bg-wise-accent-red/80 hover:bg-wise-accent-red text-white'
              : 'bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {chat.isConnected ? 'Disconnect' : 'Connect'}
        </motion.button>
      </motion.div>

      {/* Active Viewers */}
      {chat.viewers.length > 0 && (
        <motion.div
          className="bg-wise-surface-secondary rounded-lg p-3 border border-wise-medium"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-xs font-semibold text-wise-text-secondary mb-2">
            ACTIVE VIEWERS ({chat.viewers.length})
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {chat.viewers.map((viewer) => (
                <motion.div
                  key={viewer.id}
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    viewer.isStreamer
                      ? 'bg-wise-primary text-white'
                      : 'bg-wise-surface text-wise-text-secondary border border-wise-medium'
                  }`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {viewer.isStreamer && '⭐ '}
                  {viewer.username}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Messages Area */}
      <div className="flex-1 bg-wise-surface-secondary rounded-lg border border-wise-medium overflow-y-auto flex flex-col">
        {!chat.isConnected && (
          <motion.div
            className="flex-1 flex items-center justify-center text-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div>
              <div className="text-wise-text-muted mb-2">💬 Chat disconnected</div>
              <div className="text-xs text-wise-text-muted">
                Connect to see live chat messages
              </div>
            </div>
          </motion.div>
        )}

        {chat.isConnected && chat.messages.length === 0 && (
          <motion.div
            className="flex-1 flex items-center justify-center text-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-wise-text-muted">
              <div className="mb-2">Waiting for messages...</div>
              <div className="text-xs">Messages will appear here</div>
            </div>
          </motion.div>
        )}

        {/* Messages List */}
        <motion.div className="flex-1 overflow-y-auto p-3 space-y-2">
          <AnimatePresence mode="popLayout">
            {chat.messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.02 }}
                className={`${
                  msg.isSystem
                    ? 'bg-wise-surface/50 border-l-2 border-wise-primary/50'
                    : 'bg-wise-surface border-l-2 border-wise-primary'
                } rounded p-2`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          msg.author.isStreamer
                            ? 'text-wise-primary'
                            : 'text-wise-accent-green'
                        }`}
                      >
                        {msg.author.isStreamer && '⭐ '}
                        {msg.author.username}
                      </span>
                      <span className="text-xs text-wise-text-muted">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-sm text-wise-text-primary mt-1 break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </motion.div>
      </div>

      {/* Message Input */}
      {chat.isConnected && (
        <form onSubmit={handleSendMessage} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 px-3 py-2 bg-wise-surface border border-wise-medium rounded text-wise-text-primary placeholder-wise-text-muted text-sm focus:outline-none focus:border-wise-primary transition"
            />
            <motion.button
              type="submit"
              className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded font-semibold text-sm transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Send
            </motion.button>
          </div>
        </form>
      )}

      {/* Error Display */}
      <AnimatePresence>
        {chat.error && (
          <motion.div
            className="bg-wise-accent-red/20 border border-wise-accent-red rounded-lg p-3 text-wise-accent-red text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {chat.error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
