import { Navigation, Footer } from '@/components/wise';

const PLANS = [
  {
    id: 'STARTER',
    name: 'Starter',
    price: 29,
    description: 'Perfect for trying out WISE²',
    features: [
      'Up to 5 projects',
      'Basic branding package',
      'Email support',
      'Community access',
      'Monthly updates',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'PRO',
    name: 'Professional',
    price: 99,
    description: 'For growing businesses',
    features: [
      'Unlimited projects',
      'Premium branding package',
      'Priority email support',
      'Advanced analytics',
      'Custom integrations',
      'Weekly check-ins',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom development',
      '24/7 phone support',
      'White-label options',
      'SLA guarantee',
      'Security audit',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Simple, Transparent <span className="text-wise-accent-green">Pricing</span>
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              Choose the plan that fits your needs. Scale as you grow.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-wise-accent-green/20 to-wise-accent-green/5 border-2 border-wise-accent-green shadow-2xl scale-105'
                    : 'bg-wise-bg-secondary border-2 border-wise-accent-green/20 hover:border-wise-accent-green/40'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 bg-wise-accent-green text-wise-bg-primary px-4 py-1 rounded-bl-2xl font-bold text-sm">
                    POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-wise-text-secondary text-sm">{plan.description}</p>
                </div>

                <div className="mb-8">
                  {typeof plan.price === 'number' ? (
                    <>
                      <div className="text-5xl font-bold text-white inline">
                        ${plan.price}
                      </div>
                      <span className="text-wise-text-secondary ml-2">/month</span>
                    </>
                  ) : (
                    <div className="text-4xl font-bold text-wise-accent-green">
                      {plan.price}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (plan.id === 'ENTERPRISE') {
                      window.location.href = 'mailto:sales@wise2.net?subject=Enterprise Plan Inquiry';
                    } else {
                      window.location.href = `/checkout?plan=${plan.id}`;
                    }
                  }}
                  className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 mb-8 ${
                    plan.highlighted
                      ? 'bg-wise-accent-green text-wise-bg-primary hover:brightness-110 shadow-lg'
                      : 'bg-wise-accent-green/20 text-wise-accent-green border-2 border-wise-accent-green/40 hover:border-wise-accent-green/60'
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-wise-accent-green text-xl mt-1">✓</span>
                      <span className="text-wise-text-secondary">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto bg-wise-bg-secondary border-2 border-wise-accent-green/30 rounded-3xl p-8 md:p-12">
            <h2 className="text-4xl font-bold text-white mb-8 text-center">
              Common Questions
            </h2>

            <div className="space-y-8">
              {[
                {
                  q: 'Can I change plans anytime?',
                  a: 'Yes! Upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.',
                },
                {
                  q: 'Do you offer discounts for annual billing?',
                  a: 'We're adding annual billing soon with up to 20% savings. Contact sales for current options.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.',
                },
                {
                  q: 'Is there a free trial?',
                  a: 'Yes! Start a 14-day free trial on any plan. No credit card required to start.',
                },
              ].map((faq, idx) => (
                <div key={idx}>
                  <h4 className="text-lg font-bold text-white mb-2">{faq.q}</h4>
                  <p className="text-wise-text-secondary">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
