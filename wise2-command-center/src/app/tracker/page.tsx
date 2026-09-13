'use client';

import React, { useState, useEffect } from 'react';
import AppNav from '../../components/AppNav';

export default function TrackerPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      // Auto-advance steps every 8 seconds
      if (elapsedTime > 0 && elapsedTime % 8 === 0 && currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [elapsedTime, currentStep]);

  const steps = [
    { label: 'Order Confirmed', icon: '✓', duration: 1 },
    { label: 'Preparing', icon: '👨‍🍳', duration: 8 },
    { label: 'In the Oven', icon: '🔥', duration: 12 },
    { label: 'Quality Check', icon: '✅', duration: 3 },
    { label: 'Out for Delivery', icon: '🚗', duration: 15 },
    { label: 'Delivered', icon: '🏠', duration: 0 },
  ];

  const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = (currentStep / (steps.length - 1)) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <AppNav />
      <div className="min-h-screen p-8" style={{ backgroundColor: '#0A0E27', marginLeft: '200px' }}>
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
          --dark-surface: #050709;
        }

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
          0%, 100% { box-shadow: 0 0 20px rgba(0, 217, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 217, 255, 0.6); }
        }

        @keyframes slide-in {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .step-active {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        .tracker-container {
          max-width: 900px;
          margin: 0 auto;
          background: linear-gradient(135deg, rgba(0, 217, 255, 0.05) 0%, rgba(255, 215, 0, 0.02) 100%);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 20px;
          padding: 40px;
          backdrop-filter: blur(10px);
        }

        .order-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .order-id {
          font-size: 14px;
          color: var(--muted);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .order-title {
          font-size: 40px;
          color: var(--text);
          margin-bottom: 20px;
          font-weight: 700;
        }

        .eta {
          font-size: 20px;
          color: var(--primary);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
        }

        .progress-section {
          margin-bottom: 50px;
        }

        .progress-bar-bg {
          height: 4px;
          background: rgba(107, 124, 153, 0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 30px;
          position: relative;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.6);
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 12px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .steps-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .step {
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .step-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: 2px solid rgba(0, 217, 255, 0.3);
          transition: all 0.3s ease;
          background: rgba(0, 217, 255, 0.05);
        }

        .step.completed .step-icon {
          background: rgba(0, 255, 136, 0.15);
          border-color: var(--success);
          color: var(--success);
        }

        .step.active .step-icon {
          background: rgba(0, 217, 255, 0.2);
          border-color: var(--primary);
          box-shadow: 0 0 20px rgba(0, 217, 255, 0.5);
        }

        .step-label {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: 'Inter', sans-serif;
        }

        .step.completed .step-label {
          color: var(--success);
        }

        .step.active .step-label {
          color: var(--primary);
          font-size: 13px;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 40px;
          padding-top: 40px;
          border-top: 1px solid rgba(0, 217, 255, 0.1);
        }

        @media (max-width: 768px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-card {
          background: rgba(0, 217, 255, 0.05);
          border: 1px solid rgba(0, 217, 255, 0.2);
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .detail-label {
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
          font-family: 'Inter', sans-serif;
        }

        .detail-value {
          font-size: 24px;
          color: var(--primary);
          font-weight: 700;
          font-family: 'Syne', sans-serif;
        }

        .notification {
          margin-top: 40px;
          padding: 20px;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid rgba(0, 255, 136, 0.3);
          border-radius: 12px;
          color: var(--success);
          text-align: center;
          font-weight: 600;
          animation: slide-in 0.5s ease-out;
        }
      `}</style>

      <div className="tracker-container">
        {/* Header */}
        <div className="order-header">
          <div className="order-id">Order #WISE-2024-{Math.floor(Math.random() * 9000) + 1000}</div>
          <h1 className="order-title font-display">{steps[currentStep].label}</h1>
          <div className="eta">
            Estimated time: {formatTime(totalDuration - elapsedTime)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="steps-grid">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            >
              <div className={`step-icon ${idx === currentStep ? 'step-active' : ''}`}>
                {idx < currentStep ? '✓' : step.icon}
              </div>
              <div className="step-label">{step.label}</div>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="details-grid">
          <div className="detail-card">
            <div className="detail-label">Current Step</div>
            <div className="detail-value">{currentStep + 1}/6</div>
          </div>
          <div className="detail-card">
            <div className="detail-label">Progress</div>
            <div className="detail-value">{Math.round(progressPercent)}%</div>
          </div>
          <div className="detail-card">
            <div className="detail-label">Elapsed Time</div>
            <div className="detail-value">{formatTime(elapsedTime)}</div>
          </div>
        </div>

        {/* Notification */}
        {currentStep === steps.length - 1 && (
          <div className="notification">
            ✓ Your order has been delivered! Thank you for your order.
          </div>
        )}
      </div>
    </div>
    </>
  );
}
