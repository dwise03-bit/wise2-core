'use client';

import Link from 'next/link';

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-wise-bg-primary pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-wise-text-primary mb-4">Integrated Apps</h1>
          <p className="text-wise-text-secondary text-lg">
            Connect your favorite tools and services to WISE²
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Google Workspace */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors">
            <h3 className="text-xl font-bold text-wise-text-primary mb-2">Google Workspace</h3>
            <p className="text-wise-text-secondary mb-4">
              Connect Gmail, Google Drive, and Google Calendar to WISE²
            </p>
            <Link href="#" className="text-lime-400 hover:text-lime-300 font-mono text-sm">
              Connect →
            </Link>
          </div>

          {/* Slack */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors">
            <h3 className="text-xl font-bold text-wise-text-primary mb-2">Slack</h3>
            <p className="text-wise-text-secondary mb-4">
              Send notifications and collaborate with your team
            </p>
            <Link href="#" className="text-lime-400 hover:text-lime-300 font-mono text-sm">
              Connect →
            </Link>
          </div>

          {/* Stripe */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors">
            <h3 className="text-xl font-bold text-wise-text-primary mb-2">Stripe</h3>
            <p className="text-wise-text-secondary mb-4">
              Manage payments and subscriptions
            </p>
            <Link href="#" className="text-lime-400 hover:text-lime-300 font-mono text-sm">
              Connect →
            </Link>
          </div>

          {/* Zapier */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors">
            <h3 className="text-xl font-bold text-wise-text-primary mb-2">Zapier</h3>
            <p className="text-wise-text-secondary mb-4">
              Automate workflows between apps
            </p>
            <Link href="#" className="text-lime-400 hover:text-lime-300 font-mono text-sm">
              Connect →
            </Link>
          </div>

          {/* HubSpot */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-wise-border hover:border-lime-400/50 transition-colors">
            <h3 className="text-xl font-bold text-wise-text-primary mb-2">HubSpot</h3>
            <p className="text-wise-text-secondary mb-4">
              Sync contacts and manage CRM data
            </p>
            <Link href="#" className="text-lime-400 hover:text-lime-300 font-mono text-sm">
              Connect →
            </Link>
          </div>

          {/* More Coming */}
          <div className="bg-wise-bg-secondary rounded-lg p-6 border border-dashed border-wise-border hover:border-lime-400/50 transition-colors flex items-center justify-center">
            <div className="text-center">
              <p className="text-wise-text-secondary">More integrations coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
