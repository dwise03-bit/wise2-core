'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Footer } from '@/components/wise';

const ONBOARDING_STEPS = [
  { number: 1, title: 'Welcome to WISE²', description: 'Let\'s set up your workspace' },
  { number: 2, title: 'Team Setup', description: 'Add your first team members' },
  { number: 3, title: 'Integrations', description: 'Connect your tools (optional)' },
  { number: 4, title: 'Preferences', description: 'Customize your experience' },
  { number: 5, title: 'Done!', description: 'You\'re ready to go' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    workspaceName: '',
    workspaceUrl: '',
    teamSize: '1-5',
    teamEmails: '',
    timezone: 'UTC',
    notifications: true,
  });

  const handleNext = async () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          router.push('/dashboard/subscription');
        }
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  const progress = (currentStep / ONBOARDING_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-12">
            <div className="h-2 bg-[#101010] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-sm text-gray-400 mt-2">Step {currentStep} of {ONBOARDING_STEPS.length}</div>
          </div>

          {/* Content */}
          <div className="bg-[#101010] border border-[#1a1a1a] rounded-2xl p-12 mb-8">
            <h1 className="text-4xl font-bold mb-4">{ONBOARDING_STEPS[currentStep - 1].title}</h1>
            <p className="text-gray-400 text-lg mb-8">{ONBOARDING_STEPS[currentStep - 1].description}</p>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Workspace Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Acme Corporation"
                    value={formData.workspaceName}
                    onChange={(e) => handleChange('workspaceName', e.target.value)}
                    className="w-full px-4 py-3 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Workspace URL</label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-[#050505] border border-r-0 border-[#1a1a1a] rounded-l-lg text-gray-400">
                      wise2.io/
                    </span>
                    <input
                      type="text"
                      placeholder="acme"
                      value={formData.workspaceUrl}
                      onChange={(e) => handleChange('workspaceUrl', e.target.value)}
                      className="flex-1 px-4 py-3 bg-[#050505] border border-[#1a1a1a] rounded-r-lg text-white focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Team Size</label>
                  <select
                    value={formData.teamSize}
                    onChange={(e) => handleChange('teamSize', e.target.value)}
                    className="w-full px-4 py-3 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:border-emerald-500"
                  >
                    <option>1-5</option>
                    <option>6-20</option>
                    <option>21-50</option>
                    <option>50+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Team Emails</label>
                  <textarea
                    placeholder="email1@example.com&#10;email2@example.com"
                    value={formData.teamEmails}
                    onChange={(e) => handleChange('teamEmails', e.target.value)}
                    className="w-full px-4 py-3 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white h-24 focus:border-emerald-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">One email per line (optional)</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-gray-400">You can connect integrations anytime in your dashboard settings.</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Stripe', 'Discord', 'Slack', 'GitHub'].map((tool) => (
                    <div key={tool} className="p-4 bg-[#050505] rounded-lg border border-[#1a1a1a] text-center">
                      <div className="font-semibold text-sm">{tool}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 bg-[#050505] border border-[#1a1a1a] rounded-lg text-white focus:border-emerald-500"
                  >
                    <option>UTC</option>
                    <option>EST</option>
                    <option>CST</option>
                    <option>MST</option>
                    <option>PST</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[#050505] rounded-lg border border-[#1a1a1a]">
                  <input
                    type="checkbox"
                    checked={formData.notifications}
                    onChange={(e) => handleChange('notifications', e.target.checked)}
                    className="w-5 h-5 text-emerald-500 rounded"
                  />
                  <div>
                    <div className="font-semibold">Email Notifications</div>
                    <div className="text-sm text-gray-400">Receive workspace updates</div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Your workspace is ready!</h2>
                <p className="text-gray-400">You're all set. Let's start building.</p>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-8 py-3 bg-[#161616] rounded-lg font-semibold hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={loading}
              className="px-8 py-3 bg-emerald-500 rounded-lg font-semibold hover:bg-emerald-600 disabled:opacity-50"
            >
              {currentStep === 5 ? (loading ? 'Completing...' : 'Complete Setup') : 'Next'}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
