'use client';

import { ChromeTitle, Button, HUDPanel, FeatureCard } from '@/components/enterprise';

export default function DesignStudioPage() {
  return (
    <main className="min-h-screen blueprint-bg">
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-b from-chaos-electric/20 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-4xl text-center">
          <div className="mb-8">
            <div className="text-sm text-chaos-ice font-mono mb-4 uppercase tracking-wider">WISE² DESIGN STUDIO</div>
            <div className="text-6xl md:text-7xl font-bold mb-6">
              <span className="chrome-text">Design That</span>
              <br />
              <span className="text-chaos-ice">Commands</span>
              <br />
              <span className="text-white">Attention</span>
            </div>
          </div>

          <p className="text-2xl text-chaos-ice font-mono mb-8 font-bold">
            Visual identity that moves people to action.
          </p>

          <p className="text-lg text-gray-300 mb-12 max-w-2xl mx-auto">
            WISE² Design Studio creates premium visual experiences for brands, businesses, and creators. From logo systems to complete brand identities, campaigns, and digital assets—we design for impact. Human creativity + AI acceleration = unstoppable visual power.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button variant="primary" size="lg">
              Start a Design Project
            </Button>
            <Button variant="secondary" size="lg">
              View Portfolio
            </Button>
          </div>

          <div className="text-sm text-gray-400 font-mono">
            Brand Identity • Digital Design • Campaign Creative • UI/UX • Motion Graphics
          </div>
        </div>
      </section>

      {/* WHAT WE CREATE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          What We Create
        </ChromeTitle>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            { title: 'Brand Foundations', desc: 'Logo, color, typography, guidelines.' },
            { title: 'Visual Systems', desc: 'Cohesive design across all touchpoints.' },
            { title: 'Digital Assets', desc: 'Web, app, social, email, print-ready.' },
            { title: 'Campaign Design', desc: 'Ads, posters, social, video assets.' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* DESIGN SHOWCASE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Design Portfolio
        </ChromeTitle>

        <HUDPanel className="mb-12">
          <div className="mb-8">
            <h3 className="text-chaos-ice font-mono text-sm font-bold mb-6 uppercase tracking-wider">Featured Projects (Coming Soon)</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {['Brand Identity Case Study', 'Digital Product Design', 'Campaign Creative', 'UI Design System', 'Motion Graphics Reel', 'Print & Packaging'].map((project) => (
                <div key={project} className="aspect-video bg-black/50 rounded-sm border border-chaos-glow/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl text-chaos-ice/50 mb-2">▭</div>
                    <div className="text-sm text-gray-400">{project}</div>
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
          Design Services
        </ChromeTitle>

        <div className="space-y-6">
          {[
            {
              service: 'Logo & Brand Mark',
              includes: ['Concept exploration', '5+ concepts', 'Unlimited revisions', 'Final files (AI, PNG, SVG, PDF)', 'Color & B/W variants'],
            },
            {
              service: 'Brand Identity System',
              includes: ['Complete logo system', 'Color palette', 'Typography guidelines', 'Imagery style', '20-page brand guide', 'Digital + print templates'],
            },
            {
              service: 'Website Design',
              includes: ['UX research & wireframes', 'High-fidelity mockups', 'Responsive design', 'Interactive prototypes', 'Developer handoff specs', 'Asset delivery'],
            },
            {
              service: 'Campaign Design',
              includes: ['Creative concept', 'Multiple ad variations', 'Social media assets', 'Print collateral', 'Video/motion specs', 'A/B testing variants'],
            },
            {
              service: 'UI/UX Design',
              includes: ['User flows', 'Wireframes', 'Design system', 'High-fidelity UI', 'Interaction specs', 'Usability testing support'],
            },
            {
              service: 'Design System',
              includes: ['Component library', 'Design tokens', 'Documentation', 'Figma file setup', 'Developer specs', 'Future-proof architecture'],
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
              price: '$299–$499',
              features: [
                'Logo design',
                'Color palette',
                'Basic guidelines',
                'Digital files',
                'Unlimited revisions',
              ],
              audience: 'Best for freelancers and startups',
            },
            {
              name: 'Professional',
              price: '$999–$1,999',
              features: [
                'Complete brand identity',
                'Logo system',
                'Typography system',
                'Brand guidelines (10 pages)',
                'Digital + print templates',
                'Social media templates',
              ],
              audience: 'Best for established brands',
            },
            {
              name: 'Enterprise',
              price: '$2,500–$10,000+',
              features: [
                'Comprehensive brand system',
                'Design system & components',
                'Multiple deliverables',
                'Custom documentation',
                'Figma file setup',
                'Stakeholder workshops',
                'Implementation support',
              ],
              audience: 'Best for large organizations',
            },
            {
              name: 'Project-Based',
              price: 'Custom',
              features: [
                'Campaign design',
                'Website design',
                'App UI design',
                'Design system build',
                'Motion graphics',
                'Custom scope',
              ],
              audience: 'Best for specific projects',
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
            { title: 'Design Files', desc: 'Figma, Adobe files, source files' },
            { title: 'Export Formats', desc: 'PNG, SVG, PDF, AI, PSD, high-res' },
            { title: 'Specifications', desc: 'Developer handoff specs & markup' },
            { title: 'Brand Guidelines', desc: 'Digital PDF documentation' },
            { title: 'Templates', desc: 'Ready-to-use business templates' },
            { title: 'Style Guide', desc: 'Color, typography, spacing rules' },
            { title: 'Figma Workspace', desc: 'Organized, component-based files' },
            { title: 'Editable Mockups', desc: 'Smart objects and layers for future edits' },
            { title: 'Launch Support', desc: 'Implementation guidance and QA' },
          ].map(({ title, desc }) => (
            <FeatureCard key={title} title={title} description={desc} />
          ))}
        </div>
      </section>

      {/* DESIGN PROCESS */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          The Design Process
        </ChromeTitle>

        <div className="space-y-4">
          {[
            { step: 1, title: 'Discovery & Research', desc: 'Understand your brand, audience, and market. Competitive analysis and creative direction.' },
            { step: 2, title: 'Concepting & Exploration', desc: 'Multiple design directions. Mood boards. Wireframes. Initial concepts for feedback.' },
            { step: 3, title: 'Design & Refinement', desc: 'Develop preferred direction. Iterate based on feedback. Refine to perfection.' },
            { step: 4, title: 'Testing & Validation', desc: 'Test across devices, contexts, and audiences. Usability feedback. Final adjustments.' },
            { step: 5, title: 'Delivery & Implementation', desc: 'Final files in all formats. Guidelines documentation. Implementation support.' },
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
          <p>Human Creativity + AI Acceleration: We use design tools and AI to accelerate the creative process while maintaining artistic direction and quality.</p>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Who We Design For
        </ChromeTitle>

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {['Startups', 'Tech Companies', 'Agencies', 'Nonprofits', 'eCommerce', 'SaaS', 'Creators', 'Enterprises'].map((audience) => (
            <FeatureCard key={audience} title={audience} description={`Design solutions for ${audience.toLowerCase()}`} />
          ))}
        </div>
      </section>

      {/* TOOLS & TECH */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <ChromeTitle as="h2" className="text-4xl mb-12 text-center">
          Design Tools & Technology
        </ChromeTitle>

        <HUDPanel className="text-center">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { category: 'DESIGN', tools: 'Figma, Adobe CC, Sketch' },
              { category: 'PROTOTYPING', tools: 'Figma, Framer, Protopie' },
              { category: 'COLLABORATION', tools: 'Figma, Miro, Linear' },
              { category: 'HANDOFF', tools: 'Figma Specs, Zeplin, GitHub' },
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
            { q: 'How long does a project take?', a: 'Typical timelines: Logo (2-4 weeks), Brand Identity (4-8 weeks), Website Design (6-12 weeks). Rush delivery available upon request.' },
            { q: 'Can you match our brand style?', a: 'Yes. We research your brand, competitors, and audience to create designs that fit your vision while elevating it.' },
            { q: 'How many revisions are included?', a: 'Packages include unlimited revisions during the project. Post-delivery revisions are billed separately based on scope.' },
            { q: 'Who owns the designs?', a: 'You own all final designs and files. Copyright and usage rights detailed in your project agreement.' },
            { q: 'Can you handle accessibility?', a: 'Yes. We design for WCAG AA compliance, color blindness, and inclusive design principles across all deliverables.' },
            { q: 'Do you work with remote teams?', a: 'Absolutely. We use Figma, video calls, and collaborative tools to work seamlessly with distributed teams.' },
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
          Ready to Level Up Your Design?
        </ChromeTitle>
        <p className="text-lg text-gray-300 mb-8">
          Let's create visuals that command attention and drive results.
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
          <p className="mb-4">WISE² Design Studio • Brand Identity • Digital Design • Creative Direction</p>
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
