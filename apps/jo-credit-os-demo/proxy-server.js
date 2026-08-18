const fs = require('fs');
const http = require('http');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, 'public');
const IMAGE_FILE = path.join(PUBLIC_DIR, 'Javon.png');

const services = [
  {
    title: 'Credit Analysis & Report Review',
    desc: 'We analyze your credit reports and identify negative items hurting your score.',
    icon: 'chart',
  },
  {
    title: 'Dispute Engine',
    desc: 'We challenge inaccurate items with a proven dispute process that gets results.',
    icon: 'document',
  },
  {
    title: 'Credit Score Optimization',
    desc: 'Strategic actions to increase your score and open new doors.',
    icon: 'gauge',
  },
  {
    title: 'Financial Education',
    desc: 'Learn the game so you never fall for it again. We build knowledge and confidence.',
    icon: 'education',
  },
  {
    title: 'Business Credit Building',
    desc: 'Establish and grow business credit. More leverage. More growth.',
    icon: 'building',
  },
  {
    title: 'Automation & Monitoring',
    desc: 'Smart automation and real-time monitoring to keep your credit moving forward.',
    icon: 'gear',
  },
];

const values = [
  ['Integrity', "We do what's right."],
  ['Education', 'Knowledge creates power.'],
  ['Empowerment', 'We put control back in your hands.'],
  ['Excellence', 'We deliver real results.'],
];

const steps = [
  ['Consult', 'We review your goals and current credit situation.'],
  ['Audit', 'We pull reports and identify what is really impacting your score.'],
  ['Verify', 'We verify accuracy and build your action plan.'],
  ['Act', 'We take strategic action to remove barriers.'],
  ['Monitor', 'We monitor your credit and send real-time updates.'],
  ['Build', 'Better credit. More opportunities. A better life.'],
];

const building = [
  ['Personal Credit', 'Build, repair, and optimize your personal credit.', 'blue'],
  ['Business Credit', 'Build business credit and access funding.', 'gold'],
  ['Both', 'Personal + business. Complete financial transformation.', 'blue'],
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function iconSvg(kind) {
  const base = 'width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A66FF" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  const svgs = {
    chart: `<svg ${base}><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 15l3-3 3 2 5-6"/><path d="M17 8h1v1"/></svg>`,
    document: `<svg ${base}><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v6h6"/><path d="M9 13h6"/><path d="M9 16h6"/></svg>`,
    gauge: `<svg ${base}><path d="M4 13a8 8 0 1 1 16 0"/><path d="M12 13l4-4"/><path d="M12 5v2"/><path d="M20 13h-2"/></svg>`,
    education: `<svg ${base}><path d="M4 10l8-4 8 4-8 4-8-4z"/><path d="M8 12v4c0 1.1 1.8 2 4 2s4-.9 4-2v-4"/></svg>`,
    building: `<svg ${base}><path d="M4 20h16"/><path d="M6 20V8l6-3 6 3v12"/><path d="M10 20v-4h4v4"/><path d="M9 11h1"/><path d="M9 14h1"/><path d="M14 11h1"/><path d="M14 14h1"/></svg>`,
    gear: `<svg ${base}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-6l-2 .3a6.1 6.1 0 0 0-1.1-1.9l1.2-1.7a9.8 9.8 0 0 0-5-2l-.5 1.9a6.2 6.2 0 0 0-2.1 0L9.5 1.7a9.8 9.8 0 0 0-5 2l1.2 1.7A6.1 6.1 0 0 0 4.6 7.3L2.6 7a7.8 7.8 0 0 0 .1 6l2-.3a6.1 6.1 0 0 0 1.1 1.9l-1.2 1.7a9.8 9.8 0 0 0 5 2l.5-1.9a6.2 6.2 0 0 0 2.1 0l.5 1.9a9.8 9.8 0 0 0 5-2l-1.2-1.7a6.1 6.1 0 0 0 1.1-1.9z"/></svg>`,
  };
  return svgs[kind] || svgs.chart;
}

function serviceItem(service, index) {
  return `
    <article class="service-item">
      <div class="service-icon">${iconSvg(service.icon)}</div>
      <div class="service-body">
        <p class="service-title">${escapeHtml(service.title)}</p>
        <p class="service-desc">${escapeHtml(service.desc)}</p>
      </div>
      <div class="service-index">${String(index + 1).padStart(2, '0')}</div>
    </article>
  `;
}

function valueItem([title, desc]) {
  return `
    <div class="value-row">
      <div class="value-mark">JO</div>
      <div>
        <div class="value-title">${escapeHtml(title)}</div>
        <div class="value-desc">${escapeHtml(desc)}</div>
      </div>
    </div>
  `;
}

function stepItem([title, desc], index) {
  return `
    <div class="step">
      <div class="step-dot">${index + 1}</div>
      <div class="step-copy">
        <div class="step-title">${escapeHtml(title)}</div>
        <div class="step-desc">${escapeHtml(desc)}</div>
      </div>
    </div>
  `;
}

function buildingItem([title, desc, tone]) {
  return `
    <article class="build-card ${tone}">
      <div class="build-icon">${title.slice(0, 1)}</div>
      <div class="build-title">${escapeHtml(title)}</div>
      <div class="build-desc">${escapeHtml(desc)}</div>
    </article>
  `;
}

function phoneMock(title, metric, footer) {
  return `
    <div class="phone">
      <div class="phone-notch"></div>
      <div class="phone-app">
        <div class="phone-logo">JO</div>
        <div class="phone-title">${escapeHtml(title)}</div>
        <div class="phone-metric">${escapeHtml(metric)}</div>
        <div class="phone-progress"><span style="width:${metric.replace(/[^0-9]/g, '') || 72}%"></span></div>
        <div class="phone-list">
          <div><span>Email</span><b>Sign in</b></div>
          <div><span>Score</span><b>View</b></div>
          <div><span>Plan</span><b>Upgrade</b></div>
        </div>
        <div class="phone-button">${escapeHtml(footer)}</div>
      </div>
    </div>
  `;
}

function readImageDataUrl() {
  if (!fs.existsSync(IMAGE_FILE)) {
    return '';
  }
  const bytes = fs.readFileSync(IMAGE_FILE);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

function pageHtml() {
  const javon = readImageDataUrl();
  const serviceMarkup = services.map(serviceItem).join('');
  const valueMarkup = values.map(valueItem).join('');
  const stepMarkup = steps.map(stepItem).join('');
  const buildingMarkup = building.map(buildingItem).join('');
  const phonesMarkup = [
    phoneMock('JO CREDIT OS', '72% Progress', 'Log In'),
    phoneMock('Credit Overview', '683 698 674', 'View Full Report'),
    phoneMock('Disputes', 'In Progress', 'New Dispute'),
  ].join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
  <title>JO Credit OS | Built on WISE2</title>
  <meta name="description" content="JO Credit OS is a live demo built from the brand board: credit, business, and life systems designed to help people take control." />
  <link rel="canonical" href="https://wise2.net/jo-credit-os" />
  <meta name="theme-color" content="#000000" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Montserrat:wght@400;500;600;700;800&display=swap');

    :root {
      --bg: #000000;
      --panel: rgba(12, 12, 12, 0.92);
      --panel-2: rgba(18, 18, 18, 0.96);
      --line: rgba(212, 175, 55, 0.55);
      --line-soft: rgba(212, 175, 55, 0.28);
      --gold: #d4af37;
      --blue: #0a66ff;
      --white: #ffffff;
      --ink: #0d0d0d;
      --gray: #a0a0a0;
      --slate: #1a1a1a;
    }

    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at 50% 0%, rgba(212,175,55,0.10), transparent 32%),
        linear-gradient(180deg, #000 0%, #090909 45%, #000 100%);
      color: var(--white);
      font-family: Montserrat, Arial, sans-serif;
      overflow-x: hidden;
    }

    a { color: inherit; text-decoration: none; }
    .clickable {
      cursor: pointer;
    }
    .clickable:focus-visible {
      outline: 2px solid var(--blue);
      outline-offset: 2px;
    }
    .clickable:hover {
      filter: brightness(1.08);
    }

    .page {
      position: relative;
      min-height: 100vh;
      padding: 16px 16px 24px;
    }

    .grid-overlay {
      pointer-events: none;
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(212,175,55,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(212,175,55,0.06) 1px, transparent 1px);
      background-size: 120px 120px;
      opacity: 0.28;
      mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), transparent 92%);
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.35));
      padding: 12px 16px;
      margin-bottom: 16px;
      box-shadow: 0 0 0 1px rgba(10,102,255,0.08) inset;
    }

    .topbar .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-transform: uppercase;
      letter-spacing: 0.24em;
      font-size: 12px;
      font-weight: 700;
      color: var(--gold);
    }

    .topbar .status {
      text-transform: uppercase;
      letter-spacing: 0.28em;
      font-size: 11px;
      color: rgba(255,255,255,0.68);
    }

    .board {
      display: grid;
      grid-template-columns: 27% 39% 34%;
      gap: 0;
      border: 1px solid var(--line);
      background: rgba(0,0,0,0.94);
      box-shadow: 0 0 0 1px rgba(10,102,255,0.08) inset, 0 0 80px rgba(0,0,0,0.55);
    }

    .column {
      min-width: 0;
      border-right: 1px solid var(--line);
    }
    .column:last-child { border-right: 0; }

    .stack {
      display: grid;
      grid-template-rows: auto auto auto auto auto auto;
    }

    .section-card {
      position: relative;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(13,13,13,0.98), rgba(6,6,6,0.98));
      padding: 14px;
      overflow: hidden;
    }

    .section-card:last-child { border-bottom: 0; }

    .section-title {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 12px;
      font-weight: 800;
      color: var(--white);
      margin-bottom: 12px;
    }
    .section-title .num { color: var(--gold); }
    .section-title.left { text-align: left; }
    .section-title.right { text-align: left; }

    .mini-logo-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }

    .logo-tile {
      min-height: 120px;
      border: 1px solid var(--line-soft);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.5));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 10px;
    }
    .logo-tile .monogram {
      position: relative;
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 64px;
      line-height: 0.9;
      letter-spacing: 0.04em;
      text-shadow: 0 0 18px rgba(212,175,55,0.25);
    }
    .logo-tile .monogram::before {
      content: "♛";
      display: block;
      font-size: 18px;
      line-height: 1;
      margin-bottom: 4px;
      color: var(--gold);
    }
    .logo-tile .logo-text {
      margin-top: 4px;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #fff;
      line-height: 1.35;
    }

    .primary-mark {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 18px 10px 6px;
    }
    .primary-mark .wordmark {
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 38px;
      line-height: 0.95;
      letter-spacing: 0.06em;
      text-align: center;
    }
    .primary-mark .wordmark .blue { color: var(--blue); }
    .primary-mark .wordmark .gold { color: var(--gold); }
    .primary-mark .sub {
      text-transform: uppercase;
      letter-spacing: 0.36em;
      font-size: 11px;
      color: rgba(255,255,255,0.74);
    }

    .badge-mark {
      width: 116px;
      height: 116px;
      border-radius: 999px;
      border: 2px solid var(--gold);
      display: grid;
      place-items: center;
      position: relative;
    }
    .badge-mark::before {
      content: "JO";
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 34px;
      color: var(--gold);
      letter-spacing: 0.06em;
    }
    .badge-mark::after {
      content: "BUILT ON WISE2";
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 8px;
      letter-spacing: 0.32em;
      white-space: nowrap;
      color: rgba(255,255,255,0.68);
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-top: 12px;
    }
    .swatch {
      min-height: 68px;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      justify-content: end;
      padding: 8px;
      color: #fff;
      font-size: 9px;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .swatch strong { font-size: 10px; letter-spacing: 0.14em; }
    .gold-swatch { background: #d4af37; color: #000; }
    .blue-swatch { background: #0a66ff; }
    .white-swatch { background: #fff; color: #000; }
    .black-swatch { background: #0b0b0b; }
    .gray-swatch { background: #1a1a1a; }

    .type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      align-items: center;
    }
    .type-sample {
      min-height: 120px;
      border: 1px solid var(--line-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 78px;
      line-height: 1;
      color: rgba(255,255,255,0.92);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
    }
    .type-copy {
      display: grid;
      gap: 8px;
    }
    .type-copy h4 {
      margin: 0;
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 20px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .type-copy .body {
      color: rgba(255,255,255,0.82);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 12px;
      line-height: 1.4;
    }

    .mission-box {
      display: grid;
      gap: 12px;
      padding: 6px 2px 2px;
    }
    .mission-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--gold);
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      margin-bottom: 6px;
    }
    .mission-copy {
      color: rgba(255,255,255,0.84);
      line-height: 1.65;
      font-size: 13px;
    }
    .mission-tag {
      margin-top: 12px;
      padding: 14px 12px;
      border: 1px solid var(--line-soft);
      display: flex;
      align-items: center;
      gap: 12px;
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 12px;
    }

    .values-list {
      margin-top: 4px;
      display: grid;
      gap: 10px;
    }
    .value-row {
      display: grid;
      grid-template-columns: 30px 1fr;
      gap: 10px;
      align-items: start;
    }
    .value-mark {
      width: 30px;
      height: 30px;
      border: 1px solid var(--gold);
      color: var(--gold);
      display: grid;
      place-items: center;
      font-size: 10px;
      font-weight: 800;
    }
    .value-title {
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .value-desc {
      color: rgba(255,255,255,0.82);
      font-size: 13px;
      line-height: 1.5;
    }
    .quote-box {
      margin-top: 12px;
      border: 1px solid var(--line-soft);
      padding: 14px;
      display: grid;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .quote-box .strong {
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 28px;
      line-height: 1;
    }
    .quote-box .small {
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255,255,255,0.86);
      text-transform: none;
      letter-spacing: 0;
    }

    .phones {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 12px;
    }
    .phone {
      border: 1px solid rgba(255,255,255,0.14);
      border-radius: 26px;
      background: linear-gradient(180deg, #171717, #050505);
      padding: 10px;
      min-height: 280px;
      position: relative;
      overflow: hidden;
    }
    .phone-notch {
      width: 50px;
      height: 12px;
      border-radius: 999px;
      background: rgba(255,255,255,0.12);
      margin: 0 auto 12px;
    }
    .phone-app {
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.08);
      min-height: 248px;
      padding: 14px 12px;
      background:
        radial-gradient(circle at top, rgba(10,102,255,0.18), transparent 35%),
        linear-gradient(180deg, rgba(10,10,10,0.95), rgba(0,0,0,0.92));
      display: grid;
      grid-template-rows: auto auto auto auto auto 1fr auto;
      align-content: start;
      gap: 8px;
    }
    .phone-logo {
      width: 44px;
      height: 44px;
      border: 2px solid var(--gold);
      border-radius: 12px;
      display: grid;
      place-items: center;
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 28px;
      justify-self: center;
    }
    .phone-title {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      color: #fff;
      font-weight: 700;
    }
    .phone-metric {
      text-align: center;
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 34px;
      letter-spacing: 0.06em;
    }
    .phone-progress {
      height: 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      overflow: hidden;
    }
    .phone-progress span {
      display: block;
      height: 100%;
      background: linear-gradient(90deg, var(--gold), var(--blue));
      border-radius: inherit;
    }
    .phone-list {
      display: grid;
      gap: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: rgba(255,255,255,0.86);
    }
    .phone-list div {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding-bottom: 4px;
    }
    .phone-button {
      margin-top: auto;
      border-radius: 10px;
      background: var(--blue);
      color: #fff;
      text-align: center;
      padding: 8px 10px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 11px;
      font-weight: 800;
    }

    .hero-shell {
      display: grid;
      grid-template-rows: auto 1fr auto;
      min-height: 100%;
    }

    .hero-card {
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(8,8,8,0.98), rgba(0,0,0,0.98));
      padding: 14px;
      position: relative;
      overflow: hidden;
    }
    .hero-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line-soft);
      margin-bottom: 12px;
    }
    .hero-mark {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .hero-shield {
      width: 60px;
      height: 72px;
      border: 2px solid var(--gold);
      border-radius: 18px 18px 30px 30px;
      display: grid;
      place-items: center;
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 34px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 0 25px rgba(212,175,55,0.18);
    }
    .hero-shield::before {
      content: "JO";
    }
    .hero-shield::after {
      content: "";
      position: absolute;
      top: -14px;
      left: 50%;
      width: 34px;
      height: 16px;
      transform: translateX(-50%);
      border-top: 7px solid var(--gold);
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    .hero-wordmark {
      display: grid;
      gap: 4px;
    }
    .hero-wordmark .big {
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: clamp(38px, 4.4vw, 58px);
      line-height: 0.94;
      letter-spacing: 0.06em;
    }
    .hero-wordmark .big .blue { color: var(--blue); }
    .hero-wordmark .big .white { color: #fff; }
    .hero-wordmark .big .gold { color: var(--gold); }
    .hero-wordmark .sub {
      text-transform: uppercase;
      letter-spacing: 0.38em;
      font-size: 11px;
      color: rgba(255,255,255,0.74);
    }

    .hero-copy {
      display: grid;
      grid-template-columns: 44% 56%;
      gap: 14px;
      align-items: stretch;
    }
    .hero-words {
      display: grid;
      align-content: start;
      gap: 10px;
      padding-top: 4px;
    }
    .hero-words .headline {
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: clamp(28px, 3.4vw, 56px);
      line-height: 0.92;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .hero-words .headline .gold { color: var(--gold); }
    .hero-words .headline .blue { color: var(--blue); }
    .hero-words .headline .white { color: #fff; }
    .hero-words .blurb {
      font-size: 14px;
      line-height: 1.6;
      color: rgba(255,255,255,0.86);
      max-width: 95%;
    }
    .signature {
      margin-top: 10px;
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 34px;
      letter-spacing: 0.08em;
    }
    .signature-label {
      text-transform: uppercase;
      letter-spacing: 0.28em;
      font-size: 10px;
      color: rgba(255,255,255,0.75);
      margin-top: -2px;
    }

    .hero-visual {
      position: relative;
      min-height: 640px;
      border: 1px solid var(--line);
      overflow: hidden;
      background:
        radial-gradient(circle at 50% 25%, rgba(255,255,255,0.15), transparent 30%),
        linear-gradient(180deg, rgba(8,8,8,0.15), rgba(0,0,0,0.75));
    }
    .hero-visual::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.68) 100%),
        radial-gradient(circle at 70% 10%, rgba(10,102,255,0.22), transparent 24%),
        radial-gradient(circle at 24% 16%, rgba(212,175,55,0.16), transparent 28%);
      z-index: 2;
    }
    .hero-city {
      position: absolute;
      inset: 0;
      background:
        linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.25)),
        radial-gradient(circle at 50% 0%, rgba(10,102,255,0.18), transparent 26%);
      z-index: 0;
    }
    .hero-photo {
      position: absolute;
      right: 50%;
      transform: translateX(58%);
      bottom: 0;
      height: 95%;
      width: auto;
      z-index: 1;
      object-fit: cover;
      object-position: center center;
      filter: saturate(0.98) contrast(1.02);
    }
    .hero-overlay {
      position: absolute;
      left: 20px;
      bottom: 20px;
      z-index: 3;
      max-width: 58%;
      padding: 16px 18px;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.36);
      backdrop-filter: blur(12px);
    }
    .hero-overlay .small-title {
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.28em;
      font-size: 10px;
      font-weight: 800;
    }
    .hero-overlay .copy {
      margin-top: 8px;
      font-size: 18px;
      line-height: 1.45;
      color: rgba(255,255,255,0.9);
    }
    .hero-overlay .blue-line {
      margin-top: 10px;
      color: var(--blue);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-weight: 800;
      font-size: 12px;
    }

    .hero-badge {
      padding: 10px 14px;
      border: 1px solid var(--line-soft);
      text-transform: uppercase;
      letter-spacing: 0.28em;
      font-size: 11px;
      color: rgba(255,255,255,0.78);
      margin-left: auto;
    }

    .hero-bottom {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
    }

    .dashboard {
      border-top: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(7,7,7,0.98), rgba(0,0,0,0.98));
      padding: 14px;
    }
    .dashboard-title {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
      color: #fff;
    }
    .dashboard-body {
      display: grid;
      grid-template-columns: 18% 82%;
      gap: 12px;
      border: 1px solid var(--line-soft);
      background: rgba(8,8,8,0.95);
      min-height: 360px;
      overflow: hidden;
    }
    .dash-nav {
      border-right: 1px solid rgba(255,255,255,0.08);
      padding: 12px 10px;
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.4));
    }
    .dash-nav .dash-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 10px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .dash-nav .dash-logo .mini {
      width: 24px;
      height: 24px;
      border: 1px solid var(--gold);
      display: grid;
      place-items: center;
      font-size: 12px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: rgba(255,255,255,0.72);
      font-size: 10px;
      padding: 7px 8px;
      border-radius: 6px;
      margin-bottom: 4px;
    }
    .nav-item.clickable:hover,
    .service-item.clickable:hover,
    .build-card.clickable:hover,
    .ops-item.clickable:hover,
    .phone-button.clickable:hover,
    .contact-link.clickable:hover,
    .cta-title.clickable:hover,
    .cta-sub.clickable:hover {
      transform: translateY(-1px);
    }
    .nav-item.active {
      background: rgba(212,175,55,0.12);
      color: #fff;
      border-left: 2px solid var(--gold);
    }
    .dash-main {
      padding: 14px;
      display: grid;
      grid-template-rows: auto auto 1fr;
      gap: 12px;
    }
    .dash-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    .dash-head h3 {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 14px;
      color: #fff;
    }
    .dash-head .sub {
      color: rgba(255,255,255,0.68);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 10px;
    }
    .dash-metrics {
      display: grid;
      grid-template-columns: 1.1fr 1fr 1fr 1fr;
      gap: 10px;
    }
    .metric {
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.45));
      padding: 12px;
      min-height: 104px;
    }
    .metric .kicker {
      color: #7f9edc;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.18em;
      margin-bottom: 8px;
      display: block;
    }
    .metric .score {
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 36px;
      letter-spacing: 0.04em;
      line-height: 1;
      color: #fff;
    }
    .metric .delta {
      margin-top: 6px;
      font-size: 11px;
      color: #74e36a;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .dash-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.9fr;
      gap: 10px;
      min-height: 0;
    }
    .dash-table, .dash-factors {
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
      padding: 10px;
    }
    .dash-table h4, .dash-factors h4 {
      margin: 0 0 10px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      color: #fff;
      font-size: 12px;
    }
    .table-row {
      display: grid;
      grid-template-columns: 1.2fr 0.9fr 0.6fr;
      gap: 10px;
      font-size: 11px;
      padding: 9px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.82);
    }
    .table-row.head {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--gold);
      font-size: 10px;
    }
    .factor {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 11px;
      color: rgba(255,255,255,0.8);
    }
    .factor .good { color: #72e06d; }
    .factor .warn { color: #d8bc4a; }

    .how {
      border-top: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(4,4,4,0.98), rgba(0,0,0,0.98));
      padding: 12px;
    }
    .how-title {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .steps {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 8px;
    }
    .step {
      min-height: 158px;
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
      padding: 12px 10px;
      text-align: center;
    }
    .step-dot {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: var(--blue);
      color: #fff;
      display: grid;
      place-items: center;
      margin: 0 auto 10px;
      font-size: 11px;
      font-weight: 800;
    }
    .step-title {
      color: var(--blue);
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 11px;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .step-desc {
      font-size: 11px;
      line-height: 1.55;
      color: rgba(255,255,255,0.84);
    }

    .right-copy {
      display: grid;
      grid-template-rows: auto auto auto auto;
      min-height: 100%;
    }

    .services {
      padding-bottom: 0;
    }
    .services-header {
      text-align: right;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .services-header .num { color: var(--gold); }
    .service-item {
      display: grid;
      grid-template-columns: 40px 1fr 34px;
      gap: 10px;
      align-items: start;
      padding: 12px 0;
      border-bottom: 1px solid var(--line-soft);
    }
    .service-item:last-child { border-bottom: 0; }
    .service-icon {
      width: 40px;
      height: 40px;
      border: 1px solid rgba(10,102,255,0.55);
      display: grid;
      place-items: center;
      background: rgba(10,102,255,0.06);
    }
    .service-icon svg { width: 22px; height: 22px; }
    .service-title {
      margin: 0;
      color: var(--blue);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      font-size: 12px;
      line-height: 1.35;
    }
    .service-desc {
      margin: 4px 0 0;
      color: rgba(255,255,255,0.82);
      font-size: 12px;
      line-height: 1.45;
    }
    .service-index {
      color: rgba(255,255,255,0.12);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 32px;
      line-height: 1;
    }

    .powered {
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      padding: 12px 14px;
      display: grid;
      grid-template-columns: 36px 1fr;
      gap: 12px;
      align-items: center;
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
    }
    .powered .shield {
      width: 36px;
      height: 40px;
      border: 2px solid rgba(10,102,255,0.9);
      border-radius: 12px 12px 18px 18px;
      display: grid;
      place-items: center;
      color: var(--blue);
      font-weight: 900;
      font-size: 15px;
    }
    .powered .head {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 12px;
      color: #fff;
      margin-bottom: 4px;
    }
    .powered .desc {
      font-size: 12px;
      color: rgba(255,255,255,0.84);
      line-height: 1.5;
    }
    .ops-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding-top: 10px;
      text-align: center;
    }
    .ops-item {
      color: rgba(255,255,255,0.82);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .ops-icon {
      width: 32px;
      height: 32px;
      border: 1px solid rgba(10,102,255,0.35);
      display: grid;
      place-items: center;
      color: var(--blue);
      margin: 0 auto 8px;
    }

    .build-title-wrap {
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 12px;
    }
    .build-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      padding-bottom: 10px;
    }
    .build-card {
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
      padding: 16px 12px;
      min-height: 170px;
      text-align: center;
    }
    .build-card.gold { border-color: rgba(212,175,55,0.55); }
    .build-card.blue { border-color: rgba(10,102,255,0.55); }
    .build-icon {
      width: 42px;
      height: 42px;
      border-radius: 999px;
      margin: 0 auto 12px;
      display: grid;
      place-items: center;
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 24px;
      color: #fff;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .build-card.gold .build-icon { color: var(--gold); }
    .build-card.blue .build-icon { color: var(--blue); }
    .build-title {
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 800;
      color: #fff;
      font-size: 12px;
      margin-bottom: 8px;
    }
    .build-desc {
      color: rgba(255,255,255,0.82);
      font-size: 12px;
      line-height: 1.5;
    }

    .results {
      border-top: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(8,8,8,0.98), rgba(0,0,0,0.98));
      padding: 14px;
    }
    .results-inner {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      gap: 12px;
      align-items: stretch;
    }
    .results-quote {
      border: 1px solid rgba(255,255,255,0.08);
      padding: 16px;
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
      display: grid;
      align-content: start;
      gap: 12px;
    }
    .results-quote .label {
      color: var(--blue);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 11px;
      font-weight: 800;
    }
    .results-quote .quote {
      font-size: 22px;
      line-height: 1.42;
      color: rgba(255,255,255,0.92);
    }
    .stars {
      color: var(--gold);
      letter-spacing: 0.18em;
      font-size: 18px;
    }
    .results-portrait {
      border: 1px solid rgba(255,255,255,0.08);
      overflow: hidden;
      background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.55));
      position: relative;
      min-height: 180px;
    }
    .results-portrait .shadow-monogram {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.06);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 180px;
      line-height: 1;
      letter-spacing: 0.04em;
    }
    .results-portrait .person {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 42%;
      height: 100%;
      object-fit: cover;
      object-position: center center;
      filter: contrast(1.02) saturate(0.96);
    }

    .footer-bar {
      margin-top: 16px;
      border: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(18,18,18,0.92), rgba(0,0,0,0.96));
      display: grid;
      grid-template-columns: 18% 38% 18% 26%;
      gap: 0;
      align-items: stretch;
      overflow: hidden;
    }
    .footer-cell {
      padding: 18px 16px;
      border-right: 1px solid var(--line);
      min-height: 110px;
      display: flex;
      align-items: center;
    }
    .footer-cell:last-child { border-right: 0; }
    .footer-cell.big {
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 32px;
      line-height: 0.95;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #fff;
      display: grid;
      align-content: center;
      gap: 0;
    }
    .footer-cell.big .blue { color: var(--blue); }
    .footer-cell.big .gold { color: var(--gold); }
    .footer-cell.cta {
      display: grid;
      align-content: center;
      gap: 8px;
    }
    .cta-title {
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.14em;
      font-size: 13px;
      font-weight: 800;
    }
    .cta-sub {
      color: rgba(255,255,255,0.84);
      font-size: 14px;
      line-height: 1.5;
    }
    .cta-sub .blue { color: var(--blue); font-weight: 700; }
    .footer-cell.brand {
      display: grid;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.14em;
    }
    .footer-cell.brand .brand-name {
      color: var(--gold);
      font-family: "Bebas Neue", Impact, sans-serif;
      font-size: 34px;
      letter-spacing: 0.08em;
    }
    .footer-cell.brand .brand-sub {
      color: rgba(255,255,255,0.76);
      font-size: 11px;
    }
    .footer-cell.contact {
      display: grid;
      gap: 8px;
      justify-items: center;
      text-align: center;
    }
    .contact-link {
      color: var(--blue);
      text-transform: uppercase;
      letter-spacing: 0.16em;
      font-size: 12px;
      font-weight: 800;
    }
    .contact-note {
      color: rgba(255,255,255,0.86);
      font-size: 12px;
      line-height: 1.4;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .section-anchor {
      scroll-margin-top: 24px;
    }

    .mobile-strip {
      display: none;
    }

    @media (max-width: 1360px) {
      .board,
      .footer-bar {
        grid-template-columns: 1fr;
      }
      .column { border-right: 0; border-bottom: 1px solid var(--line); }
      .column:last-child { border-bottom: 0; }
      .hero-copy,
      .results-inner,
      .footer-bar {
        grid-template-columns: 1fr;
      }
      .steps {
        grid-template-columns: repeat(3, 1fr);
      }
      .build-grid {
        grid-template-columns: 1fr;
      }
      .phones {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .dashboard-body {
        grid-template-columns: 1fr;
      }
      .dash-nav {
        border-right: 0;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .dash-metrics {
        grid-template-columns: 1fr 1fr;
      }
      .dash-grid {
        grid-template-columns: 1fr;
      }
      .hero-photo {
        transform: translateX(45%);
      }
      .hero-overlay {
        max-width: 72%;
      }
    }

    @media (max-width: 800px) {
      .page { padding: 10px; }
      .topbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .mini-logo-row,
      .color-grid,
      .type-grid,
      .phones,
      .steps,
      .dash-metrics,
      .footer-bar {
        grid-template-columns: 1fr;
      }
      .hero-head {
        flex-direction: column;
        align-items: flex-start;
      }
      .hero-mark {
        align-items: flex-start;
      }
      .hero-photo {
        height: 100%;
        width: 100%;
        right: 0;
        transform: none;
        object-position: center top;
      }
      .hero-visual {
        min-height: 520px;
      }
      .hero-overlay {
        max-width: calc(100% - 40px);
      }
      .service-item {
        grid-template-columns: 32px 1fr;
      }
      .service-index {
        display: none;
      }
      .results-portrait .person {
        width: 52%;
      }
      .footer-cell {
        border-right: 0;
        border-bottom: 1px solid var(--line);
      }
      .footer-cell:last-child {
        border-bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="grid-overlay"></div>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <span>JO CREDIT OS</span>
        <span style="color: rgba(255,255,255,0.5);">Built on WISE2</span>
      </div>
      <div class="status">Powered by Purpose</div>
    </header>

    <main class="board">
      <aside class="column">
        <div class="stack">
          <section class="section-card">
            <div class="section-title left"><span class="num">1.</span> Brand Identity</div>
            <div class="mini-logo-row">
              <div class="logo-tile">
                <div class="monogram">JO</div>
                <div class="logo-text">Primary logo</div>
              </div>
              <div class="logo-tile">
                <div class="monogram">JO</div>
                <div class="logo-text">Icon logo</div>
              </div>
              <div class="logo-tile">
                <div class="badge-mark"></div>
              </div>
            </div>
            <div class="primary-mark">
              <div class="wordmark">
                <span class="blue">JO</span> <span class="white">CREDIT</span> <span class="gold">OS</span>
              </div>
              <div class="sub">Built on WISE2</div>
            </div>
            <div class="color-grid">
              <div class="swatch gold-swatch"><strong>Wealth Gold</strong><span>#D4AF37</span></div>
              <div class="swatch blue-swatch"><strong>Royal Blue</strong><span>#0A66FF</span></div>
              <div class="swatch white-swatch"><strong>Pure White</strong><span>#FFFFFF</span></div>
              <div class="swatch black-swatch"><strong>Carbon Black</strong><span>#0D0D0D</span></div>
              <div class="swatch gray-swatch"><strong>Dark Gray</strong><span>#1A1A1A</span></div>
            </div>
          </section>

          <section class="section-card">
            <div class="section-title left"><span class="num">2.</span> Mission & Values</div>
            <div class="mission-box">
              <div>
                <div class="mission-title">Our Mission</div>
                <div class="mission-copy">
                  To empower people with the tools, knowledge, and strategies to take control of their credit and build generational wealth.
                </div>
              </div>
              <div>
                <div class="mission-title">Our Values</div>
                <div class="values-list">
                  ${valueMarkup}
                </div>
              </div>
              <div class="mission-tag">
                <div class="badge" style="padding: 8px 10px;">JO</div>
                <div>We do not dispute everything. We audit everything.</div>
              </div>
            </div>
          </section>

          <section class="section-card">
            <div class="section-title left"><span class="num">6.</span> Mobile App Preview</div>
            <div class="phones">
              ${phonesMarkup}
            </div>
          </section>
        </div>
      </aside>

      <section class="column">
        <div class="hero-shell">
          <section class="hero-card">
            <div class="hero-head">
              <div class="hero-mark">
                <div class="hero-shield"></div>
                <div class="hero-wordmark">
                  <div class="big"><span class="blue">JO</span> <span class="white">CREDIT</span> <span class="gold">OS</span></div>
                  <div class="sub">Powered by Purpose</div>
                </div>
              </div>
              <div class="hero-badge">Powered by WISE2</div>
            </div>
            <div class="hero-copy">
              <div class="hero-words">
                <div class="sub" style="text-transform:uppercase; letter-spacing:0.24em; color: var(--blue); font-size: 11px; font-weight: 800;">Built on WISE2</div>
                <div class="headline">
                  <span class="white">Take Control</span><br />
                  <span class="gold">of your credit.</span><br />
                  <span class="white">Build your future.</span><br />
                  <span class="blue">Change your life.</span>
                </div>
                <div class="blurb">
                  JO Credit OS is more than credit repair. It is a system. A movement. A pathway to financial freedom.
                </div>
                <div class="signature">Javon Oliver</div>
                <div class="signature-label">Founder & Credit Strategist</div>
              </div>
              <div class="hero-visual">
                <div class="hero-city"></div>
                ${javon ? `<img class="hero-photo" src="${javon}" alt="Javon Oliver" />` : ''}
                <div class="hero-overlay">
                  <div class="small-title">Take control of your credit</div>
                  <div class="copy">Build your future with a system designed to help you win.</div>
                  <div class="blue-line">Change your life.</div>
                </div>
              </div>
            </div>
          </section>

          <section class="hero-bottom">
            <div class="dashboard" id="dashboard">
              <div class="dashboard-title"><span class="num">4.</span> Client Dashboard Preview</div>
              <div class="dashboard-body">
                <div class="dash-nav">
                  <div class="dash-logo"><span class="mini">JO</span><span>JO Credit OS</span></div>
                  <div class="nav-item active">Dashboard</div>
                  <div class="nav-item">Credit Overview</div>
                  <div class="nav-item">Disputes</div>
                  <div class="nav-item">Documents</div>
                  <div class="nav-item">Education</div>
                  <div class="nav-item">Monitoring</div>
                  <div class="nav-item">Goals</div>
                  <div class="nav-item">Business Credit</div>
                  <div class="nav-item">Settings</div>
                  <div class="nav-item">Log Out</div>
                </div>
                <div class="dash-main">
                  <div class="dash-head">
                    <div>
                      <h3>My Credit Overview</h3>
                      <div class="sub">Results that move the needle</div>
                    </div>
                    <div class="sub">Overall progress: 72%</div>
                  </div>
                  <div class="dash-metrics">
                    <div class="metric">
                      <span class="kicker">Overall Progress</span>
                      <div class="score">72%</div>
                      <div class="delta">Good progress</div>
                    </div>
                    <div class="metric">
                      <span class="kicker">Equifax</span>
                      <div class="score">683</div>
                      <div class="delta">+21 pts</div>
                    </div>
                    <div class="metric">
                      <span class="kicker">Experian</span>
                      <div class="score">698</div>
                      <div class="delta">+18 pts</div>
                    </div>
                    <div class="metric">
                      <span class="kicker">Transunion</span>
                      <div class="score">674</div>
                      <div class="delta">+24 pts</div>
                    </div>
                  </div>
                  <div class="dash-grid">
                    <div class="dash-table">
                      <h4>Disputes in Progress</h4>
                      <div class="table-row head"><div>Item</div><div>Status</div><div>Due</div></div>
                      <div class="table-row"><div>Capital One</div><div>Investigation</div><div>05/20/26</div></div>
                      <div class="table-row"><div>Midland Funding</div><div>Investigation</div><div>05/16/26</div></div>
                      <div class="table-row"><div>LVNV Funding</div><div>Investigation</div><div>05/21/26</div></div>
                      <div class="table-row"><div>Synchrony Bank</div><div>Verification</div><div>05/22/26</div></div>
                      <div style="padding-top:10px; color: var(--gold); text-transform:uppercase; letter-spacing:0.16em; font-size:11px;">View all disputes</div>
                    </div>
                    <div class="dash-factors">
                      <h4>Credit Factors</h4>
                      <div class="factor"><span>Payment History</span><span class="good">Good</span></div>
                      <div class="factor"><span>Credit Utilization</span><span class="warn">Needs work</span></div>
                      <div class="factor"><span>Length of Credit History</span><span class="good">Good</span></div>
                      <div class="factor"><span>Credit Mix</span><span class="good">Good</span></div>
                      <div class="factor"><span>New Credit</span><span class="warn">Needs work</span></div>
                      <div class="factor"><span>Inquiries</span><span class="good">Good</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="how">
              <div class="how-title"><span class="num">5.</span> How It Works</div>
              <div class="steps">
                ${stepMarkup}
              </div>
            </div>
          </section>
        </div>
      </section>

      <aside class="column right-copy">
        <section class="section-card services" id="services">
          <div class="services-header"><span class="num">3.</span> Our System & Services</div>
          ${serviceMarkup}
        </section>

        <section class="section-card" id="build">
          <div class="powered">
            <div class="shield">J</div>
            <div>
              <div class="head">Powered by WISE2</div>
              <div class="desc">The all-in-one credit & business operating system built to help you win.</div>
            </div>
          </div>
          <div class="ops-row">
            <div class="ops-item"><div class="ops-icon">${iconSvg('gear')}</div>Automate</div>
            <div class="ops-item"><div class="ops-icon">${iconSvg('document')}</div>Organize</div>
            <div class="ops-item"><div class="ops-icon">${iconSvg('chart')}</div>Operate</div>
            <div class="ops-item"><div class="ops-icon">${iconSvg('gauge')}</div>Grow</div>
          </div>
        </section>

        <section class="section-card" id="results">
          <div class="section-title right"><span class="num">7.</span> What Are We Building?</div>
          <div class="build-grid">
            ${buildingMarkup}
          </div>
          <div style="text-align:center; color: var(--blue); text-transform:uppercase; letter-spacing:0.18em; font-weight:800; font-size:12px;">You choose. We build.</div>
        </section>

        <section class="section-card">
          <div class="section-title right"><span class="num">8.</span> Results That Change Lives</div>
          <div class="results-inner">
            <div class="results-quote">
              <div class="label">Verified Client</div>
              <div class="quote">JO Credit OS gave me the knowledge, the system, and the support I needed to go from stuck to unstoppable. Now I am living life on my terms.</div>
              <div class="stars">★★★★★</div>
            </div>
            <div class="results-portrait">
              <div class="shadow-monogram">JO</div>
              ${javon ? `<img class="person" src="${javon}" alt="Javon Oliver portrait" />` : ''}
            </div>
          </div>
        </section>
      </aside>
    </main>

    <section class="footer-bar section-anchor" id="contact">
      <div class="footer-cell big">
        <div>Better Credit.</div>
        <div>Better Life.</div>
        <div class="blue">Better You.</div>
      </div>
      <div class="footer-cell cta">
        <div class="cta-title clickable" data-target="contact">Let's build your legacy.</div>
        <div class="cta-sub clickable" data-target="contact">Schedule your <span class="blue">free</span> consultation today.</div>
      </div>
      <div class="footer-cell brand">
        <div class="brand-name">JO Credit OS</div>
        <div class="brand-sub">Built on WISE2 · Powered by Purpose</div>
      </div>
      <div class="footer-cell contact">
        <div class="contact-link clickable" data-url="https://jocreditos.com">JOCREDITOS.COM</div>
        <div class="contact-note">Follow the movement</div>
      </div>
    </section>
  </div>
  <script>
    (function () {
      const sectionTargets = {
        dashboard: '#dashboard',
        'credit overview': '#dashboard',
        disputes: '#dashboard',
        documents: '#contact',
        education: '#contact',
        monitoring: '#results',
        goals: '#build',
        'business credit': '#build',
        settings: '#contact',
        'log out': '#contact',
      };

      const fallbackTargets = {
        '.service-item': '#contact',
        '.build-card': '#contact',
        '.ops-item': '#contact',
        '.phone-button': '#contact',
      };

      function scrollToHash(hash) {
        const node = document.querySelector(hash);
        if (node) {
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }

      function makeInteractive(el, handler) {
        if (!el) return;
        el.classList.add('clickable');
        el.setAttribute('role', 'button');
        el.setAttribute('tabindex', '0');
        el.addEventListener('click', handler);
        el.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handler(event);
          }
        });
      }

      document.querySelectorAll('.nav-item').forEach((item) => {
        const key = item.textContent.trim().toLowerCase();
        makeInteractive(item, () => scrollToHash(sectionTargets[key] || '#contact'));
      });

      Object.entries(fallbackTargets).forEach(([selector, hash]) => {
        document.querySelectorAll(selector).forEach((item) => {
          makeInteractive(item, () => scrollToHash(hash));
        });
      });

      document.querySelectorAll('[data-target]').forEach((item) => {
        makeInteractive(item, () => scrollToHash('#' + item.getAttribute('data-target')));
      });

      document.querySelectorAll('[data-url]').forEach((item) => {
        makeInteractive(item, () => window.open(item.getAttribute('data-url'), '_blank', 'noopener,noreferrer'));
      });

      document.querySelectorAll('.brand-name').forEach((item) => {
        makeInteractive(item, () => window.scrollTo({ top: 0, behavior: 'smooth' }));
      });
    })();
  </script>
</body>
</html>`;
}

function serveFile(res, filePath, contentType) {
  try {
    const stream = fs.createReadStream(filePath);
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400',
    });
    stream.pipe(res);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('Not Found');
    });
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
}

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url || '/', 'http://localhost').pathname;

  if (pathname === '/Javon.png') {
    return serveFile(res, IMAGE_FILE, 'image/png');
  }

  if (pathname === '/' || pathname === '/business-os') {
    res.writeHead(308, { Location: '/jo-credit-os' });
    res.end();
    return;
  }

  if (pathname === '/jo-credit-os' || pathname === '/jo-credit-os/') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    });
    res.end(pageHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JO Credit demo listening on :${PORT}`);
});
