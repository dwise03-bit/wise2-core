'use client';

import { useState } from 'react';
import AppShell from '@/components/AppShell';
import Canvas from '@/components/Studio/Canvas';
import RightUtilityPanel from '@/components/Studio/RightUtilityPanel';

export default function StudioPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [rightPanelWidth, setRightPanelWidth] = useState(320);

  return (
    <AppShell>
      <div className="flex flex-1 h-full overflow-hidden">
        {/* Main Canvas */}
        <Canvas />

        {/* Right Utility Panel - responsive behavior */}
        <div
          className={`
            hidden lg:flex flex-col border-l border-wise-surface-2
            ${rightPanelOpen ? 'w-80' : 'w-0'}
            transition-all duration-200 overflow-hidden
          `}
          style={{
            width: rightPanelOpen ? `${rightPanelWidth}px` : 0,
          }}
        >
          <RightUtilityPanel
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(!rightPanelOpen)}
            width={rightPanelWidth}
            onResize={setRightPanelWidth}
          />
        </div>

        {/* Mobile/Tablet: Right Panel as Drawer Overlay */}
        {rightPanelOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setRightPanelOpen(false)}
            />
            {/* Drawer */}
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-wise-surface-2 border-l border-wise-surface-2 overflow-y-auto">
              <RightUtilityPanel
                isOpen={rightPanelOpen}
                onToggle={() => setRightPanelOpen(!rightPanelOpen)}
                width={320}
                onResize={() => {}}
              />
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
