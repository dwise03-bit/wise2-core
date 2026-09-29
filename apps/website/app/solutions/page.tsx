import { Footer } from '@/components/wise';

export default function SolutionsPage() {
  return (
    <>
      <main className="bg-black min-h-screen pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-7xl font-bold font-display text-white mb-6">
              <span className="text-blue-500">Solutions</span> for Every Business
            </h1>
            <p className="text-xl text-gray-300">
              Tailored strategies to help your business grow and thrive.
            </p>
          </div>

          <div className="space-y-16">
            <section className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Brand Development</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                From concept to market-ready brand. We help you create a compelling brand identity that resonates with your audience.
              </p>
              <ul className="space-y-2">
                {['Logo & Visual Identity', 'Brand Guidelines', 'Marketing Materials', 'Brand Strategy'].map((item) => (
                  <li key={item} className="text-gray-300 flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">Web & App Development</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Custom digital solutions built with modern technology and best practices for performance and scalability.
              </p>
              <ul className="space-y-2">
                {['Web Design & Development', 'Mobile Apps', 'Cloud Integration', 'API Development'].map((item) => (
                  <li key={item} className="text-gray-300 flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-gray-900 border-2 border-blue-500/30 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-white mb-4">AI & Automation</h2>
              <p className="text-gray-300 leading-relaxed mb-6">
                Harness the power of artificial intelligence to automate processes, enhance decision-making, and accelerate growth.
              </p>
              <ul className="space-y-2">
                {['AI Integration', 'Process Automation', 'Data Analytics', 'Machine Learning Solutions'].map((item) => (
                  <li key={item} className="text-gray-300 flex items-center gap-2">
                    <span className="text-blue-500">✓</span> {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="text-center">
              <p className="text-gray-300 mb-8">Let's build something amazing together.</p>
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
