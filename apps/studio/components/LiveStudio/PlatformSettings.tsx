'use client';

import React, { useState, useCallback } from 'react';
import { X, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import type { StreamingPlatform, PlatformCredentials } from './streamingTypes';
import { PLATFORM_CONFIGS } from './streamingConstants';

interface PlatformSettingsProps {
  platform: StreamingPlatform;
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: PlatformCredentials) => void;
  currentCredentials?: PlatformCredentials;
}

export default function PlatformSettings({
  platform,
  isOpen,
  onClose,
  onSave,
  currentCredentials,
}: PlatformSettingsProps) {
  const [streamKey, setStreamKey] = useState(currentCredentials?.streamKey || '');
  const [streamUrl, setStreamUrl] = useState(currentCredentials?.streamUrl || '');
  const [ingestServer, setIngestServer] = useState(
    currentCredentials?.ingestServer || ''
  );
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStreamKey, setShowStreamKey] = useState(false);

  const config = PLATFORM_CONFIGS[platform];

  const handleOAuthLogin = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      if (!config.requiresOAuth) {
        setError('This platform does not require OAuth');
        return;
      }

      // Simulate OAuth flow
      console.log(`Initiating OAuth for ${platform}...`);

      // In production, this would redirect to the OAuth endpoint
      // window.location.href = `${config.oauthEndpoint}?...`;

      // Simulate receiving OAuth token
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock stream key from OAuth
      setStreamKey('mock-oauth-stream-key-' + Date.now());
      setIsValidated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, [platform, config]);

  const validateStreamKey = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      // Validate stream key format
      if (!streamKey.trim()) {
        setError('Stream key cannot be empty');
        return;
      }

      if (config.streamKeyPattern && !config.streamKeyPattern.test(streamKey)) {
        setError('Invalid stream key format for ' + platform);
        return;
      }

      // Simulate server validation
      console.log('Validating stream key...');
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsValidated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, [streamKey, platform, config]);

  const resetStreamKey = useCallback(async () => {
    if (!confirm('Are you sure? This will invalidate your current stream key.')) {
      return;
    }

    setIsAuthenticating(true);
    setError(null);

    try {
      console.log('Resetting stream key...');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStreamKey('');
      setIsValidated(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!isValidated) {
      setError('Please validate your settings first');
      return;
    }

    onSave({
      platform,
      streamKey,
      streamUrl: streamUrl || undefined,
      ingestServer: ingestServer || undefined,
    });

    onClose();
  }, [isValidated, platform, streamKey, streamUrl, ingestServer, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">
            {config.name} Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* OAuth Login (if required) */}
          {config.requiresOAuth && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <button
                onClick={handleOAuthLogin}
                disabled={isAuthenticating || isValidated}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
              >
                {isAuthenticating ? 'Authenticating...' : 'Login with ' + config.name}
              </button>
              <p className="text-xs text-gray-400 mt-2">
                Securely authenticate to auto-fill your stream key
              </p>
            </div>
          )}

          {/* Stream Key Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stream Key
            </label>
            <div className="relative">
              <input
                type={showStreamKey ? 'text' : 'password'}
                value={streamKey}
                onChange={(e) => {
                  setStreamKey(e.target.value);
                  setIsValidated(false);
                }}
                placeholder="Enter your stream key"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 pr-12"
              />
              <button
                onClick={() => setShowStreamKey(!showStreamKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Lock className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your stream key is encrypted and stored securely
            </p>
          </div>

          {/* Ingest Server Selection */}
          {config.ingestServers.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ingest Server
              </label>
              <select
                value={ingestServer}
                onChange={(e) => setIngestServer(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="">Auto-select best server</option>
                {config.ingestServers.map((server) => (
                  <option key={server.url} value={server.url}>
                    {server.region}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Choose a server closest to you for best performance
              </p>
            </div>
          )}

          {/* Custom RTMP URL */}
          {platform === 'custom-rtmp' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RTMP Server URL
              </label>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
                placeholder="rtmp://server.example.com/live"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Validation Status */}
          {isValidated && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-200 text-sm">Settings validated</p>
            </div>
          )}

          {/* Recommended Bitrate Info */}
          <div className="p-3 bg-slate-700/50 rounded-lg">
            <p className="text-xs font-medium text-gray-300 mb-1">Recommended Bitrate</p>
            <p className="text-sm text-amber-400 font-mono">
              {config.recommendedBitrate.min} - {config.recommendedBitrate.max} kbps
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-6 border-t border-slate-700">
          <button
            onClick={resetStreamKey}
            disabled={isAuthenticating || !streamKey}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-gray-300 font-medium rounded-lg transition"
          >
            Reset Key
          </button>
          <button
            onClick={validateStreamKey}
            disabled={isAuthenticating || !streamKey}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            {isAuthenticating ? 'Validating...' : 'Validate'}
          </button>
          <button
            onClick={handleSave}
            disabled={isAuthenticating || !isValidated}
            className="flex-1 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
