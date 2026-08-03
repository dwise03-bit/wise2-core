'use client';

import { ChromeTitle, Button, HUDPanel, FeatureCard } from '@/components/enterprise';

export default function VideoStudioPage() {
  return (
    <main className="min-h-screen blueprint-bg">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-chaos-electric/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-8">
            <div className="text-sm text-chaos-ice font-mono mb-4 uppercase tracking-wider">WISE² VIDEO STUDIO</div>
            <div className="text-6xl md:text-7xl font-bold mb-6">
              <span className="chrome-text">Motion That</span>
              <br />
              <span className="text-chaos-ice">Captivates</span>
              <br />
              <span className="text-white">Converts</span>
            </div>
          </div>

          <p className="text-2xl text-chaos-ice font-mono mb-8 font-bold">
            Premium video content that stops the scroll and drives results.
          </p>

          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            WISE² Video Studio creates cinematic video content for brands, businesses, creators, and campaigns. From product videos to brand documentaries, explainer animations to social media reels—we produce video that performs. Human direction + AI acceleration = unlimited creative possibilities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Start a Video Project
            </Button>
            <Button variant="secondary" size="lg">
              Watch Our Work
            </Button>
          </div>

          <div className="text-sm text-gray-400 font-mono">
            Product Videos • Brand Films • Explainer Animation • Social Content • Motion Graphics • Reels & Shorts
          </div>
        </div>
      </section>

      {/* WHAT WE PRODUCE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Video That Performs
        </ChromeTitle>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Tell Your Story', desc: 'Authentic narratives that resonate.' },
            { title: 'Show Not Tell', desc: 'Visual demonstrations of value.' },
            { title: 'Capture Attention', desc: 'First 3 seconds that hook viewers.' },
            { title: 'Drive Action', desc: 'CTAs that convert viewers to customers.' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* VIDEO SHOWCASE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Video Portfolio
        </ChromeTitle>

        <HUDPanel className="mb-12">
          <div className="mb-8">
            <h3 className="text-chaos-ice font-mono text-sm font-bold mb-6 uppercase tracking-wider">Featured Videos (Coming Soon)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {['Product Demo', 'Brand Documentary', 'Explainer Video', 'Social Media Reel', 'Event Highlight', 'Commercial Ad'].map((video) => (
                <div key={video} className="aspect-video bg-black/50 rounded-sm border border-chaos-glow/20 flex items-center justify-center group cursor-pointer hover:border-chaos-ice/50 transition-colors">
                  <div className="text-center">
                    <div className="text-4xl text-chaos-ice/50 group-hover:text-chaos-ice/70 mb-2 transition-colors">▶</div>
                    <div className="text-sm text-gray-400">{video}</div>
                    <div className="text-xs text-gray-500 mt-2">Portfolio Coming Soon</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </HUDPanel>
      </section>

      {/* SERVICES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Video Services
        </ChromeTitle>

        <div className="space-y-6">
          {[
            {
              service: 'Product Videos',
              includes: ['Product demonstrations', 'Feature highlights', 'Use-case scenarios', 'Multiple angles', 'B-roll library', 'Call-to-action'],
            },
            {
              service: 'Brand Videos',
              includes: ['Brand story films', 'Company culture', 'Founder stories', 'Mission-driven narratives', 'Documentary style', 'Emotional connection'],
            },
            {
              service: 'Explainer Videos',
              includes: ['Animated explanations', 'Concept visualization', 'Process walkthroughs', 'Technical simplified', 'Icon animations', 'Voiceover ready'],
            },
            {
              service: 'Social Content',
              includes: ['Instagram Reels', 'TikTok videos', 'YouTube Shorts', 'LinkedIn videos', 'Facebook content', 'Multi-format optimization'],
            },
            {
              service: 'Event Videos',
              includes: ['Live event coverage', 'Highlight reels', 'Speaker recaps', 'Multi-camera production', 'Professional editing', 'Post-event content'],
            },
            {
              service: 'Commercial Ads',
              includes: ['30-60 second spots', 'Platform optimization', 'Multiple versions', 'Professional talent', 'Studio/location shooting', 'Full post-production'],
            },
          ].map(({ service, includes }) => (
            <HUDPanel key={service}>
              <h3 className="text-chaos-ice font-bold text-lg mb-4">{service}</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {includes.map((item) => (
                  <div key={item} className="text-sm text-gray-300 flex gap-2">
                    <span className="text-chaos-ice flex-shrink-0">→</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </HUDPanel>
          ))}
        </div>
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
              price: '$499–$999',
              features: [
                '30-60 second video',
                'Single location/setup',
                'Basic animations',
                'Professional voiceover',
                'Unlimited revisions',
                'Multiple formats',
              ],
              audience: 'Best for social media and small businesses',
            },
            {
              name: 'Professional',
              price: '$1,500–$3,500',
              features: [
                '2-3 minute video',
                'Multi-location shooting',
                'Professional motion graphics',
                'Voice + music + sound design',
                'Color grading & VFX',
                '5 revision rounds',
                'Multiple deliverables',
              ],
              audience: 'Best for product demos and brand videos',
            },
            {
              name: 'Premium',
              price: '$5,000–$15,000+',
              features: [
                'Feature-length production',
                'Full production team',
                'Cinematic color grading',
                'Advanced visual effects',
                'Custom original music',
                'Professional talent/actors',
                'Multi-day shooting',
                'Premium post-production',
              ],
              audience: 'Best for brand documentaries and commercials',
            },
            {
              name: 'Subscription',
              price: '$999–$2,999/mo',
              features: [
                'Monthly video allowance',
                'Social content creation',
                'Event coverage',
                'B-roll library building',
                'Priority scheduling',
                'Unlimited revisions',
                'Dedicated team',
              ],
              audience: 'Best for continuous content needs',
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
                Start Project
              </Button>
            </HUDPanel>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>*Starting estimates. Final scope, timeline, revisions, and ownership confirmed in project agreement.</p>
        </div>
      </section>

      {/* DELIVERABLES */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Standard Deliverables
        </ChromeTitle>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Master Footage', desc: 'Full edit in 4K + backup copies' },
            { title: 'Format Package', desc: 'All platform specifications included' },
            { title: 'Captions', desc: 'Burned-in or SRT subtitle files' },
            { title: 'B-Roll', desc: 'Unedited footage for repurposing' },
            { title: 'Sound Files', desc: 'Separate audio stems for mixing' },
            { title: 'Color Grade Preset', desc: 'LUT for consistent branding' },
            { title: 'Audio Mix', desc: 'Professional mixing and mastering' },
            { title: 'Motion Graphics', desc: 'Animated titles and transitions' },
            { title: 'Launch Support', desc: 'Optimization guidance for each platform' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* PRODUCTION PROCESS */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          The Production Journey
        </ChromeTitle>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Creative Brief & Planning', desc: 'Understand your vision, audience, and goals. Shot lists and storyboards.' },
            { step: 2, title: 'Concept Development', desc: 'Story direction, visual style, and animation concepts. Mood boards and animatics.' },
            { step: 3, title: 'Production & Shooting', desc: 'Professional crew, equipment, and locations. Multi-day shoots if needed.' },
            { step: 4, title: 'Post-Production & Editing', desc: 'Editing, color grading, sound design, VFX, motion graphics, and music.' },
            { step: 5, title: 'Revisions & Delivery', desc: 'Feedback rounds, final adjustments, and delivery in all required formats.' },
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
          <p>Human Direction + AI Acceleration: We combine professional production with AI tools to accelerate workflows while maintaining cinematic quality and creative vision.</p>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Who We Create For
        </ChromeTitle>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {['SaaS Companies', 'Ecommerce Brands', 'Startups', 'Agencies', 'Nonprofits', 'Creators', 'Enterprises', 'Events'].map((audience) => (
            <FeatureCard key={audience} title={audience} description={`Professional video for ${audience.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Production Technology
        </ChromeTitle>

        <HUDPanel className="text-center">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { category: 'CAMERAS', tools: '4K cinema cameras, drones, stabilizers' },
              { category: 'EDITING', tools: 'DaVinci Resolve, Premiere Pro, Final Cut' },
              { category: 'VFX & MOTION', tools: 'After Effects, Cinema 4D, Blender' },
              { category: 'AUDIO', tools: 'Adobe Audition, Izotope, Neve console' },
            ].map(({ category, tools }) => (
              <div key={category}>
                <div className="text-chaos-ice text-sm font-mono font-bold mb-2">{category}</div>
                <div className="text-xs text-gray-300">{tools}</div>
              </div>
            ))}
          </div>
        </HUDPanel>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 max-w-4xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Frequently Asked
        </ChromeTitle>

        <div className="space-y-6">
          {[
            { q: 'What video lengths do you produce?', a: '30 seconds to 60+ minutes. From short social clips to feature documentaries. Custom length based on your needs.' },
            { q: 'Do you shoot on-location?', a: 'Yes. We shoot in studio or on your locations. Travel expenses included in premium packages.' },
            { q: 'How long does production take?', a: 'Typically 2-8 weeks depending on scope. Starter videos (1-2 weeks), Professional (3-4 weeks), Premium (6-8 weeks).' },
            { q: 'Can you do live event coverage?', a: 'Absolutely. Multi-camera setups, real-time switching, post-event editing. Full event recap production available.' },
            { q: 'Do you provide voiceover?', a: 'Yes. Professional voiceover talent, multiple voice options, script writing, and localization available.' },
            { q: 'What about distribution and optimization?', a: 'We deliver for all platforms: YouTube, TikTok, Instagram, LinkedIn, TV, etc. All formats and specs handled.' },
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
          Ready to Bring Your Vision to Life?
        </ChromeTitle>
        <p className="text-lg text-gray-300 mb-8">
          Let's create video that captivates, converts, and lasts.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg">
            Start Your Project
          </Button>
          <Button variant="secondary" size="lg">
            Schedule a Consultation
          </Button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 border-t border-chaos-glow/30 max-w-6xl mx-auto">
        <div className="text-center text-sm text-gray-400">
          <p className="mb-4">WISE² Video Studio • Cinematic Production • Visual Storytelling • Content That Converts</p>
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
