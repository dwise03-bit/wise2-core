'use client';

import { ChromeTitle, Button, HUDPanel, FeatureCard } from '@/components/enterprise';

export default function SoundLabsPage() {
  return (
    <main className="min-h-screen blueprint-bg">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-chaos-electric/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-8">
            <div className="text-sm text-chaos-ice font-mono mb-4 uppercase tracking-wider">WISE² SOUND LABS</div>
            <div className="text-6xl md:text-7xl font-bold mb-6">
              <span className="chrome-text">Your Brand.</span>
              <br />
              <span className="text-chaos-ice">Your Sound.</span>
              <br />
              <span className="text-white">Your Legacy.</span>
            </div>
          </div>

          <p className="text-2xl text-chaos-ice font-mono mb-8 font-bold">
            We don't just make songs. We build anthems.
          </p>

          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            WISE² Sound Labs turns your story, company, event, or creative vision into original music and the visual content needed to launch it. Custom music • Commercial licensing • Visual content • Human-guided AI production.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Build My Anthem
            </Button>
            <Button variant="secondary" size="lg">
              Hear the Difference
            </Button>
          </div>
        </div>
      </section>

      {/* THE PROMISE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          What You Get
        </ChromeTitle>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Be Remembered', desc: 'Music that sticks. Sound that defines.' },
            { title: 'Sound Professional', desc: 'Commercial-grade production and licensing.' },
            { title: 'Own Your Campaign', desc: 'Content built for your brand, your way.' },
            { title: 'Launch Everywhere', desc: 'Multi-format, multi-platform, ready now.' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* AUDIO SHOWCASE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Hear the Sound
        </ChromeTitle>

        <HUDPanel className="mb-12">
          <div className="mb-8">
            <h3 className="text-chaos-ice font-mono text-sm font-bold mb-6 uppercase tracking-wider">Demo Tracks (Coming Soon)</h3>
            <div className="space-y-4">
              {['Brand Anthem', 'Jingle', 'Event Song', 'Artist Package', 'Sonic Logo'].map((track) => (
                <div key={track} className="flex items-center justify-between p-4 bg-black/50 rounded-sm border border-chaos-glow/20">
                  <div>
                    <div className="text-white font-semibold">{track}</div>
                    <div className="text-xs text-gray-400">Demo coming soon</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-chaos-blue/20 flex items-center justify-center">
                    <span className="text-chaos-ice">▶</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HUDPanel>
      </section>

      {/* PACKAGES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Choose Your Package
        </ChromeTitle>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: 'Starter',
              price: '$99–$199',
              features: [
                '30–60 second theme song',
                'Intro/outro version',
                'Commercial license',
                'Two revisions',
                'High-quality MP3/WAV',
              ],
              audience: 'Best for creators and small businesses',
            },
            {
              name: 'Business',
              price: '$399–$799',
              features: [
                'Full 2–3 minute song',
                'Instrumental version',
                'Social-media edits',
                'TikTok/Reels version',
                'Phone-hold or ad version',
                'Commercial-use license',
              ],
              audience: 'Best for businesses and brands',
            },
            {
              name: 'Premium',
              price: '$1,000–$5,000+',
              features: [
                'Custom song + interview',
                'Multiple genres/versions',
                'Sonic logo/audio brand',
                'Music or AI video',
                'TV, radio, or event edits',
                'Brand launch package',
                'Exclusive licensing',
              ],
              audience: 'Best for enterprise impact',
            },
            {
              name: 'Subscription',
              price: '$99–$299/mo',
              features: [
                'Monthly music allowance',
                'Holiday/event songs',
                'Social content',
                'Ads and Reels edits',
                'Priority support',
                'Flexible cancellation',
              ],
              audience: 'Best for recurring content',
            },
          ].map(({ name, price, features, audience }) => (
            <HUDPanel key={name} className="flex flex-col">
              <h3 className="text-chaos-ice font-bold text-lg mb-2">{name}</h3>
              <div className="text-2xl font-bold text-white mb-4">{price}</div>
              <ul className="text-sm text-gray-300 space-y-2 mb-6 flex-grow">
                {features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="text-chaos-ice flex-shrink-0">+</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gray-400 mb-4 italic">{audience}</div>
              <Button variant="primary" size="sm" className="w-full">
                Get Started
              </Button>
            </HUDPanel>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>*Starting estimates. Final scope, delivery, revisions, ownership, and licensing confirmed in order agreement.</p>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          What You Can Receive
        </ChromeTitle>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Original Song', desc: 'Custom composition for your brand' },
            { title: 'Lyric Video', desc: 'Animated text visualization' },
            { title: 'Cover Artwork', desc: 'Album/single artwork' },
            { title: 'Music Video', desc: 'AI-assisted or produced' },
            { title: 'Social Content Pack', desc: 'TikTok, Reels, YouTube shorts' },
            { title: 'Commercial License', desc: 'Use rights and legal terms' },
            { title: 'Sonic Logo', desc: 'Audio brand signature' },
            { title: 'Vocal Stems', desc: 'Isolated vocal tracks' },
            { title: 'Launch Support', desc: 'Distribution and promotion' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          The Production Journey
        </ChromeTitle>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Discovery & Brand Interview', desc: 'We learn your story, vision, and sonic DNA.' },
            { step: 2, title: 'Concept, Lyrics & Direction', desc: 'Collaborative creative direction and approval.' },
            { step: 3, title: 'Production, Vocals, Mixing & Mastering', desc: 'Professional recording and audio engineering.' },
            { step: 4, title: 'Visuals & Campaign Assets', desc: 'Video, artwork, and social-media content.' },
            { step: 5, title: 'Delivery, Approval & Launch Support', desc: 'Final files, licensing, and go-live help.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="glow-box rounded-sm p-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-chaos-blue/20 flex items-center justify-center">
                  <span className="text-chaos-ice font-bold">{step}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-chaos-ice font-bold mb-1">{title}</h3>
                  <p className="text-sm text-gray-300">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>AI + Human Creativity: Transparent production method ensuring quality and creative direction at every step.</p>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Who We Serve
        </ChromeTitle>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {['Creators', 'Brands', 'Businesses', 'Events', 'Podcasts', 'Fitness', 'Real Estate', 'Weddings'].map((audience) => (
            <FeatureCard key={audience} title={audience} description={`Custom music for ${audience.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Frequently Asked
        </ChromeTitle>

        <div className="space-y-6">
          {[
            { q: 'What do I need to get started?', a: 'Just your vision, brand story, and budget range. We handle the rest.' },
            { q: 'How long does production take?', a: 'Typically 2-4 weeks depending on package complexity. Rush delivery available.' },
            { q: 'Who owns the finished music?', a: 'You own the composition. Licensing terms detailed in your order agreement.' },
            { q: 'Can you match a specific genre or mood?', a: 'Yes, without copying existing artists. We create original work inspired by your references.' },
            { q: 'Are AI tools involved?', a: 'AI assists our process. All work is human-directed, approved, and professionally produced.' },
          ].map(({ q, a }) => (
            <HUDPanel key={q}>
              <h3 className="text-chaos-ice font-bold mb-3">{q}</h3>
              <p className="text-gray-300 text-sm">{a}</p>
            </HUDPanel>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-4 max-w-4xl mx-auto text-center">
        <ChromeTitle as="h2" className="text-4xl mb-6">
          Ready to Build Your Anthem?
        </ChromeTitle>
        <p className="text-lg text-gray-300 mb-8">
          Let's create something that can't be ignored.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg">
            Start My Project
          </Button>
          <Button variant="secondary" size="lg">
            Book a Discovery Call
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-chaos-glow/30 max-w-6xl mx-auto">
        <div className="text-center text-sm text-gray-400">
          <p className="mb-4">WISE² Sound Labs • Custom Music. Commercial Licensing. Human-Guided AI Production.</p>
          <div className="flex justify-center gap-6 text-xs">
            <a href="#" className="hover:text-chaos-ice">Privacy</a>
            <a href="#" className="hover:text-chaos-ice">Terms</a>
            <a href="#" className="hover:text-chaos-ice">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
