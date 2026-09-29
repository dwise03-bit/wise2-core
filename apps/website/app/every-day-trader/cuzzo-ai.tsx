'use client';

import { useState } from 'react';
import styles from './cuzzo-ai.module.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function CuzzoAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm Cuzzo, your AI trading copilot. I can help you analyze charts, discuss trading strategies, and answer market questions. What's on your mind?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's a great observation! Let me break down what's happening in the market...",
        "Based on the current trend, I'd recommend focusing on support levels. Here's my analysis...",
        "The momentum looks bullish. Volume is confirming the move upward...",
        "Perfect timing to discuss risk management. Here's what I'd suggest...",
        "I see you're looking at NVDA. The technical setup looks promising. Let me explain why...",
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: randomResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  if (!isOpen) {
    return (
      <button
        className={styles.cuzzoFloatingButton}
        onClick={() => setIsOpen(true)}
        title="Chat with Cuzzo AI"
      >
        🤖
        <div className={styles.cuzzoNotification}>1</div>
      </button>
    );
  }

  return (
    <div className={styles.cuzzoContainer}>
      <div className={styles.cuzzoHeader}>
        <div className={styles.cuzzoAvatar}>🤖</div>
        <div>
          <div className={styles.cuzzoTitle}>Cuzzo</div>
          <div className={styles.cuzzoSubtitle}>AI Trading Copilot</div>
        </div>
        <button
          className={styles.cuzzoClose}
          onClick={() => setIsOpen(false)}
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className={styles.cuzzoBody}>
        {messages.map((message) => (
          <div key={message.id} className={`${styles.cuzzoMessage} ${styles[message.sender]}`}>
            <div className={styles.cuzzoMessageBubble}>{message.text}</div>
          </div>
        ))}

        {isTyping && (
          <div className={styles.cuzzoMessage}>
            <div className={styles.cuzzoTyping}>
              <div className={styles.cuzzoTypingDot}></div>
              <div className={styles.cuzzoTypingDot}></div>
              <div className={styles.cuzzoTypingDot}></div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.cuzzoFooter}>
        <input
          type="text"
          className={styles.cuzzoInput}
          placeholder="Ask Cuzzo anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className={styles.cuzzoSendButton}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isTyping}
        >
          Send
        </button>
      </div>
    </div>
  );
}
