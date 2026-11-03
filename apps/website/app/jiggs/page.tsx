import type { Metadata } from 'next';
import styles from './jiggs.module.css';

export const metadata: Metadata = {
  title: 'Jiggs Mobile | Barber & Events',
  description: 'Jiggs Mobile brings sharp cuts and good energy. View the concept and contact WISE² to finish booking and event setup.',
  alternates: { canonical: 'https://wise2.net/jiggs' },
  openGraph: {
    title: 'Jiggs Mobile | Barber & Events',
    description: 'Sharp cuts. Good energy. Meet Jiggs Mobile.',
    url: 'https://wise2.net/jiggs',
    type: 'website',
    images: [{ url: '/jiggs/mov-4839-poster.jpg', width: 540, height: 960, alt: 'Jiggs in a green-lit barbershop' }],
  },
};

const services = [
  { number: '01', title: 'Signature cut', detail: 'A clean cut, shaped to your style.', sample: '$35' },
  { number: '02', title: 'Cut + beard', detail: 'Fresh cut with a beard shape-up.', sample: '$50' },
  { number: '03', title: 'Lineup', detail: 'A quick edge-up to keep it crisp.', sample: '$20' },
];

export default function JiggsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.previewBar}>
        <span className={styles.previewDot} />
        <span>Concept preview</span>
        <span className={styles.previewDivider}>/</span>
        <span>Sample details shown · setup in progress</span>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Jiggs Mobile home">
          JIGGS<span> MOBILE</span>
        </a>
        <nav className={styles.nav} aria-label="Page sections">
          <a href="#cuts">Cuts</a>
          <a href="#events">Events</a>
          <a href="#assistant">Assistant</a>
        </nav>
        <a className={styles.headerCta} href="#setup">Finish setup <span aria-hidden="true">↗</span></a>
      </header>

      <section className={styles.hero} id="top" aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.kicker}><span /> BARBER · PROMOTER · COMMUNITY</p>
          <h1 id="hero-title">Sharp cuts.<br /><em>Good energy.</em></h1>
          <p className={styles.heroText}>
            Jiggs Mobile brings the fresh cut and keeps you tapped in for the next night out.
            One place for barber updates, event info, and what’s coming up.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.buttonPrimary} href="#cuts">Explore the cuts <span aria-hidden="true">↓</span></a>
            <a className={styles.buttonQuiet} href="#events">See what’s next <span aria-hidden="true">↗</span></a>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.noteMark}>!</span>
            Booking and event links will be added after Jiggs confirms his details.
          </div>
        </div>

        <div className={styles.filmColumn}>
          <div className={styles.filmLabel}><span>01 / THE INTRO</span><span>JIGGS MOBILE</span></div>
          <div className={styles.filmFrame}>
            <video
              className={styles.film}
              controls
              playsInline
              preload="metadata"
              poster="/jiggs/mov-4839-poster.jpg"
              aria-label="Jiggs introduces his barbershop in a vertical video"
            >
              <source src="/jiggs/mov-4839.mp4" type="video/mp4" />
              Your browser does not support this video.
            </video>
          </div>
          <p className={styles.filmCaption}>A look inside the shop · video supplied by Jiggs</p>
        </div>
        <div className={styles.heroGlow} aria-hidden="true" />
      </section>

      <div className={styles.marquee} aria-hidden="true">
        <div>SHOW UP SHARP <b>✳</b> STAY FOR THE NIGHT <b>✳</b> JIGGS MOBILE <b>✳</b> SHOW UP SHARP <b>✳</b></div>
      </div>

      <section className={styles.section} id="cuts" aria-labelledby="cuts-title">
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}><span /> THE BARBER SIDE</p>
            <h2 id="cuts-title">Get right.<br /><em>Stay sharp.</em></h2>
          </div>
          <p>From a full refresh to a quick lineup, find the cut that fits. Service names and prices below are sample placeholders for this concept.</p>
        </div>
        <div className={styles.serviceGrid}>
          {services.map((service) => (
            <article className={styles.serviceCard} key={service.number}>
              <div className={styles.cardTop}><span>{service.number} / SERVICE</span><span className={styles.cardSpark}>✳</span></div>
              <h3>{service.title}</h3>
              <p>{service.detail}</p>
              <div className={styles.priceRow}><span>Sample price</span><strong>{service.sample}</strong></div>
            </article>
          ))}
        </div>
        <p className={styles.sampleNote}>Sample pricing only. Ask Jiggs for current services, prices, availability, and service area.</p>
      </section>

      <section className={styles.eventSection} id="events" aria-labelledby="events-title">
        <div className={styles.eventIntro}>
          <p className={styles.kicker}><span /> THE PROMOTER SIDE</p>
          <h2 id="events-title">The next link-up<br /><em>starts here.</em></h2>
          <p>Stay close for party announcements, entry details, and official ticket links. Jiggs will add the next confirmed event here.</p>
        </div>
        <article className={styles.eventCard}>
          <div className={styles.eventOrb} aria-hidden="true">✳</div>
          <p className={styles.eventEyebrow}>NEXT EVENT · DETAILS PENDING</p>
          <h3>Next Link-Up</h3>
          <p className={styles.eventText}>Event name, date, venue, age requirements, and ticket link will be posted once confirmed.</p>
          <span className={styles.eventStatus}>No ticket link published</span>
        </article>
      </section>

      <section className={styles.assistantSection} id="assistant" aria-labelledby="assistant-title">
        <div className={styles.assistantMark} aria-hidden="true"><span>J</span><i>✳</i></div>
        <div className={styles.assistantCopy}>
          <p className={styles.kicker}><span /> JIGGS MOBILE AI</p>
          <h2 id="assistant-title">Quick answers.<br /><em>Real follow-through.</em></h2>
          <p>The assistant is being set up to handle cut requests and event questions over text. It will share confirmed details, collect what Jiggs needs to follow up, and hand off anything it can’t verify.</p>
          <div className={styles.assistantStatus}><span /> TELNYX NUMBER · SETUP IN PROGRESS</div>
        </div>
        <div className={styles.assistantList}>
          <div><b>01</b><span>Ask about a cut or current price</span></div>
          <div><b>02</b><span>Request a preferred day and time</span></div>
          <div><b>03</b><span>Get confirmed event and ticket info</span></div>
        </div>
      </section>

      <section className={styles.setupSection} id="setup" aria-labelledby="setup-title">
        <div>
          <p className={styles.kicker}><span /> FOR JIGGS · WISE² SETUP SUPPORT</p>
          <h2 id="setup-title">Let’s make it<br /><em>official.</em></h2>
        </div>
        <div className={styles.setupCopy}>
          <p>Send WISE² your confirmed service list, prices, service area, booking preference, and next event details. We’ll use your answers to finish the page and configure the text assistant.</p>
          <a className={styles.setupEmail} href="mailto:hello@wise2.net?subject=Jiggs%20Mobile%20setup">
            hello@wise2.net <span aria-hidden="true">↗</span>
          </a>
          <p className={styles.setupFine}>This is WISE² setup support for Jiggs. It is not a barber booking number.</p>
        </div>
      </section>

      <footer className={styles.footer}>
        <a className={styles.brand} href="#top">JIGGS<span> MOBILE</span></a>
        <span>BARBER · EVENTS · GOOD ENERGY</span>
        <a href="#setup">Site setup by WISE² <span aria-hidden="true">↗</span></a>
      </footer>
    </main>
  );
}
