'use client';

import React, { useState, useEffect } from 'react';

export default function TrackerProPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [driverLocation, setDriverLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'driver' | 'customer'; text: string; time: string }>>([
    { role: 'driver', text: 'Your order is being prepared!', time: '2:34 PM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      if (elapsedTime > 0 && elapsedTime % 8 === 0 && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
        // Simulate driver movement on delivery
        if (currentStep >= 4) {
          setDriverLocation(prev => ({
            lat: prev.lat - Math.random() * 0.002,
            lng: prev.lng + Math.random() * 0.002,
          }));
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [elapsedTime, currentStep]);

  const steps = [
    { label: 'Order Confirmed', icon: '✓', duration: 1, color: '#00FF88' },
    { label: 'Preparing', icon: '👨‍🍳', duration: 8, color: '#00D9FF' },
    { label: 'In the Oven', icon: '🔥', duration: 12, color: '#FFD700' },
    { label: 'Quality Check', icon: '✅', duration: 3, color: '#FF006E' },
    { label: 'Out for Delivery', icon: '🚗', duration: 15, color: '#00D9FF' },
    { label: 'Delivered', icon: '🏠', duration: 0, color: '#00FF88' },
  ];

  const orderItems = [
    { name: 'Large Pepperoni Pizza', qty: 2, price: 23.99 },
    { name: 'Garlic Bread', qty: 1, price: 4.99 },
    { name: 'Coca Cola 2L', qty: 1, price: 2.99 },
  ];

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { role: 'customer', text: newMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0E27' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --primary: #00D9FF;
          --secondary: #FFD700;
          --danger: #FF006E;
          --success: #00FF88;
          --text: #E8F0FF;
          --muted: #6B7C99;
          --surface: #0A0E27;
        }

        body { margin: 0; padding: 0; }

        .font-display {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .font-body {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          line-height: 1.6;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0, 217, 255, 0.4); }
          50% { box-shadow: 0 0 60px rgba(0, 217, 255, 0.7); }
        }

        @keyframes float-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes driver-move {
          0%, 100% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(4px) translateY(-2px); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .container {
          display: grid;
          grid-template-columns: 1fr 350px;
          height: 100vh;
          gap: 0;
        }

        @media (max-width: 1200px) {
          .container {
            grid-template-columns: 1fr;
          }
          .chat-panel {
            display: none !important;
          }
        }

        .main-content {
          overflow-y: auto;
          padding: 40px;
          border-right: 1px solid rgba(0, 217, 255, 0.1);
        }

        .map-section {
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 20px;
          height: 300px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .map-grid {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image:
            linear-gradient(0deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(0, 217, 255, 0.05) 25%, rgba(0, 217, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 217, 255, 0.05) 75%, rgba(0, 217, 255, 0.05) 76%, transparent 77%, transparent);
          background-size: 50px 50px;
        }

        .driver-icon {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary) 0%, #00A8CC 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 30px rgba(0, 217, 255, 0.6);
          animation: driver-move 3s ease-in-out infinite;
          z-index: 10;
        }

        .destination-marker {
          position: absolute;
          width: 30px;
          height: 30px;
          background: var(--danger);
          border-radius: 50% 50% 0 0;
          bottom: 40px;
          right: 60px;
          transform: rotate(-45deg);
          box-shadow: 0 0 20px rgba(255, 0, 110, 0.6);
        }

        .pickup-marker {
          position: absolute;
          width: 30px;
          height: 30px;
          background: var(--success);
          border-radius: 50%;
          bottom: 80px;
          left: 60px;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.6);
        }

        .tracking-header {
          margin-bottom: 30px;
        }

        .order-title {
          font-size: 32px;
          color: var(--text);
          margin-bottom: 10px;
          font-weight: 700;
        }

        .eta-large {
          font-size: 18px;
          color: var(--primary);
          font-weight: 600;
        }

        .progress-section {
          margin-bottom: 50px;
        }

        .progress-bar {
          height: 6px;
          background: rgba(107, 124, 153, 0.2);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 40px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 50%, var(--danger) 100%);
          border-radius: 3px;
          transition: width 0.3s ease;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.8);
        }

        .steps-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
        }

        @media (max-width: 768px) {
          .steps-row { grid-template-columns: repeat(3, 1fr); }
        }

        .step {
          text-align: center;
        }

        .step-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid rgba(0, 217, 255, 0.3);
          background: rgba(0, 217, 255, 0.05);
          transition: all 0.3s ease;
        }

        .step.active .step-icon {
          border-color: var(--primary);
          background: rgba(0, 217, 255, 0.2);
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .step.completed .step-icon {
          background: rgba(0, 255, 136, 0.2);
          border-color: var(--success);
          color: var(--success);
        }

        .step-label {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
        }

        .step.active .step-label { color: var(--primary); }
        .step.completed .step-label { color: var(--success); }

        .details-3col {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 40px;
        }

        .detail-item {
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          text-align: center;
        }

        .detail-label {
          font-size: 11px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .detail-value {
          font-size: 22px;
          color: var(--primary);
          font-weight: 700;
          font-family: 'Syne', sans-serif;
        }

        .order-section {
          margin-top: 50px;
          padding-top: 40px;
          border-top: 1px solid rgba(0, 217, 255, 0.1);
        }

        .section-title {
          font-size: 18px;
          color: var(--text);
          margin-bottom: 20px;
          font-weight: 700;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(0, 217, 255, 0.05);
          font-size: 14px;
        }

        .order-item-name {
          color: var(--text);
        }

        .order-item-price {
          color: var(--primary);
          font-weight: 600;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          padding: 20px 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--secondary);
        }

        .chat-panel {
          background: linear-gradient(180deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
          border-left: 1px solid rgba(0, 217, 255, 0.2);
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: relative;
        }

        .chat-header {
          padding: 20px;
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
          color: var(--text);
          font-weight: 700;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .driver-info {
          padding: 16px;
          background: rgba(0, 217, 255, 0.08);
          border-bottom: 1px solid rgba(0, 217, 255, 0.1);
          text-align: center;
        }

        .driver-name {
          color: var(--text);
          font-weight: 600;
          font-size: 13px;
        }

        .driver-status {
          color: var(--success);
          font-size: 11px;
          margin-top: 4px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          padding: 12px;
          border-radius: 8px;
          max-width: 90%;
          font-size: 13px;
          animation: float-up 0.3s ease-out;
        }

        .message.driver {
          background: rgba(0, 217, 255, 0.15);
          color: var(--primary);
          align-self: flex-start;
          border-left: 2px solid var(--primary);
        }

        .message.customer {
          background: rgba(255, 0, 110, 0.15);
          color: var(--text);
          align-self: flex-end;
          border-right: 2px solid var(--danger);
        }

        .message-time {
          font-size: 10px;
          color: var(--muted);
          margin-top: 4px;
        }

        .chat-input {
          padding: 12px;
          border-top: 1px solid rgba(0, 217, 255, 0.1);
          display: flex;
          gap: 8px;
        }

        .chat-input input {
          flex: 1;
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--text);
          font-size: 13px;
          font-family: 'Inter', sans-serif;
        }

        .chat-input input::placeholder {
          color: var(--muted);
        }

        .chat-input button {
          background: var(--primary);
          color: var(--surface);
          border: none;
          border-radius: 6px;
          padding: 8px 16px;
          cursor: pointer;
          font-weight: 600;
          font-size: 12px;
          transition: all 0.3s ease;
        }

        .chat-input button:hover {
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
        }

        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 255, 136, 0.2);
          border: 1px solid rgba(0, 255, 136, 0.5);
          border-radius: 12px;
          padding: 16px 20px;
          color: var(--success);
          font-weight: 600;
          z-index: 100;
          animation: float-up 0.5s ease-out;
        }
      `}</style>

      <div className="container">
        {/* Main Content */}
        <div className="main-content">
          {/* Live Map */}
          <div className="map-section">
            <div className="map-grid"></div>
            <div className="pickup-marker"></div>
            <div className="driver-icon">🚗</div>
            <div className="destination-marker"></div>
          </div>

          {/* Header */}
          <div className="tracking-header">
            <div className="order-title font-display">Your Order is on the Way</div>
            <div className="eta-large">Arriving in {formatTime(Math.max(0, totalDuration - elapsedTime))}</div>
          </div>

          {/* Progress */}
          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="steps-row">
              {steps.map((step, idx) => (
                <div key={idx} className={`step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}>
                  <div className="step-icon">
                    {idx < currentStep ? '✓' : step.icon}
                  </div>
                  <div className="step-label">{step.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="details-3col">
            <div className="detail-item">
              <div className="detail-label">Step</div>
              <div className="detail-value">{currentStep + 1}/6</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Progress</div>
              <div className="detail-value">{Math.round(progressPercent)}%</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Elapsed</div>
              <div className="detail-value">{formatTime(elapsedTime)}</div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-section">
            <div className="section-title">Order Details</div>
            {orderItems.map((item, idx) => (
              <div key={idx} className="order-item">
                <div>
                  <span className="order-item-name">{item.qty}x {item.name}</span>
                </div>
                <span className="order-item-price">${item.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="order-total">
              <span>Total</span>
              <span>${orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
            </div>
          </div>

          {currentStep === steps.length - 1 && (
            <div className="notification">✓ Your order has been delivered!</div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="chat-panel">
          <div className="chat-header">Driver Chat</div>
          <div className="driver-info">
            <div className="driver-name">Marcus • 4.98 ⭐</div>
            <div className="driver-status">● Currently Delivering</div>
          </div>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div>{msg.text}</div>
                <div className="message-time">{msg.time}</div>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Message driver..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
