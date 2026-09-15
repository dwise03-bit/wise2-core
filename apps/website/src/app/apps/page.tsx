'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function AppsPage() {
  const apps = [
    {
      id: 'blakkhail',
      name: 'BLAKKHAIL',
      tagline: 'Authentic pieces built on heritage, culture, and no apologies.',
      icon: '👕',
      status: 'Live',
      bundleId: 'com.sencere.blakkhail',
      features: [
        'Full eCommerce platform',
        'Product catalog',
        'Secure checkout',
        'Order tracking',
        'Customer profiles'
      ],
      distribution: 'TestFlight + App Store',
      actions: [
        { label: 'Download on TestFlight', href: 'https://testflight.apple.com', variant: 'primary' },
        { label: 'View on App Store', href: 'https://apps.apple.com', variant: 'secondary' }
      ]
    },
    {
      id: 'wise2-command-center',
      name: 'WISE² Command Center',
      tagline: 'Unified control hub for business operations and team management.',
      icon: '⚙️',
      status: 'Beta',
      bundleId: 'com.dwise954.wise2',
      features: [
        'Real-time dashboard',
        'Team management',
        'Project overview',
        'Integration hub',
        'Analytics & reporting'
      ],
      distribution: 'TestFlight Beta',
      actions: [
        { label: 'Join Beta on TestFlight', href: 'https://testflight.apple.com', variant: 'primary' },
        { label: 'Request Invite', href: 'mailto:dwise03@gmail.com?subject=WISE%202%20Beta%20Access', variant: 'secondary' }
      ]
    },
    {
      id: 'sencere-studio',
      name: 'SenCere Creative Studio',
      tagline: 'Design, create, and manage creative projects on the go.',
      icon: '🎨',
      status: 'Beta',
      bundleId: 'com.sencere.creative',
      features: [
        'Brand management',
        'Asset library',
        'Team collaboration',
        'Project workflows',
        'Feedback & approvals'
      ],
      distribution: 'TestFlight Beta',
      actions: [
        { label: 'Join Beta on TestFlight', href: 'https://testflight.apple.com', variant: 'primary' },
        { label: 'Request Invite', href: 'mailto:dwise03@gmail.com?subject=SenCere%20Beta%20Access', variant: 'secondary' }
      ]
    },
    {
      id: 'wise2-rp',
      name: 'WISE² RP',
      tagline: 'Mobile field operations and remote partnerships platform.',
      icon: '📱',
      status: 'Coming Soon',
      bundleId: 'com.wise2.rp',
      features: [
        'Field operations',
        'Partner management',
        'Real-time sync',
        'Offline-first design',
        'Notification system'
      ],
      distribution: 'Launching Q4 2026',
      actions: [
        { label: 'Notify Me', href: 'mailto:dwise03@gmail.com?subject=WISE%202%20RP%20Interest', variant: 'secondary' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-cyan-500/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            WISE² <span className="text-cyan-400">Apps</span>
          </h1>
          <p className="text-xl text-slate-300">
            Powerful mobile experiences for your business
          </p>
        </div>
      </div>

      {/* Apps Grid */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {apps.map((app) => (
            <div
              key={app.id}
              className="group relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10" />
              </div>

              {/* Content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{app.icon}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'Live' ? 'bg-green-500/20 text-green-300' :
                        app.status === 'Beta' ? 'bg-cyan-500/20 text-cyan-300' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{app.name}</h2>
                    <p className="text-slate-300">{app.tagline}</p>
                  </div>
                </div>

                {/* Bundle ID */}
                <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-900/50 p-2 rounded">
                  {app.bundleId}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {app.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                        <span className="text-cyan-400">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Distribution */}
                <p className="text-xs text-slate-400 mb-6 p-2 bg-slate-900/50 rounded">
                  <span className="font-semibold text-slate-300">Distribution: </span>{app.distribution}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  {app.actions.map((action, idx) => (
                    <Link
                      key={idx}
                      href={action.href}
                      target={action.href.startsWith('http') ? '_blank' : undefined}
                      rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 text-center ${
                        action.variant === 'primary'
                          ? 'bg-cyan-500 text-black hover:bg-cyan-400 hover:shadow-lg hover:shadow-cyan-500/50'
                          : 'bg-slate-700 text-slate-100 hover:bg-slate-600 border border-slate-600'
                      }`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-20 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-white mb-4">Need Help?</h3>
          <p className="text-slate-300 mb-6">
            For TestFlight invitations, support, or to report issues:
          </p>
          <div className="flex gap-4">
            <Link
              href="mailto:dwise03@gmail.com"
              className="px-6 py-3 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/docs/ios-app-registry"
              className="px-6 py-3 bg-slate-700 text-slate-100 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              View Registry
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-700 text-center text-slate-400 text-sm">
        <p>All WISE² apps require iOS 16.0 or later. TestFlight invitations available upon request.</p>
      </div>
    </div>
  )
}
