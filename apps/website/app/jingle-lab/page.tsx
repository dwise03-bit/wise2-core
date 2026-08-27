'use client';

import Link from 'next/link';
import { Footer } from '@/components/wise';
import { ArrowRight, Music, Zap, Users, Sparkles, CheckCircle2, Volume2, Download, Waveform } from 'lucide-react';
import { motion } from 'framer-motion';

// ─── Stats Section ────────────────────────────────────────────────────────────

function StatsSection() {
  const stats = [
    { n: '10K+', label: 'Jingles Created' },
    { n: '500+', label: 'Studios & Agencies' },
    { n: '99%', label: 'Uptime SLA' },
  ];

  return (
    <div className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="text-center">
              <p className="text-4xl font-black text-[#0094FF] sm:text-5xl">{stat.n}</p>
              <p className="mt-2 text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Feature Card ────────────────────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-[#090C10] p-6">
      <Icon className="h-6 w-6 text-[#8EDBFF]" />
      <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#B7C0CB]">{description}</p>
    </motion.div>
  );
}

// ─── Template Card ────────────────────────────────────────────────────────────

function TemplateCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="rounded-xl border border-white/10 bg-[#090C10] p-6 text-center hover:bg-[#0d1218] transition-colors">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm text-[#B7C0CB]">{description}</p>
    </motion.div>
  );
}

// ─── Pricing Card ────────────────────────────────────────────────────────────

function PricingCard({ tier, price, description, features, cta, highlighted }: { tier: string; price: string; description: string; features: string[]; cta: string; highlighted?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-8 transition-all ${highlighted ? 'border-2 border-[#0094FF] bg-[#0d1218] ring-2 ring-[#0094FF]/20' : 'border border-white/10 bg-[#090C10]'}`}
    >
      <h3 className="text-2xl font-black text-white">{tier}</h3>
      <p className="mt-2 text-sm text-gray-400">{description}</p>
      <p className="mt-4 text-3xl font-black text-[#0094FF]">
        {price}
        <span className="text-xs text-gray-400 ml-1">/month</span>
      </p>
      <button className={`mt-6 w-full py-3 rounded-lg font-bold transition-all ${highlighted ? 'bg-[#0094FF] text-white hover:bg-[#0066FF]' : 'bg-[#111] text-gray-300 hover:bg-[#1a1a1a]'}`}>{cta}</button>
      <ul className="mt-8 space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
            <CheckCircle2 size={16} className="text-[#0094FF] flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JingleLab() {
  return (
    <>
      <main className="min-h-screen bg-[#050607] text-white">
        {/* HERO */}
        <section className="relative border-b border-white/10 bg-[#050607]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(142,219,255,0.14),rgba(242,182,50,0.07)_34%,rgba(5,6,7,0)_66%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="max-w-3xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#8EDBFF]">Professional Audio Branding</p>
              <h1 className="text-5xl font-black leading-[0.93] text-white sm:text-6xl lg:text-7xl">Create Broadcast-Quality Jingles in Minutes</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#D4DAE2] sm:text-lg">
                WISE² Jingle Lab generates custom jingles, audio logos, and sonic branding for your business. AI-powered creation. Studio-quality audio. Zero production experience needed.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/studio" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#DCE7EF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050607] transition duration-200 hover:-translate-y-0.5 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#8EDBFF] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  Launch Studio
                  <ArrowRight size={16} />
                </Link>
                <Link href="#how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#0094FF] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#0094FF] transition duration-200 hover:bg-[#0094FF]/10 focus:outline-none focus:ring-2 focus:ring-[#0094FF] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  See How It Works
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <StatsSection />

        {/* VALUE PROPOSITIONS */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Why Choose Jingle Lab</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <FeatureCard icon={Zap} title="10x Faster" description="Generate broadcast-quality jingles in seconds, not weeks. Stop waiting for expensive composers." />
              <FeatureCard icon={Music} title="100% Customizable" description="Full control over style, tempo, instrumentation, and lyrics. Make it perfectly match your brand." />
              <FeatureCard icon={Users} title="Unlimited Revisions" description="Iterate instantly. Create dozens of variations until you find the perfect sound." />
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Your Jingle in 4 Steps</h2>
            <div className="mt-12 space-y-8">
              {[
                { n: '1', title: 'Describe Your Vision', desc: 'Tell us about your brand, desired tone, style, and target audience.' },
                { n: '2', title: 'AI Generates Options', desc: 'Our AI creates 3–5 unique jingle variations in seconds.' },
                { n: '3', title: 'Customize & Refine', desc: 'Adjust lyrics, melody, instruments, tempo, or blend variations together.' },
                { n: '4', title: 'Export & Deploy', desc: 'Download in MP3, WAV, AAC, or FLAC. Ready for radio, TV, podcasts, and social.' },
              ].map(({ n, title, desc }, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 md:gap-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,148,255,0.1))' }}>
                    <span className="text-2xl font-black text-[#0094FF]">{n}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <p className="mt-2 text-base text-[#B7C0CB]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TEMPLATES & INSPIRATION */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">200+ Professional Templates</h2>
            <p className="mt-4 max-w-2xl text-gray-400">Start with any template or build from scratch. Every style is fully customizable.</p>
            <div className="mt-12 grid gap-6 md:grid-cols-4">
              {[
                { icon: '🎙️', title: 'Upbeat & Fun', desc: 'Tech startups, lifestyle brands' },
                { icon: '🎵', title: 'Corporate Pro', desc: 'Finance, consulting, B2B' },
                { icon: '✨', title: 'Luxury & Premium', desc: 'High-end, sophisticated brands' },
                { icon: '🎸', title: 'Rock & Alternative', desc: 'Bold, energetic, cutting-edge' },
                { icon: '🎼', title: 'Retro & Nostalgic', desc: 'Vintage vibes, classic sounds' },
                { icon: '🌍', title: 'World & Ethnic', desc: 'Global instruments & styles' },
                { icon: '🎮', title: 'Gaming & Esports', desc: 'High-energy, futuristic sounds' },
                { icon: '💿', title: 'Lo-Fi & Chill', desc: 'Ambient, relaxed soundscapes' },
              ].map((t, i) => (
                <TemplateCard key={i} icon={t.icon} title={t.title} description={t.desc} />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Powerful Professional Features</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={Music} title="AI Music Generation" description="Compose original melodies, harmonies, and arrangements. Powered by advanced generative AI." />
              <FeatureCard icon={Volume2} title="Lyric Editor" description="Write, edit, and regenerate lyrics with AI assistance. Full syllable-by-syllable control." />
              <FeatureCard icon={Waveform} title="Style Transfer" description="Transform any jingle into different genres, tempos, or instrumentation instantly." />
              <FeatureCard icon={Download} title="Multi-Format Export" description="Download in MP3, WAV, AAC, OGG, FLAC, and MIDI. All broadcast-quality formats." />
              <FeatureCard icon={CheckCircle2} title="Version Control" description="Track all changes. Revert to previous versions. Approve and finalize with confidence." />
              <FeatureCard icon={Users} title="Team Collaboration" description="Invite team members. Share drafts. Gather feedback. Approve versions together." />
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 max-w-2xl text-gray-400">No contracts. Cancel anytime. All plans include unlimited jingles and full commercial rights.</p>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <PricingCard
                tier="Creator"
                price="$29"
                description="For freelancers and independent creators"
                features={['Unlimited jingles/month', 'All 200+ templates', 'AI music generation', 'Cloud storage (50GB)', 'Export MP3, WAV, AAC', 'Email support', 'Commercial rights included']}
                cta="Start Free Trial"
              />
              <PricingCard
                tier="Studio Pro"
                price="$99"
                description="For production studios and agencies"
                features={['Everything in Creator', 'Team collaboration (5 users)', 'Client sharing & feedback', 'Advanced AI models', 'Priority exports', 'Phone & chat support', 'Cloud storage (500GB)', 'API access (beta)']}
                cta="Start Free Trial"
                highlighted
              />
              <PricingCard
                tier="Enterprise"
                price="Custom"
                description="For large organizations and enterprises"
                features={['Unlimited everything', 'White-label platform', 'Unlimited team members', 'Unlimited cloud storage', 'Custom AI training', 'Dedicated support', 'SLA guarantee', 'Advanced analytics & reporting']}
                cta="Book a Demo"
              />
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="border-b border-white/10 bg-[#0A0E12] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Trusted by 500+ Studios Worldwide</h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  quote: '"Jingle Lab cut our production time from 3 weeks to 3 hours. Clients love the speed."',
                  author: 'Sarah Chen',
                  role: 'Creative Director, NYC Production House',
                },
                {
                  quote: '"The AI suggestions are genuinely good. We use them as starting points for custom work."',
                  author: 'Marcus Johnson',
                  role: 'Sound Engineer, LA Music Studio',
                },
                {
                  quote: '"Best investment for our workflow. ROI paid for itself in the first month."',
                  author: 'Jessica Williams',
                  role: 'Studio Owner, Austin Music Co.',
                },
              ].map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-white/10 bg-[#090C10] p-8">
                  <p className="text-lg italic text-gray-300">{t.quote}</p>
                  <div className="mt-6">
                    <p className="font-semibold text-white">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">Questions</h2>
            <div className="mt-12 space-y-6">
              {[
                {
                  q: 'Can I use these jingles commercially?',
                  a: 'Yes. All jingles created in Jingle Lab are yours to use commercially. You get full licensing rights with every plan.',
                },
                {
                  q: 'Do I need music production experience?',
                  a: 'Not at all. Jingle Lab is designed for creators with zero experience. Just describe your brand and the AI handles the rest.',
                },
                {
                  q: 'Can my team collaborate?',
                  a: 'Yes. Studio Pro and Enterprise plans support unlimited team members, shared projects, and real-time feedback.',
                },
                {
                  q: 'What file formats are supported?',
                  a: 'Export in MP3, WAV, AAC, OGG, FLAC, and MIDI. All formats are broadcast-quality and ready for any platform.',
                },
                {
                  q: 'Can I edit jingles after exporting?',
                  a: 'Yes. All jingles remain editable in your project library. You can re-open and modify them anytime.',
                },
                {
                  q: 'What if I don\'t like the generated options?',
                  a: 'You can regenerate unlimited times. Every regeneration creates new options. You can also customize parameters before generating.',
                },
              ].map(({ q, a }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-[#0A0E12] p-6">
                  <h3 className="text-lg font-bold text-white">{q}</h3>
                  <p className="mt-2 text-sm text-[#B7C0CB]">{a}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0066FF]/15 to-[#00AAFF]/5 p-8 text-center sm:p-12">
              <h2 className="text-3xl font-black text-white">Create Your First Jingle Today</h2>
              <p className="mt-3 text-base leading-7 text-gray-300">Try free for 7 days. No credit card. Full access to all features and templates.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link href="/studio" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#0094FF] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0066FF] focus:outline-none focus:ring-2 focus:ring-[#0094FF] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  Launch Studio
                  <ArrowRight size={16} />
                </Link>
                <Link href="/consulting" className="inline-flex min-h-12 items-center justify-center gap-2 border-2 border-[#0094FF] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#0094FF] transition hover:bg-[#0094FF]/10 focus:outline-none focus:ring-2 focus:ring-[#0094FF] focus:ring-offset-2 focus:ring-offset-[#050607]">
                  Book Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
