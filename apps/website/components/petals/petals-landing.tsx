import Image from "next/image";

const worlds = [
  ["SIP", "Custom loose-leaf teas for hot and iced rituals."],
  ["SOAK", "Bath bombs, shower steamers and mineral-rich bath experiences."],
  ["GLOW", "Whipped cleansing scrubs, lotions, soaps and body oils."],
  ["CROWN", "Botanical hair and scalp care."],
  ["SCENT", "Botanical fragrance and body oils designed for layering."],
  ["SOUND & SOUL", "Scan, listen and elevate the ritual."],
];

export function PetalsLanding() {
  return (
    <main className="petals-page">
      <div className="petals-orb petals-orb-one" aria-hidden="true" />
      <div className="petals-orb petals-orb-two" aria-hidden="true" />
      <header className="petals-nav">
        <a href="#top" className="petals-logo">PETALS <span>&</span> POTIONS</a>
        <nav aria-label="Primary navigation">
          <a href="#apothecary">APOTHECARY</a><a href="#ritual">YOUR RITUAL</a><a href="#paige">PAIGE</a><a href="#journal">JOURNAL</a>
        </nav>
        <a className="petals-nav-cta" href="/petals-and-potions/ritual">BUILD MY RITUAL <span>↗</span></a>
      </header>

      <section id="top" className="petals-hero">
        <div className="petals-hero-copy">
          <p className="petals-kicker">BOTANICAL WELLNESS · HEART · MIND · BODY · SOUL</p>
          <h1>Your Ritual.<br /><em>Your Blend.</em><br />Your Wellness.</h1>
          <p className="petals-lede">Personalized botanical teas, body care and mindful rituals created to make everyday wellness feel beautiful, intentional and yours.</p>
          <div className="petals-actions"><a className="petals-button" href="/petals-and-potions/ritual">BUILD MY RITUAL <span>↗</span></a><a className="petals-text-link" href="#apothecary">EXPLORE THE APOTHECARY <span>↓</span></a></div>
        </div>
        <div className="petals-hero-image"><Image src="/petals/paige-outdoor.png" alt="Paige creating a custom Petals & Potions blend" fill priority sizes="(max-width: 900px) 100vw, 58vw" /></div>
      </section>

      <section className="petals-philosophy"><p className="petals-kicker">THE PHILOSOPHY</p><h2>More than tea.<br /><em>A movement back to self.</em></h2><p>Petals & Potions brings together Heart, Mind, Body and Soul through handcrafted products and intentional everyday rituals.</p></section>

      <section id="apothecary" className="petals-section"><div className="petals-section-head"><div><p className="petals-kicker">THE APOTHECARY</p><h2>Find your ritual.</h2></div><p>Explore a sensory collection designed to meet you where you are and carry you where you want to go.</p></div><div className="petals-world-grid">{worlds.map(([name, copy], i) => <a className={`petals-world petals-world-${i}`} href="#ritual" key={name}><span className="petals-world-number">0{i + 1}</span><h3>{name}</h3><p>{copy}</p><span className="petals-arrow">↗</span></a>)}</div></section>

      <section id="paige" className="petals-founder"><div className="petals-founder-image"><Image src="/petals/paige-brand.png" alt="Paige, founder of Petals & Potions" fill sizes="(max-width: 900px) 100vw, 42vw" /></div><div><p className="petals-kicker">THE FOUNDER</p><h2>Meet Paige.</h2><p>Petals & Potions grew from Paige&apos;s passion for herbs, handcrafted body care and helping people reconnect with intentional everyday wellness.</p><a className="petals-text-link" href="#journal">READ PAIGE&apos;S STORY <span>↗</span></a></div></section>

      <section id="ritual" className="petals-ritual"><div><p className="petals-kicker">PERSONALIZED WELLNESS</p><h2>Custom tea.<br /><em>Custom you.</em></h2><p>Start with a wellness profile, choose your ritual direction and receive a recurring box designed around your preferences.</p><a className="petals-button" href="/petals-and-potions/ritual">START MY PROFILE <span>↗</span></a></div><div className="petals-ritual-card"><span>YOUR RITUAL</span><strong>HEART<br />MIND<br />BODY<br />SOUL</strong><small>Personalized by Petals & Potions</small></div></section>

      <footer id="journal" className="petals-footer"><div><a className="petals-logo" href="#top">PETALS <span>&</span> POTIONS</a><p>Your Ritual. Your Blend. Your Wellness.</p></div><p>© 2026 PETALS & POTIONS · BOTANICAL WELLNESS, INTENTIONALLY.</p></footer>
    </main>
  );
}
