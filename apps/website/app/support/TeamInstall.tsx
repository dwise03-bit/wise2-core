import {
  ArrowRight,
  Download,
  RefreshCw,
  Smartphone,
  Wifi,
  Monitor,
  Shield,
} from 'lucide-react';
import type { TeamApp, TeamAppBuild } from '@/lib/team-apps';

interface PublishedBuild extends TeamAppBuild {
  url: string;
  available: boolean;
  size: number | null;
  updatedAt: string | null;
}

interface PublishedApp extends TeamApp {
  builds: PublishedBuild[];
}

const FLOW = [
  { label: 'Build on Mac', detail: 'Archive the iOS app in Xcode' },
  { label: 'Export .ipa', detail: 'Save a SideStore-ready package' },
  { label: 'SideStore', detail: 'Install and auto-refresh on iPhone' },
  { label: 'Install wireless', detail: 'Same Wi-Fi for the first pairing' },
  { label: 'WISE² ready', detail: 'App appears on the home screen' },
];

const DEV_STEPS = [
  'Open the iOS project in Xcode.',
  'Product → Archive using the Release configuration.',
  'Distribute App → Export a development .ipa.',
  'Run ./scripts/ios/publish-team-ipa.sh <app> so it lands on wise2.net/support.',
];

const TEAM_STEPS = [
  {
    title: 'Install SideStore',
    body: 'On iPhone, open sidestore.io and follow the SideStore setup. This is required once.',
    href: 'https://sidestore.io',
    cta: 'Open sidestore.io',
  },
  {
    title: 'Pair to a Mac',
    body: 'Keep the iPhone and the pairing Mac on the same Wi-Fi for the first pairing. SideStore uses that link to sign apps.',
  },
  {
    title: 'Download the .ipa',
    body: 'Tap Download iPhone app below. Save the file, then open SideStore → My Apps → Install.',
  },
  {
    title: 'Open and go',
    body: 'The WISE² app appears on the home screen. SideStore refreshes the 7-day signature in the background.',
  },
];

function formatBytes(size: number | null): string | null {
  if (!size) return null;
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUpdated(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export function TeamInstall({ apps }: { apps: PublishedApp[] }) {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <section className="border-b border-[#D6A331]/20 px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D6A331]">
            WISE² Team App Install
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
            Download the apps. Install wireless. Stay on the same system.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#B7C0CB]">
            No App Store listing required. Grab the latest .ipa here, install it with SideStore, and keep working on iPhone.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#apps"
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#D6A331] px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[#050505] transition hover:bg-[#f0c15a]"
            >
              Download apps
              <Download size={16} aria-hidden="true" />
            </a>
            <a
              href="https://sidestore.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-[#D6A331]/50 bg-white/5 px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white transition hover:border-[#D6A331] hover:bg-[#D6A331]/10"
            >
              Get SideStore
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-10 sm:px-6 lg:px-8">
        <ol className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-5">
          {FLOW.map((step, index) => (
            <li
              key={step.label}
              className="relative border border-[#D6A331]/25 bg-[#0B0B0B] px-4 py-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D6A331]">
                {String(index + 1).padStart(2, '0')}
              </p>
              <p className="mt-2 text-sm font-bold">{step.label}</p>
              <p className="mt-1 text-xs leading-5 text-[#8FA0AE]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="apps" className="scroll-mt-24 border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D6A331]">Team downloads</p>
          <h2 className="mt-3 text-3xl font-black">Install in minutes</h2>
          <p className="mt-3 max-w-2xl text-[#AEB8C3]">
            Download on this phone, then install from SideStore → My Apps. Android packages install directly.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {apps.map((app) => (
              <article key={app.id} className="border border-white/10 bg-[#0B0B0B] p-6">
                <h3 className="text-xl font-bold">{app.name}</h3>
                <p className="mt-2 text-sm leading-6 text-[#AEB8C3]">{app.tagline}</p>
                <div className="mt-5 flex flex-col gap-3">
                  {app.builds.map((build) => {
                    const sizeLabel = formatBytes(build.size);
                    const updatedLabel = formatUpdated(build.updatedAt);
                    return (
                      <div key={build.filename}>
                        {build.available ? (
                          <a
                            href={build.url}
                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#D6A331] px-4 text-sm font-bold uppercase tracking-[0.12em] text-[#050505] transition hover:bg-[#f0c15a]"
                          >
                            <Download size={16} aria-hidden="true" />
                            {build.label}
                          </a>
                        ) : (
                          <p className="inline-flex min-h-12 w-full items-center justify-center border border-white/15 px-4 text-center text-sm font-semibold text-[#8FA0AE]">
                            {build.label} (awaiting publish)
                          </p>
                        )}
                        <p className="mt-2 text-xs text-[#6F7D89]">
                          {build.minOs}
                          {sizeLabel ? ` · ${sizeLabel}` : ''}
                          {updatedLabel ? ` · ${updatedLabel}` : ''}
                        </p>
                      </div>
                    );
                  })}
                  {app.webUrl ? (
                    <a
                      href={app.webUrl}
                      className="text-sm font-semibold text-[#D6A331] underline-offset-4 hover:underline"
                    >
                      Open in browser
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-[#D6A331]">
              <Monitor size={18} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">On your Mac</p>
            </div>
            <h2 className="mt-3 text-2xl font-black">Build once</h2>
            <ol className="mt-6 space-y-4">
              {DEV_STEPS.map((step, index) => (
                <li key={step} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#D6A331]/40 text-sm font-bold text-[#D6A331]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-[#DCE7EF]">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[#D6A331]">
              <Smartphone size={18} aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-[0.28em]">On iPhone</p>
            </div>
            <h2 className="mt-3 text-2xl font-black">Team install</h2>
            <ol className="mt-6 space-y-5">
              {TEAM_STEPS.map((step, index) => (
                <li key={step.title} className="border border-white/10 bg-[#0B0B0B] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D6A331]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-1 font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#AEB8C3]">{step.body}</p>
                  {'href' in step && step.href ? (
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#D6A331]"
                    >
                      {step.cta}
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-3">
          <article className="border border-[#D6A331]/30 bg-[#D6A331]/10 p-6">
            <RefreshCw className="text-[#D6A331]" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">7-day auto-refresh</h2>
            <p className="mt-3 text-sm leading-6 text-[#DCE7EF]">
              Free Apple IDs expire app signatures every 7 days. SideStore re-signs in the background so the team does not reinstall by hand.
            </p>
          </article>
          <article className="border border-white/10 bg-[#0B0B0B] p-6">
            <Wifi className="text-[#D6A331]" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">What you need</h2>
            <ul className="mt-3 space-y-2 text-sm text-[#AEB8C3]">
              <li>iPhone on iOS 14 or later</li>
              <li>SideStore and a free Apple ID</li>
              <li>The .ipa from this page</li>
              <li>Same Wi-Fi as the pairing Mac, first time only</li>
              <li>Android 10+ for Field Tech APKs</li>
            </ul>
          </article>
          <article className="border border-white/10 bg-[#0B0B0B] p-6">
            <Shield className="text-[#D6A331]" size={28} aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black">Need a hand?</h2>
            <p className="mt-3 text-sm leading-6 text-[#AEB8C3]">
              Paid Apple Developer accounts skip the 7-day limit. For install help, email support or hop in Discord.
            </p>
            <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
              <a href="mailto:support@wise2.net" className="text-[#D6A331]">
                support@wise2.net
              </a>
              <a href="https://discord.gg/wise2" target="_blank" rel="noopener noreferrer" className="text-[#D6A331]">
                discord.gg/wise2
              </a>
            </div>
          </article>
        </div>
        <p className="mx-auto mt-10 max-w-6xl text-center text-xs uppercase tracking-[0.22em] text-[#6F7D89]">
          One team. One system. WISE² everything.
        </p>
      </section>
    </main>
  );
}
