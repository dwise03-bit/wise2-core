'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function StudioPage() {
  const [activeModule, setActiveModule] = useState('dashboard')

  const modules = [
    { id: 'cc', name: 'Command Center', href: '/', icon: '🎛️' },
    { id: 'sl', name: 'Sound Lab', href: '/soundlab', icon: '🎵' },
    { id: 'ls', name: 'Live Studio', href: '/live-studio', icon: '📡' },
    { id: 'jl', name: 'Jingle Lab', href: '/jingle-lab', icon: '✨' },
    { id: 'vl', name: 'Voice Lab', href: '/voice-lab', icon: '🎤' },
    { id: 'cf', name: 'Content Factory', href: '/content-factory', icon: '📸' },
    { id: 'cs', name: 'Client Showcase', href: '/showcase', icon: '🌟' },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #000 0%, #0a0a0a 50%, #050505 100%)',
        color: '#fff',
        fontFamily: '"Rajdhani", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid rgba(57, 255, 20, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', color: '#39FF14', fontWeight: 900 }}>
          WISE² STUDIO
        </h1>
        <div style={{ fontSize: '12px', color: '#888' }}>Professional Creative Suite</div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <div
          style={{
            width: '200px',
            padding: '30px 20px',
            borderRight: '1px solid rgba(57, 255, 20, 0.1)',
            minHeight: '100vh',
          }}
        >
          <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase', marginBottom: '20px' }}>
            Modules
          </div>
          {modules.map((module) => (
            <Link
              key={module.id}
              href={module.href}
              style={{
                display: 'block',
                padding: '12px 16px',
                marginBottom: '8px',
                borderRadius: '8px',
                textDecoration: 'none',
                color: activeModule === module.id ? '#000' : '#888',
                background:
                  activeModule === module.id
                    ? '#39FF14'
                    : 'rgba(57, 255, 20, 0.05)',
                border:
                  activeModule === module.id
                    ? '1px solid #39FF14'
                    : '1px solid rgba(57, 255, 20, 0.1)',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (activeModule !== module.id) {
                  e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.3)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeModule !== module.id) {
                  e.currentTarget.style.background = 'rgba(57, 255, 20, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.1)'
                }
              }}
            >
              <span style={{ marginRight: '8px' }}>{module.icon}</span>
              {module.name}
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: '40px' }}>
          <div style={{ maxWidth: '1200px' }}>
            <h2 style={{ fontSize: '32px', marginTop: 0, marginBottom: '10px', color: '#39FF14' }}>
              Creative Studio Dashboard
            </h2>
            <p style={{ color: '#888', marginBottom: '40px' }}>
              Welcome to WISE² Studio. Select a module from the sidebar to get started.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {modules.map((module) => (
                <Link
                  key={module.id}
                  href={module.href}
                  style={{
                    padding: '20px',
                    background: 'linear-gradient(180deg, rgba(10, 10, 10, 0.95), rgba(5, 5, 5, 0.98))',
                    border: '1px solid rgba(57, 255, 20, 0.2)',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: '#fff',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.6)'
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.2)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>{module.icon}</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#39FF14' }}>
                    {module.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Click to open →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
