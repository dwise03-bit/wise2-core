'use client'

import React, { useState } from 'react'
import Link from 'next/link'

export default function AppDevelopmentPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview')

  const services = [
    {
      id: 'ios-development',
      icon: '📱',
      title: 'iOS App Development',
      description: 'Native iOS apps with Swift & SwiftUI',
      features: [
        'Native Swift development',
        'SwiftUI for modern UI',
        'TestFlight distribution',
        'App Store deployment',
        'Device testing & QA'
      ]
    },
    {
      id: 'android-development',
      icon: '🤖',
      title: 'Android App Development',
      description: 'Native Android apps with Kotlin',
      features: [
        'Kotlin development',
        'Jetpack Compose UI',
        'Google Play deployment',
        'Firebase integration',
        'Device compatibility testing'
      ]
    },
    {
      id: 'react-native',
      icon: '⚛️',
      title: 'React Native',
      description: 'Cross-platform apps (iOS & Android)',
      features: [
        'Single codebase',
        'iOS & Android support',
        'Faster development',
        'Code sharing',
        'Native performance'
      ]
    },
    {
      id: 'app-distribution',
      icon: '📦',
      title: 'Distribution & Deployment',
      description: 'TestFlight, Play Store, direct distribution',
      features: [
        'TestFlight beta testing',
        'App Store deployment',
        'Google Play releases',
        'Over-the-air updates',
        'Version management'
      ]
    },
    {
      id: 'app-analytics',
      icon: '📊',
      title: 'Analytics & Monitoring',
      description: 'Track usage, crashes, and performance',
      features: [
        'Real-time crash reporting',
        'User analytics',
        'Performance monitoring',
        'Session tracking',
        'Custom events'
      ]
    },
    {
      id: 'ci-cd',
      icon: '⚙️',
      title: 'CI/CD & Automation',
      description: 'Automated builds, tests, and deployments',
      features: [
        'GitHub Actions integration',
        'Automated testing',
        'Continuous deployment',
        'Build pipeline automation',
        'Release management'
      ]
    }
  ]

  const workflow = [
    {
      phase: '1. Discovery',
      description: 'Define app requirements, target audience, platform strategy',
      tasks: [
        'Requirements gathering',
        'User research',
        'Platform selection (iOS/Android/Both)',
        'Technical architecture planning'
      ]
    },
    {
      phase: '2. Design',
      description: 'Create wireframes, UI designs, user flows',
      tasks: [
        'Wireframing',
        'UI/UX design',
        'Design system creation',
        'Prototype & testing'
      ]
    },
    {
      phase: '3. Development',
      description: 'Build native or cross-platform app',
      tasks: [
        'Setup development environment',
        'Core feature development',
        'API integration',
        'Local testing'
      ]
    },
    {
      phase: '4. Testing',
      description: 'QA, device testing, security review',
      tasks: [
        'Unit testing',
        'Integration testing',
        'Device compatibility testing',
        'Security audit'
      ]
    },
    {
      phase: '5. Deployment',
      description: 'TestFlight beta, then app store release',
      tasks: [
        'Beta distribution',
        'App store submission',
        'Release management',
        'Launch monitoring'
      ]
    },
    {
      phase: '6. Support',
      description: 'Monitor, update, and improve app',
      tasks: [
        'Crash monitoring',
        'User feedback analysis',
        'Feature updates',
        'Performance optimization'
      ]
    }
  ]

  const techStack = {
    'iOS': {
      icon: '📱',
      languages: 'Swift, Objective-C',
      frameworks: 'SwiftUI, UIKit',
      tools: 'Xcode, TestFlight, App Store Connect'
    },
    'Android': {
      icon: '🤖',
      languages: 'Kotlin, Java',
      frameworks: 'Jetpack Compose, Material Design',
      tools: 'Android Studio, Play Console'
    },
    'Cross-Platform': {
      icon: '⚛️',
      languages: 'JavaScript/TypeScript',
      frameworks: 'React Native, Flutter',
      tools: 'VS Code, Firebase, App Center'
    },
    'Backend': {
      icon: '🖥️',
      languages: 'Node.js, Python, Go',
      frameworks: 'Express, Django, FastAPI',
      tools: 'Docker, Kubernetes, PostgreSQL'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-cyan-500/20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">📲</span>
            <div>
              <h1 className="text-5xl font-bold text-white">App Development</h1>
              <p className="text-xl text-slate-300 mt-2">Native iOS & Android, cross-platform, and full deployment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-20">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-cyan-400">4</div>
            <div className="text-slate-300 text-sm mt-2">Apps in Production</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-green-400">100%</div>
            <div className="text-slate-300 text-sm mt-2">Native Code</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-purple-400">6</div>
            <div className="text-slate-300 text-sm mt-2">Dev Services</div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
            <div className="text-4xl font-bold text-orange-400">15min</div>
            <div className="text-slate-300 text-sm mt-2">to TestFlight</div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12">Development Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-500/50 transition-all duration-300 cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === service.id ? null : service.id)}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-green-500/10" />
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{service.icon}</span>
                    <span className="text-slate-500">▼</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-300 text-sm mb-4">{service.description}</p>

                  {/* Features */}
                  {expandedSection === service.id && (
                    <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                          <span className="text-cyan-400">✓</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Development Workflow */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12">Development Workflow</h2>
          <div className="space-y-4">
            {workflow.map((step, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-start gap-6">
                  <div className="min-w-fit">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center font-bold text-black">
                      {idx + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{step.phase}</h3>
                    <p className="text-slate-300 mb-3">{step.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {step.tasks.map((task, tIdx) => (
                        <div key={tIdx} className="text-xs bg-slate-700/50 rounded px-3 py-1 text-slate-200">
                          {task}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-12">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(techStack).map(([platform, details]) => (
              <div key={platform} className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{details.icon}</span>
                  <h3 className="text-2xl font-bold text-white">{platform}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-slate-400 font-semibold">Languages</div>
                    <div className="text-slate-300">{details.languages}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold">Frameworks</div>
                    <div className="text-slate-300">{details.frameworks}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-semibold">Tools</div>
                    <div className="text-slate-300">{details.tools}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Projects */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-white mb-8">Current Projects</h2>
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🏪</span> Blakkhail
                </h3>
                <p className="text-slate-300 mb-4">PIFF CITY eCommerce platform</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-green-400">✅ Live</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-cyan-400">iOS & Android</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distribution:</span>
                    <span className="text-slate-300">App Store & Play</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">⚙️</span> WISE² Command Center
                </h3>
                <p className="text-slate-300 mb-4">Business operations dashboard</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-yellow-400">🔨 In Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Platform:</span>
                    <span className="text-cyan-400">iOS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Distribution:</span>
                    <span className="text-slate-300">TestFlight Beta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Build Your App?</h3>
          <p className="text-slate-300 mb-6">
            From concept to app store - complete development, testing, and distribution support
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="px-8 py-3 bg-cyan-500 text-black rounded-lg font-semibold hover:bg-cyan-400 transition-colors"
            >
              Start a Project
            </Link>
            <Link
              href="/apps"
              className="px-8 py-3 bg-slate-700 text-slate-100 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
            >
              See Our Apps
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-700 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-cyan-400">iOS Development</a></li>
                <li><a href="#" className="hover:text-cyan-400">Android Development</a></li>
                <li><a href="#" className="hover:text-cyan-400">App Distribution</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="/docs/ios-app-registry" className="hover:text-cyan-400">App Registry</a></li>
                <li><a href="/docs/team-app-distribution" className="hover:text-cyan-400">Distribution Guide</a></li>
                <li><a href="/api-docs" className="hover:text-cyan-400">API Docs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <p className="text-slate-400 text-sm">
                <a href="mailto:dwise03@gmail.com" className="hover:text-cyan-400">dwise03@gmail.com</a>
              </p>
              <p className="text-slate-400 text-sm">Discord: #app-development</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
