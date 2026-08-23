'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Step {
  step: number;
  name: string;
  description: string;
  icon: string;
}

const steps: Step[] = [
  {
    step: 1,
    name: 'Connect Integration',
    description: 'Link your Jobber account or e-commerce platform',
    icon: '🔗',
  },
  {
    step: 2,
    name: 'Setup Billing',
    description: 'Add payment method and select your plan',
    icon: '💳',
  },
  {
    step: 3,
    name: 'Configure Dashboard',
    description: 'Customize your command center',
    icon: '⚙️',
  },
  {
    step: 4,
    name: 'Enable AI Phone',
    description: 'Set greeting message and business hours',
    icon: '📞',
  },
  {
    step: 5,
    name: 'Launch',
    description: 'Verify everything and go live',
    icon: '🚀',
  },
];

export default function OnboardingFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Fetch current onboarding status
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/v1/onboarding/status');
        const data = await res.json();
        setCurrentStep(data.currentStep);
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error);
      }
    };

    fetchStatus();
  }, []);

  const handleStepComplete = async (stepNum: number, data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/step/${stepNum}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentStep(result.currentStep);
        if (result.currentStep > currentStep) {
          setFormData({});
        }
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipStep = async (stepNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/onboarding/skip-step/${stepNum}`, {
        method: 'POST',
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentStep(result.nextStep);
      }
    } catch (error) {
      console.error('Failed to skip step:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-wise-primary mb-6">
              Connect Your Integration
            </h2>
            <p className="text-wise-muted mb-4">
              Choose how to sync your business data with WISE² AI Phone
            </p>
            <div className="space-y-3">
              {['jobber', 'stripe', 'zapier'].map((provider) => (
                <button
                  key={provider}
                  onClick={() => {
                    setFormData({ provider });
                    handleStepComplete(1, { provider, accountId: 'pending' });
                  }}
                  className="w-full p-4 border border-wise-subtle hover:border-wise-primary rounded-lg transition-colors text-left"
                >
                  <span className="font-semibold text-wise-primary capitalize">{provider}</span>
                  <p className="text-sm text-wise-muted">
                    {provider === 'jobber'
                      ? 'Field service & scheduling'
                      : provider === 'stripe'
                      ? 'Payments & billing'
                      : 'Custom integrations'}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => handleSkipStep(1)}
              className="w-full py-2 text-wise-muted hover:text-wise-primary transition-colors"
            >
              Skip for now
            </button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-wise-primary mb-6">Setup Billing</h2>
            <p className="text-wise-muted mb-4">Choose your plan and add payment method</p>
            <div className="space-y-3">
              {[
                { name: 'Starter', price: '$499', features: ['Up to 100 calls/month', 'Email support'] },
                { name: 'Pro', price: '$999', features: ['Up to 1000 calls/month', 'Priority support', 'Analytics'] },
                { name: 'Enterprise', price: 'Custom', features: ['Unlimited calls', 'Dedicated support'] },
              ].map((plan) => (
                <div
                  key={plan.name}
                  onClick={() => {
                    setFormData({ plan: plan.name });
                    handleStepComplete(2, { plan: plan.name, stripeCustomerId: 'pending' });
                  }}
                  className="p-4 border border-wise-subtle hover:border-wise-primary rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-wise-primary">{plan.name}</span>
                    <span className="text-wise-primary font-bold">{plan.price}</span>
                  </div>
                  <ul className="text-xs text-wise-muted space-y-1">
                    {plan.features.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-wise-primary mb-6">Configure Dashboard</h2>
            <p className="text-wise-muted mb-4">Choose your dashboard widgets and theme</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wise-primary mb-2">Theme</label>
                <select
                  value={formData.theme || 'dark'}
                  onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                  className="w-full px-3 py-2 bg-wise-surface border border-wise-subtle rounded-md text-wise-primary"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wise-primary mb-2">Widgets</label>
                <div className="space-y-2">
                  {['Calls', 'Bookings', 'Revenue', 'Analytics'].map((widget) => (
                    <label key={widget} className="flex items-center">
                      <input type="checkbox" defaultChecked className="mr-2" />
                      <span className="text-wise-primary">{widget}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleStepComplete(3, formData)}
                className="w-full py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-wise-primary mb-6">Enable AI Phone</h2>
            <p className="text-wise-muted mb-4">Configure your AI receptionist</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-wise-primary mb-2">
                  Greeting Message
                </label>
                <textarea
                  value={formData.greeting || 'Hello! Thanks for calling. How can I help you today?'}
                  onChange={(e) => setFormData({ ...formData, greeting: e.target.value })}
                  className="w-full px-3 py-2 bg-wise-surface border border-wise-subtle rounded-md text-wise-primary"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wise-primary mb-2">
                  Business Hours
                </label>
                <input
                  type="text"
                  placeholder="9:00 AM - 5:00 PM (Monday-Friday)"
                  className="w-full px-3 py-2 bg-wise-surface border border-wise-subtle rounded-md text-wise-primary"
                />
              </div>
              <button
                onClick={() => handleStepComplete(4, formData)}
                className="w-full py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-wise-primary mb-6">Launch!</h2>
            <p className="text-wise-muted mb-4">Everything is configured. Ready to go live?</p>
            <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg mb-4">
              <p className="text-green-500 font-semibold">✓ All steps complete!</p>
              <p className="text-sm text-wise-muted mt-1">Your AI Phone system is ready to handle calls</p>
            </div>
            <button
              onClick={() => {
                handleStepComplete(5, {});
                setTimeout(() => router.push('/dashboard'), 1000);
              }}
              disabled={loading}
              className="w-full py-3 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 text-wise font-bold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
            >
              {loading ? 'Launching...' : '🚀 Go Live'}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-wise flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((s) => (
              <div
                key={s.step}
                className={`flex flex-col items-center ${
                  s.step <= currentStep ? 'text-wise-primary' : 'text-wise-muted'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 font-bold text-lg ${
                    s.step < currentStep
                      ? 'bg-green-500 text-white'
                      : s.step === currentStep
                      ? 'bg-wise-primary text-wise'
                      : 'bg-wise-subtle text-wise-muted'
                  }`}
                >
                  {s.step < currentStep ? '✓' : s.step}
                </div>
                <span className="text-xs text-center font-medium">{s.name}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-2 bg-wise-subtle rounded overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-wise-primary to-green-500 transition-all"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-wise-surface rounded-lg p-8 border border-wise-subtle shadow-glow-blue-sm">
          {renderStepContent()}
        </div>

        {/* Step Indicator */}
        <div className="mt-6 text-center text-wise-muted text-sm">
          Step {currentStep} of {steps.length}
        </div>
      </div>
    </div>
  );
}
