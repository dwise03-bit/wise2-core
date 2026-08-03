import React from 'react'
import { SidebarClient } from './SidebarClient'
import { TopbarClient } from './TopbarClient'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <SidebarClient />
      <div className="flex-1 flex flex-col min-w-0 bg-bg-primary">
        <TopbarClient />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
