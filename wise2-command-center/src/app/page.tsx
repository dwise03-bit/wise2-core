import Image from "next/image";
import Link from "next/link";
import commandWorldMap from "../../public/wise2-command-world-map.png";
import "./home.css";

const IconArrow = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const IconWorld = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.6 2.45 4 5.45 4 9s-1.4 6.55-4 9c-2.6-2.45-4-5.45-4-9s1.4-6.55 4-9Z" />
  </svg>
);

const IconControl = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />
  </svg>
);

const IconSignal = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M5 15a7 7 0 0 1 14 0M8 18a4 4 0 0 1 8 0M12 21h.01M2 12a10 10 0 0 1 20 0" />
  </svg>
);

const IconCheckpoint = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24">
    <path d="M12 3 4 7v5c0 4.8 3.15 7.7 8 9 4.85-1.3 8-4.2 8-9V7l-8-4Z" />
    <path d="m8.5 12 2.25 2.25L15.75 9" />
  </svg>
);

const portals = [
  {
    eyebrow: "01 / OPERATING PICTURE",
    title: "Command World",
    description: "See companies, projects, opportunities, agents, and activity in one connected view.",
    href: "/dashboard",
    cta: "Open the world",
    icon: IconWorld,
    tone: "cyan",
  },
  {
    eyebrow: "02 / CONTROL SURFACE",
    title: "WOJI Control",
    description: "Issue approved commands with locks, checkpoints, permission gates, and a visible event trail.",
    href: "/woji",
    cta: "Enter WOJI",
    icon: IconControl,
    tone: "green",
  },
  {
    eyebrow: "03 / PROOF SPACE",
    title: "Demo Lab",
    description: "Explore working experiences and validate the next move before it reaches production.",
    href: "/demo",
    cta: "Explore demos",
    icon: IconSignal,
    tone: "gold",
  },
] as const;

const capabilities = [
  ["01", "Brand systems", "Every surface stays unmistakably WISE²."],
  ["02", "Customer intelligence", "Signals become clear next actions."],
  ["03", "Agent workflows", "Intent moves through guarded execution."],
  ["04", "Infrastructure", "The operating picture spans edge, cloud, and VPS."],
] as const;

export default function Home() {
  return (
    <main className="cc-shell">
      <a className="cc-skip-link" href="#main-content">Skip to command center</a>

      <div className="cc-grid" aria-hidden="true" />
      <div className="cc-aurora cc-aurora-cyan" aria-hidden="true" />
      <div className="cc-aurora cc-aurora-green" aria-hidden="true" />

      <header className="cc-header">
        <Link href="/" className="cc-brand" aria-label="WISE² Command Center home">
          <span className="cc-brand-mark">W²</span>
          <span>
            <strong>WISE²</strong>
            <small>Command Center</small>
          </span>
        </Link>

        <nav className="cc-nav" aria-label="Primary navigation">
          <Link href="/dashboard">Command World</Link>
          <Link href="/woji">WOJI</Link>
          <Link href="/demo">Demo Lab</Link>
        </nav>

        <div className="cc-availability" aria-label="Command Center is available">
          <span aria-hidden="true" />
          Command Center live
        </div>
      </header>

      <section className="cc-hero" id="main-content">
        <div className="cc-hero-copy">
          <p className="cc-kicker"><span /> Business operating system / 01</p>
          <h1>
            Move the whole
            <span>business as one.</span>
          </h1>
          <p className="cc-intro">
            One synchronized command surface for brand, customers, automation, content, and intelligence.
            See the signal. Make the call. Keep moving.
          </p>

          <div className="cc-actions">
            <Link href="/dashboard" className="cc-button cc-button-primary">
              Enter Command World <IconArrow />
            </Link>
            <Link href="/woji" className="cc-button cc-button-secondary">
              Open WOJI control <IconControl />
            </Link>
          </div>

          <dl className="cc-proof-strip" aria-label="Command Center principles">
            <div><dt>Unified</dt><dd>operating view</dd></div>
            <div><dt>Human</dt><dd>approval gates</dd></div>
            <div><dt>Verified</dt><dd>progress only</dd></div>
          </dl>
        </div>

        <Link href="/dashboard" className="cc-world-frame" aria-label="Open WISE² Command World">
          <div className="cc-world-image">
            <Image
              src={commandWorldMap}
              alt="Illustrated WISE² Command World connecting operations, agents, sales, creative, and partners"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 58vw"
            />
          </div>
          <div className="cc-world-shade" aria-hidden="true" />
          <div className="cc-world-topline">
            <span><i /> Context engine</span>
            <strong>Explore the operating picture</strong>
          </div>
          <div className="cc-world-caption">
            <span className="cc-icon"><IconWorld /></span>
            <span><small>WISE² / COMMAND WORLD</small><strong>Everything connected.</strong></span>
            <span className="cc-frame-arrow"><IconArrow /></span>
          </div>
        </Link>
      </section>

      <section className="cc-signal-bar" aria-label="WOJI operating contract">
        <div><span className="cc-icon"><IconSignal /></span><p><small>Signal</small><strong>One operating picture</strong></p></div>
        <div><span className="cc-icon"><IconControl /></span><p><small>Control</small><strong>Permission-gated action</strong></p></div>
        <div><span className="cc-icon"><IconCheckpoint /></span><p><small>Memory</small><strong>Locks and checkpoints</strong></p></div>
        <div className="cc-signal-note"><small>Core principle</small><strong>No invented progress.</strong></div>
      </section>

      <section className="cc-section cc-portals-section">
        <div className="cc-section-heading">
          <div>
            <p className="cc-kicker"><span /> Start anywhere</p>
            <h2>Turn intent into motion.</h2>
          </div>
          <p>Each entry point shares the same command language, operational context, and verification standard.</p>
        </div>

        <div className="cc-portals">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <Link href={portal.href} key={portal.title} className={`cc-portal cc-portal-${portal.tone}`}>
                <div className="cc-portal-top">
                  <span className="cc-icon"><Icon /></span>
                  <small>{portal.eyebrow}</small>
                </div>
                <h3>{portal.title}</h3>
                <p>{portal.description}</p>
                <span className="cc-portal-link">{portal.cta} <IconArrow /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="cc-section cc-capabilities-section">
        <div className="cc-section-heading">
          <div>
            <p className="cc-kicker"><span /> Integrated capabilities</p>
            <h2>One system. Many levers.</h2>
          </div>
          <p>The visual layer stays cinematic. The operational layer stays legible, guarded, and real.</p>
        </div>

        <div className="cc-capabilities">
          {capabilities.map(([number, title, description]) => (
            <article key={title}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="cc-footer">
        <span>WISE² Command Center / 2026</span>
        <strong>Built to move at the speed of intent.</strong>
      </footer>
    </main>
  );
}
