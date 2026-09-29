'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, X, Send, Copy } from 'lucide-react';
import { ChatOverlayConfig, ChatConnectionStatus } from './types/chat';

interface ChatSettingsPanelProps {
  config: ChatOverlayConfig;
  onConfigChange: (config: ChatOverlayConfig) => void;
  isConnected: boolean;
  connectionStatus: ChatConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
  onSendTestMessage: () => void;
  onClose?: () => void;
}

export function ChatSettingsPanel({
  config,
  onConfigChange,
  isConnected,
  connectionStatus,
  onConnect,
  onDisconnect,
  onSendTestMessage,
  onClose,
}: ChatSettingsPanelProps) {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Chat Overlay Settings</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Connection Status */}
        <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              Connection
            </h3>
            <span
              className={`text-xs font-bold px-2 py-1 rounded ${
                isConnected
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {connectionStatus.toUpperCase()}
            </span>
          </div>

          <div className="flex gap-2">
            {!isConnected ? (
              <button
                onClick={onConnect}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-medium text-white transition-colors"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={onDisconnect}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-medium text-white transition-colors"
              >
                Disconnect
              </button>
            )}
            <button
              onClick={onSendTestMessage}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium text-white transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Test Message
            </button>
          </div>
        </div>

        {/* Position */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">Position</label>
          <div className="grid grid-cols-2 gap-2">
            {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map(
              (position) => (
                <button
                  key={position}
                  onClick={() => onConfigChange({ ...config, position })}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    config.position === position
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {position.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Size Presets */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">Size</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Small', width: 250, height: 350 },
              { label: 'Medium', width: 350, height: 400 },
              { label: 'Large', width: 450, height: 500 },
              { label: 'XL', width: 550, height: 600 },
            ].map((size) => (
              <button
                key={size.label}
                onClick={() =>
                  onConfigChange({ ...config, width: size.width, height: size.height })
                }
                className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                  config.width === size.width && config.height === size.height
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>

          {/* Custom size */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Width (px)</label>
              <input
                type="number"
                value={config.width}
                onChange={(e) =>
                  onConfigChange({ ...config, width: parseInt(e.target.value) || 350 })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Height (px)</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) =>
                  onConfigChange({ ...config, height: parseInt(e.target.value) || 400 })
                }
                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Opacity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">Opacity</label>
            <span className="text-xs font-mono text-slate-400">
              {Math.round(config.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.opacity}
            onChange={(e) =>
              onConfigChange({ ...config, opacity: parseFloat(e.target.value) })
            }
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Font Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-semibold text-white">Font Size</label>
            <span className="text-xs font-mono text-slate-400">{config.fontSize}px</span>
          </div>
          <input
            type="range"
            min="10"
            max="20"
            step="1"
            value={config.fontSize}
            onChange={(e) =>
              onConfigChange({ ...config, fontSize: parseInt(e.target.value) })
            }
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Message Limit */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">Message History</label>
          <div className="grid grid-cols-4 gap-2">
            {[20, 50, 100, 200].map((limit) => (
              <button
                key={limit}
                onClick={() => onConfigChange({ ...config, messageLimit: limit })}
                className={`px-2 py-2 rounded text-sm font-medium transition-colors ${
                  config.messageLimit === limit
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {limit}
              </button>
            ))}
          </div>
        </div>

        {/* Display Options */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-white">Display Options</label>
          <div className="space-y-2">
            {[
              { key: 'showUsernames', label: 'Show Usernames' },
              { key: 'showTimestamps', label: 'Show Timestamps' },
              { key: 'showEmotes', label: 'Show Emotes' },
              { key: 'autoScroll', label: 'Auto-Scroll' },
              { key: 'soundEnabled', label: 'Sound Alerts' },
              { key: 'alertAnimations', label: 'Alert Animations' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={(config as any)[key]}
                  onChange={(e) =>
                    onConfigChange({ ...config, [key]: e.target.checked })
                  }
                  className="w-4 h-4 bg-slate-700 border border-slate-600 rounded cursor-pointer"
                />
                <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Config */}
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <button
            onClick={() => {
              const json = JSON.stringify(config, null, 2);
              navigator.clipboard.writeText(json);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium text-white transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            Copy Config
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Save this configuration for later use.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ChatSettingsPanel;
