'use client';

import React from 'react';
import Link from 'next/link';
import { SparklesIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const GPTShowcase = () => {
  const features = [
    {
      title: 'Real-Time Analytics',
      description: 'Get instant insights into your business metrics and KPIs',
      icon: '📊',
    },
    {
      title: 'AI Recommendations',
      description: 'Receive actionable insights powered by WISE² AI',
      icon: '🤖',
    },
    {
      title: 'Operations Management',
      description: 'Manage jobs, teams, and schedules effortlessly',
      icon: '⚙️',
    },
    {
      title: 'Business Intelligence',
      description: 'Analyze trends and forecast future performance',
      icon: '📈',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-4">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Operations</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            WISE² Command Center GPT
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Your AI-native operations assistant. Access real-time insights, analytics, and recommendations—integrated across your entire WISE² platform.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 rounded-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700/50 hover:shadow-lg transition-shadow"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-4">
            <CommandLineIcon className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Get Started Now
          </h3>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Access the WISE² Command Center GPT directly through your dashboard, website, or Discord. Your operations hub is just one click away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="https://chatgpt.com/g/g-6aa6a67f0d9c8191bb664542f87f28b4-wise2-command-center"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Open GPT →
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold transition-colors border border-blue-500"
            >
              Dashboard
            </Link>
          </div>

          <p className="text-blue-100 text-sm mt-6">
            Available via ChatGPT • Integrated with Dashboard • Connected to Discord
          </p>
        </div>

        {/* Integration Info */}
        <div className="mt-16 p-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔗 Seamless Integrations
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl mb-2">📱</div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dashboard</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💻</div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
            </div>
            <div>
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Discord</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🧠</div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Knowledge Base</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GPTShowcase;
