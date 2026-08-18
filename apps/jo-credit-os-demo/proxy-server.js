const http = require('http');

const PORT = Number(process.env.PORT || 3000);

function pageHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
  <title>WISE² | Building Empires, Changing Culture</title>
  <meta name="description" content="WISE² is the new business OS for a founder-led empire: Wise Shine, Piff City Creative Studios, and the systems that power legacy." />
  <link rel="canonical" href="https://wise2.net/business-os" />
  <meta name="theme-color" content="#050505" />
  <style>
    :root {
      --bg: #050505;
      --panel: rgba(255,255,255,0.05);
      --panel-strong: rgba(255,255,255,0.08);
      --line: rgba(255,255,255,0.10);
      --text: #f4f5f7;
      --muted: #b7bdc8;
      --lime: #c7ff2e;
      --violet: #b36bff;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      background: radial-gradient(circle at top, rgba(199,255,46,0.16), transparent 42%),
                  radial-gradient(circle at 80% 18%, rgba(179,107,255,0.14), transparent 28%),
                  var(--bg);
      color: var(--text);
    }
    .wrap {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
    }
    .grid {
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: .18;
      background-image: linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px),
                        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 64px 64px;
    }
    .orb-lime, .orb-violet {
      position: fixed;
      border-radius: 999px;
      filter: blur(60px);
      pointer-events: none;
    }
    .orb-lime { left: -8rem; top: 28vh; width: 18rem; height: 18rem; background: rgba(199,255,46,0.10); }
    .orb-violet { right: -8rem; top: 16vh; width: 24rem; height: 24rem; background: rgba(179,107,255,0.12); }
    .shell {
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px 20px 64px;
      position: relative;
      z-index: 1;
    }
    .topline {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
      font-size: 12px;
      letter-spacing: .32em;
      text-transform: uppercase;
      color: #9ba3b1;
    }
    .badge {
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.04);
      border-radius: 999px;
      padding: 10px 14px;
      color: var(--lime);
    }
    .hero {
      display: grid;
      grid-template-columns: 1.05fr .95fr;
      gap: 28px;
      align-items: center;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      border: 1px solid var(--line);
      background: rgba(255,255,255,0.04);
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: .35em;
      font-size: 11px;
      color: var(--lime);
    }
    h1 {
      margin: 22px 0 0;
      font-size: clamp(3.2rem, 9vw, 5.8rem);
      line-height: .88;
      letter-spacing: .08em;
      text-transform: uppercase;
      font-weight: 900;
    }
    h1 .accent {
      display: block;
      color: var(--lime);
      margin-top: 10px;
    }
    .lead {
      max-width: 680px;
      margin-top: 22px;
      font-size: 1.13rem;
      line-height: 1.9;
      color: var(--muted);
    }
    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 28px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 20px;
      border-radius: 999px;
      text-decoration: none;
      letter-spacing: .2em;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 800;
      transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease;
    }
    .btn-primary {
      background: var(--lime);
      color: #000;
      box-shadow: 0 0 28px rgba(199,255,46,.22);
    }
    .btn-secondary {
      background: rgba(255,255,255,0.04);
      color: var(--text);
      border: 1px solid rgba(255,255,255,0.12);
    }
    .btn:hover { transform: translateY(-1px); }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      margin-top: 28px;
    }
    .card, .poster, .unit {
      border: 1px solid var(--line);
      background: var(--panel);
      backdrop-filter: blur(18px);
      border-radius: 28px;
    }
    .card { padding: 18px; }
    .value {
      font-size: 2.3rem;
      font-weight: 900;
      letter-spacing: .14em;
      color: var(--lime);
    }
    .label {
      margin-top: 6px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .3em;
      color: #9ba3b1;
    }
    .poster {
      overflow: hidden;
      box-shadow: 0 0 90px rgba(0,0,0,.55);
    }
    .poster-top {
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid var(--line);
      color: #9ba3b1;
      text-transform: uppercase;
      letter-spacing: .24em;
      font-size: 11px;
    }
    .poster-body {
      position: relative;
      min-height: 480px;
      background:
        radial-gradient(circle at 50% 22%, rgba(255,255,255,.12), transparent 26%),
        linear-gradient(160deg, #0d0d0d 0%, #060606 52%, #040404 100%);
      display: flex;
      align-items: end;
      padding: 22px;
    }
    .poster-copy {
      width: 100%;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(0,0,0,0.36);
      backdrop-filter: blur(12px);
      border-radius: 20px;
      padding: 18px 18px 16px;
    }
    .poster-copy strong {
      display: block;
      color: var(--lime);
      text-transform: uppercase;
      letter-spacing: .28em;
      font-size: 11px;
      margin-bottom: 8px;
    }
    .section {
      margin-top: 40px;
    }
    .section-head {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      align-items: end;
      margin-bottom: 20px;
    }
    .section-head h2 {
      margin: 10px 0 0;
      font-size: clamp(1.9rem, 4vw, 3rem);
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .section-head p {
      margin: 0;
      max-width: 650px;
      color: var(--muted);
      line-height: 1.8;
    }
    .units {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .unit {
      position: relative;
      overflow: hidden;
      padding: 22px;
      min-height: 180px;
    }
    .unit:before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(199,255,46,.18), transparent 56%);
      opacity: .7;
    }
    .unit:nth-child(2):before { background: linear-gradient(135deg, rgba(179,107,255,.18), transparent 56%); }
    .unit:nth-child(3):before { background: linear-gradient(135deg, rgba(255,255,255,.12), transparent 56%); }
    .unit > * { position: relative; z-index: 1; }
    .kicker {
      color: var(--lime);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .28em;
      font-weight: 800;
    }
    .unit h3 {
      margin: 12px 0 0;
      font-size: 1.45rem;
      text-transform: uppercase;
      letter-spacing: .08em;
    }
    .unit p {
      margin: 14px 0 0;
      color: var(--muted);
      line-height: 1.75;
      font-size: .98rem;
    }
    .quote {
      margin-top: 40px;
      border-top: 1px solid var(--line);
      border-bottom: 1px solid var(--line);
      background: rgba(255,255,255,0.03);
      padding: 28px 0;
    }
    .quote strong {
      display: block;
      text-transform: uppercase;
      letter-spacing: .26em;
      color: var(--lime);
      font-size: 11px;
    }
    .quote p {
      margin: 12px 0 0;
      font-size: clamp(1.6rem, 3vw, 2.6rem);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: .12em;
      line-height: 1.15;
    }
    footer {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      gap: 18px;
      color: #8c95a3;
      font-size: 13px;
      flex-wrap: wrap;
    }
    footer a {
      color: inherit;
      text-decoration: none;
    }
    @media (max-width: 960px) {
      .hero, .units, .stats { grid-template-columns: 1fr; }
      .section-head { flex-direction: column; align-items: start; }
      .poster-body { min-height: 360px; }
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="grid"></div>
    <div class="orb-lime"></div>
    <div class="orb-violet"></div>
    <div class="shell">
      <div class="topline">
        <div class="badge">WISE²</div>
        <div>Command Center</div>
      </div>

      <section class="hero">
        <div>
          <div class="eyebrow">Atlanta, GA · Command Center</div>
          <h1>
            WISE²
            <span class="accent">Business OS</span>
          </h1>
          <p class="lead">
            Building empires, changing culture. WISE² is the brand system for founders
            who want sharper identity, stronger execution, and a legacy that reads like
            a movement.
          </p>
          <div class="actions">
            <a class="btn btn-primary" href="#statement">Start Your Build</a>
            <a class="btn btn-secondary" href="#businesses">See the Businesses</a>
          </div>
          <div class="stats">
            <div class="card"><div class="value">1</div><div class="label">system</div></div>
            <div class="card"><div class="value">3</div><div class="label">powered businesses</div></div>
            <div class="card"><div class="value">4</div><div class="label">leaders</div></div>
          </div>
        </div>

        <div class="poster">
          <div class="poster-top">
            <span>New Brand Identity</span>
            <span style="color: var(--lime);">Legacy mode</span>
          </div>
          <div class="poster-body">
            <div class="poster-copy">
              <strong>One system. Three powered businesses. Four leaders.</strong>
              <div style="font-size: 1.1rem; line-height: 1.7; color: var(--text);">
                Together we build legacy. The poster is the promise. The homepage is the proof.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section" id="businesses">
        <div class="section-head">
          <div>
            <div class="kicker">Brand architecture</div>
            <h2>Three businesses. One operating system.</h2>
          </div>
          <p>
            The experience is designed to feel like a high-trust, high-output studio for
            founders building something bigger than a service page.
          </p>
        </div>

        <div class="units">
          <article class="unit">
            <div class="kicker">Premium detailing</div>
            <h3>Wise Shine</h3>
            <p>
              A precision service brand built for shine, finish, and first impressions
              that last.
            </p>
          </article>
          <article class="unit">
            <div class="kicker">Music and media</div>
            <h3>Piff City Creative Studios</h3>
            <p>
              A creative engine for sound, story, visuals, and culture-making output.
            </p>
          </article>
          <article class="unit">
            <div class="kicker">Operating layer</div>
            <h3>WISE² Business OS</h3>
            <p>
              The system connecting the businesses, the leaders, and the daily execution
              that powers the brand.
            </p>
          </article>
        </div>
      </section>

      <section class="quote" id="statement">
        <strong>Brand statement</strong>
        <p>This is not a refresh. This is a full identity shift.</p>
      </section>

      <footer>
        <div>WISE² · Building empires. Changing culture.</div>
        <div><a href="mailto:contact@wise2.net">contact@wise2.net</a></div>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  if (req.url === '/jo-credit-os' || req.url === '/jo-credit-os/') {
    res.writeHead(308, { Location: '/business-os' });
    res.end();
    return;
  }

  if (req.url === '/business-os' || req.url === '/business-os/') {
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
