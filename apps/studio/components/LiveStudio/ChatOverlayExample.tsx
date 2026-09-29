'use client';

import React from 'react';
import { ChatOverlay } from './ChatOverlay';

/**
 * ChatOverlay Example Component
 *
 * This demonstrates how to integrate the ChatOverlay component
 * into your OBS or streaming setup.
 */

export function ChatOverlayExample() {
  return (
    <div className="w-full h-screen bg-slate-900 flex items-center justify-center">
      {/* Example 1: Preview mode with settings panel visible */}
      <div className="w-full max-w-4xl">
        <ChatOverlay
          platform="mock"
          isPreview={true}
          autoConnect={false}
          onConfigChange={(config) => {
            console.log('Config changed:', config);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Usage Examples:
 *
 * 1. **Mock Chat (Testing)**
 * ```tsx
 * <ChatOverlay
 *   platform="mock"
 *   autoConnect={true}
 *   isPreview={false}
 * />
 * ```
 *
 * 2. **Twitch Integration**
 * ```tsx
 * <ChatOverlay
 *   platform="twitch"
 *   channelId="your-channel-id"
 *   autoConnect={true}
 * />
 * ```
 *
 * 3. **With Configuration Callback**
 * ```tsx
 * const [config, setConfig] = useState<ChatOverlayConfig>({...});
 *
 * <ChatOverlay
 *   platform="mock"
 *   onConfigChange={(newConfig) => {
 *     setConfig(newConfig);
 *     // Save to localStorage, database, etc.
 *   }}
 * />
 * ```
 *
 * 4. **Preview Mode for Settings**
 * ```tsx
 * <ChatOverlay
 *   platform="mock"
 *   isPreview={true}
 *   autoConnect={false}
 * />
 * ```
 *
 * 5. **Multiple Positions (Grid)**
 * ```tsx
 * {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const).map((pos) => (
 *   <ChatOverlay
 *     key={pos}
 *     platform="mock"
 *     config={{ position: pos }}
 *   />
 * ))}
 * ```
 */

export default ChatOverlayExample;
