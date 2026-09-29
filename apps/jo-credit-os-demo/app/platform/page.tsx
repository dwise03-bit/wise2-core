import { Footer } from '@/components/wise';

export default function PlatformPage() {
  return (
    <>
      <main className="bg-black min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              WISE² <span className="text-blue-500">Platform</span>
            </h1>
            <p className="text-xl text-gray-300">
              The Command Center for all your business needs.
            </p>
          </div>

          <div className="space-y-16">
            <section className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Core Features</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                WISE² provides an integrated platform for managing your business operations, from brand creation to AI-powered automation.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['AI Automation', 'Business Intelligence', 'Workflows'].map((item) => (
                  <div
                    key={item}
                    className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center"
                  >
                    <p className="text-white font-bold">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-6">Capabilities</h2>
              <div className="space-y-4">
                {[
                  { name: 'Dashboard', desc: 'Real-time business metrics and KPIs' },
                  { name: 'Automation', desc: 'Streamline workflows and processes' },
                  { name: 'Analytics', desc: 'Deep insights into your business' },
                  { name: 'Integration', desc: 'Connect with your favorite tools' },
                ].map((item) => (
                  <div key={item.name} className="flex gap-4 pb-4 border-b border-gray-700">
                    <div className="text-blue-500 font-bold min-w-24">{item.name}</div>
                    <div className="text-gray-300">{item.desc}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="text-center">
              <p className="text-gray-300 mb-8">Ready to transform your business?</p>
              <a
                href="/start-your-build"
                className="inline-block px-12 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition-all"
              >
                ✦ Start Your Build
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
