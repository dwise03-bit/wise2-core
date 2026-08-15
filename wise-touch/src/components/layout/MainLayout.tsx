import React from 'react'
import { SidebarClient } from './SidebarClient'
import { TopbarClient } from './TopbarClient'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

interface MainLayoutProps {
  children: React.ReactNode
}

/** Main application layout with sidebar, topbar, and error boundary */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarClient />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        {/* Top Navigation Bar */}
        <TopbarClient />

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          role="main"
          aria-label="Main content"
        >
          <div className="p-6 md:p-8 lg:p-10">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  )
}
