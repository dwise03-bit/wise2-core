import { Navigation, Footer } from '@/components/wise';

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="bg-wise-bg-primary min-h-screen pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              Pricing Plans
            </h1>
            <p className="text-xl text-wise-text-secondary max-w-3xl mx-auto">
              Choose the perfect plan for your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-wise-bg-secondary border-2 border-wise-accent-green/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-wise-text-secondary text-sm mb-6">Perfect for getting started</p>
              <p className="text-4xl font-bold text-white mb-8">$29<span className="text-lg">/mo</span></p>
              <button className="w-full py-3 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold mb-8">
                Get Started
              </button>
              <ul className="space-y-3 text-sm text-wise-text-secondary">
                <li>check 5 projects</li>
                <li>check Basic support</li>
                <li>check Community access</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-wise-accent-green/20 to-wise-accent-green/5 border-2 border-wise-accent-green rounded-3xl p-8 scale-105">
              <div className="absolute top-0 right-0 bg-wise-accent-green text-wise-bg-primary px-4 py-1 rounded-bl-2xl font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-wise-text-secondary text-sm mb-6">For growing businesses</p>
              <p className="text-4xl font-bold text-white mb-8">$99<span className="text-lg">/mo</span></p>
              <button className="w-full py-3 bg-wise-accent-green text-wise-bg-primary rounded-lg font-bold mb-8">
                Start Trial
              </button>
              <ul className="space-y-3 text-sm text-wise-text-secondary">
                <li>check Unlimited projects</li>
                <li>check Priority support</li>
                <li>check Advanced features</li>
              </ul>
            </div>

            <div className="bg-wise-bg-secondary border-2 border-wise-accent-green/20 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-wise-text-secondary text-sm mb-6">Custom solutions</p>
              <p className="text-4xl font-bold text-wise-accent-green mb-8">Custom</p>
              <button className="w-full py-3 bg-wise-accent-green/20 text-wise-accent-green border-2 border-wise-accent-green/40 rounded-lg font-bold mb-8">
                Contact Us
              </button>
              <ul className="space-y-3 text-sm text-wise-text-secondary">
                <li>check Everything in Pro</li>
                <li>check Dedicated support</li>
                <li>check Custom features</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
