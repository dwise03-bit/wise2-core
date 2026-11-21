import type { Metadata } from 'next';
import './victory-lap.css';

export const metadata: Metadata = {
  title: 'Victory Lap | Brick by Brick | WISE²',
  description: 'Daniel and Darrin Wise Jr. are building WISE² Business OS, one verified system at a time.',
  alternates: { canonical: 'https://wise2.net/victory-lap' },
};

const gates = [
  ['01', 'Validate', 'Buyer interviews, workflow evidence, and a defined outcome.'],
  ['02', 'Form', 'Entity, founder agreement, ownership, IP, and bank evidence.'],
  ['03', 'Build safely', 'Architecture, data rights, security, evaluations, and restore tests.'],
  ['04', 'Pilot', 'Signed design partners, baseline metrics, and acceptance criteria.'],
  ['05', 'Launch', 'Pricing, billing, privacy, support, and cross-functional signoff.'],
  ['06', 'Scale', 'Repeatable onboarding, unit economics, and governance.'],
];

const tracks = [
  ['229', 'Dog & Pony Show', 'Demo runbook and presentation', 'https://github.com/dwise03-bit/wise2-core/issues/229'],
  ['232', 'Uncle Steve audit', 'Workbook and evidence gates', 'https://github.com/dwise03-bit/wise2-core/issues/232'],
  ['233', 'Marathon doctrine', 'Ownership and operating principles', 'https://github.com/dwise03-bit/wise2-core/issues/233'],
  ['234', 'Victory Lap', 'Build map and evidence lifecycle', 'https://github.com/dwise03-bit/wise2-core/issues/234'],
];

export default function VictoryLapPage() {
  return <main className="vl">
    <div className="vl-noise" aria-hidden="true" />
    <div className="vl-topbar"><a className="vl-brand" href="/" aria-label="WISE² home">WISE<span>²</span></a><div className="vl-toplinks"><a href="#founders">Founders</a><a href="#gates">Launch gates</a><a href="#workstreams">Workstreams</a></div><a className="vl-topcta" href="https://github.com/dwise03-bit/wise2-core/issues/234">Track the build ↗</a></div>
    <section className="vl-hero" aria-labelledby="vl-title"><div className="vl-orbit" aria-hidden="true"><i/><i/><i/></div><div className="vl-hero-inner"><p className="vl-kicker"><span className="vl-pulse"/> WISE² / FIELD NOTES 001</p><h1 id="vl-title">VICTORY <em>LAP.</em></h1><p className="vl-hero-sub">BRICK BY BRICK<span className="vl-line"/></p><p className="vl-lead">A business operating system built to earn every green light. Real work. Clear ownership. Proof before promises.</p><div className="vl-actions"><a className="vl-button" href="#gates">Explore the launch gates <span>↘</span></a><a className="vl-textlink" href="#workstreams">See the workstreams ↗</a></div></div><div className="vl-hero-foot"><span>THE MARATHON CONTINUES</span><span>SCROLL TO DISCOVER ↓</span></div></section>
    <section className="vl-section vl-intro" id="founders"><div className="vl-section-head"><p className="vl-eyebrow">01 / THE FOUNDERS</p><h2>Two brothers.<br/><em>One long game.</em></h2></div><div className="vl-founder-grid"><article className="vl-founder"><span className="vl-founder-index">COFOUNDER / 01</span><div className="vl-monogram" aria-hidden="true">D<span>W</span></div><h3>Daniel Wise</h3><p>Code, systems, and deployment. Turning the WISE² vision into working infrastructure and measurable outcomes.</p></article><article className="vl-founder"><span className="vl-founder-index">COFOUNDER / 02</span><div className="vl-monogram" aria-hidden="true">D<span>W</span></div><h3>Darrin Wise Jr.</h3><p>Creative direction and original media. Shaping how the work looks, feels, and reaches people.</p></article></div><p className="vl-note">Founder imagery will be added when original assets and usage approval are confirmed.</p></section>
    <section className="vl-section vl-os" id="business-os"><div><p className="vl-eyebrow">02 / THE SYSTEM</p><h2>One operating system.<br/><em>Real business.</em></h2></div><div className="vl-os-copy"><p>WISE² Business OS connects the path from a first conversation to delivery, support, and insight. The aim is a synchronized view of the work across software, AI workflows, cloud infrastructure, and field devices.</p><div className="vl-flow" aria-label="Business workflow">LEAD <b>→</b> BOOKING <b>→</b> PAYMENT <b>→</b> DELIVERY <b>→</b> SUPPORT</div><p className="vl-fine">This is the operating direction. End-to-end production readiness remains subject to testing and approval.</p></div></section>
    <section className="vl-section vl-doctrine"><p className="vl-eyebrow">03 / THE DOCTRINE</p><div className="vl-quote">“Every verified system is a brick. Every paying client is a brick. Every workflow that actually works is a brick.”</div><div className="vl-doctrine-grid"><div><strong>OWN THE FOUNDATION</strong><p>Know who controls the code, domains, data, contracts, and customer relationships.</p></div><div><strong>SHIP THE WEEK</strong><p>Measure progress in working outcomes, with the next 30 and 90 days in view.</p></div><div><strong>REINVEST WITH INTENT</strong><p>Build capacity, create opportunity, and make the next step sustainable.</p></div></div></section>
    <section className="vl-section vl-gates" id="gates"><div className="vl-section-head"><p className="vl-eyebrow">04 / UNCLE STEVE'S WORKBOOK</p><h2>Six gates.<br/><em>No fake green lights.</em></h2><p className="vl-section-desc">Each gate needs an owner, dated evidence, a reviewer, and a decision. The linked audit holds the working checklist.</p></div><div className="vl-gate-grid">{gates.map(([n,title,description])=><article className="vl-gate" key={n}><div className="vl-gate-top"><span>{n}</span><span className="vl-status">AWAITING EVIDENCE</span></div><h3>{title}</h3><p>{description}</p></article>)}</div><a className="vl-underlink" href="https://github.com/dwise03-bit/wise2-core/issues/232">Open the evidence audit #232 ↗</a></section>
    <section className="vl-section vl-progress"><p className="vl-eyebrow">05 / PROJECT SIGNAL</p><h2>What the record<br/><em>actually shows.</em></h2><div className="vl-progress-grid"><div><span className="vl-verified">VERIFIED / REPOSITORY</span><p>Project trackers #229, #232, #233, and #234 document the demo, audit, doctrine, and build map.</p></div><div><span className="vl-unverified">UNVERIFIED / OPERATIONS</span><p>Live workflow readiness, launch gate approvals, founder asset rights, and production/compliance claims require separate evidence.</p></div></div><p className="vl-fine">Repository evidence is not a production health check. Status reflects the linked project record, not a completion percentage.</p></section>
    <section className="vl-section vl-workstreams" id="workstreams"><p className="vl-eyebrow">06 / OPEN THE WORK</p><h2>Follow every brick.</h2><div className="vl-track-list">{tracks.map(([n,title,description,url])=><a href={url} key={n} className="vl-track"><span>#{n}</span><strong>{title}</strong><small>{description}</small><b aria-hidden="true">↗</b></a>)}</div></section>
    <div className="vl-footer"><span>WISE² / VICTORY LAP</span><span>BUILT TO LAST. BRICK BY BRICK.</span><a href="/">WISE2.NET ↗</a></div>
  </main>;
}
