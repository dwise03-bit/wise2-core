export type Sport = 'NBA'|'NFL'|'MLB'|'NHL'|'NCAAF'|'NCAAB'|'UFC';
export type Book = 'FanDuel'|'DraftKings';
export type OddsQuote = { book: Book; american: number; capturedAt: string };
export type DemoEvent = { id: string; sport: Sport; match: string; market: string; selection: string; line: string; startsAt: string; quotes: OddsQuote[]; signalScore: number; reasons: string[] };
export type EventFeed = { live: boolean; events: DemoEvent[]; source: string; capturedAt: string };
export interface OddsProvider {
  getSports(): Promise<Sport[]>;
  getEvents(sport?: Sport): Promise<DemoEvent[]>;
  getMarkets(eventId: string): Promise<string[]>;
  getOdds(eventId: string): Promise<OddsQuote[]>;
  getEventOdds(eventId: string): Promise<DemoEvent | null>;
}
const capturedAt = '2026-10-04T12:00:00.000Z';
export const demoEvents: DemoEvent[] = [
  {id:'nba-lal-den',sport:'NBA',match:'Lakers vs Nuggets',market:'Spread',selection:'Lakers',line:'+0.5',startsAt:'2026-10-05T00:30:00.000Z',quotes:[{book:'FanDuel',american:-105,capturedAt},{book:'DraftKings',american:-112,capturedAt}],signalScore:92,reasons:['Favorable demo line comparison','Recent-form rule matched','Injury status requires verification','Strategy rule matched']},
  {id:'nfl-bal-pit',sport:'NFL',match:'Ravens vs Steelers',market:'Total',selection:'Under',line:'44.5',startsAt:'2026-10-06T00:20:00.000Z',quotes:[{book:'FanDuel',american:-110,capturedAt},{book:'DraftKings',american:-105,capturedAt}],signalScore:78,reasons:['Demo price difference','Matchup rule matched']},
  {id:'mlb-ny-bos',sport:'MLB',match:'Yankees vs Red Sox',market:'Moneyline',selection:'Yankees',line:'ML',startsAt:'2026-10-06T22:10:00.000Z',quotes:[{book:'FanDuel',american:-120,capturedAt},{book:'DraftKings',american:-115,capturedAt}],signalScore:74,reasons:['Demo price difference','Market rule matched']},
  {id:'nhl-ny-bos',sport:'NHL',match:'Rangers vs Bruins',market:'Total',selection:'Over',line:'5.5',startsAt:'2026-10-07T23:00:00.000Z',quotes:[{book:'FanDuel',american:100,capturedAt},{book:'DraftKings',american:-105,capturedAt}],signalScore:71,reasons:['Demo price difference','Total rule matched']},
  {id:'ncaa-tex-ou',sport:'NCAAF',match:'Texas vs Oklahoma',market:'Spread',selection:'Texas',line:'-3.5',startsAt:'2026-10-10T19:30:00.000Z',quotes:[{book:'FanDuel',american:-110,capturedAt},{book:'DraftKings',american:-115,capturedAt}],signalScore:69,reasons:['Demo price difference']},
  {id:'ncaab-duke-unc',sport:'NCAAB',match:'Duke vs UNC',market:'Moneyline',selection:'Duke',line:'ML',startsAt:'2026-11-01T20:00:00.000Z',quotes:[{book:'FanDuel',american:125,capturedAt},{book:'DraftKings',american:120,capturedAt}],signalScore:67,reasons:['Demo price difference']},
  {id:'ufc-main',sport:'UFC',match:'Fighter A vs Fighter B',market:'Moneyline',selection:'Fighter A',line:'ML',startsAt:'2026-10-11T02:00:00.000Z',quotes:[{book:'FanDuel',american:-105,capturedAt},{book:'DraftKings',american:-110,capturedAt}],signalScore:64,reasons:['Demo price difference']}
];
export const bestQuote = (quotes: OddsQuote[]) => quotes.reduce((best, quote) => quote.american > best.american ? quote : best);
export const potentialPayout = (stake: number, american: number) => Math.round((stake + (american > 0 ? stake * american / 100 : stake * 100 / -american)) * 100) / 100;
export class DemoOddsProvider implements OddsProvider {
  async getSports() { return [...new Set(demoEvents.map(event => event.sport))]; }
  async getEvents(sport?: Sport) { return sport ? demoEvents.filter(event => event.sport === sport) : demoEvents; }
  async getMarkets(eventId: string) { return [...new Set(demoEvents.filter(event => event.id === eventId).map(event => event.market))]; }
  async getOdds(eventId: string) { return (await this.getEventOdds(eventId))?.quotes ?? []; }
  async getEventOdds(eventId: string) { return demoEvents.find(event => event.id === eventId) ?? null; }
}

// ---- Live provider (The Odds API). Server-only. Key via ODDS_API_KEY. ----
const ODDS_SPORT_KEYS: Record<Sport, string> = {
  NBA:'basketball_nba', NFL:'americanfootball_nfl', MLB:'baseball_mlb', NHL:'icehockey_nhl',
  NCAAF:'americanfootball_ncaaf', NCAAB:'basketball_ncaab', UFC:'mma_mixed_martial_arts'
};
const BOOK_KEYS: Record<string, Book> = { fanduel:'FanDuel', draftkings:'DraftKings' };

function americanFromPrice(decimal: number): number {
  // The Odds API returns decimal odds. Convert to American.
  return decimal >= 2 ? Math.round((decimal - 1) * 100) : Math.round(-100 / (decimal - 1));
}

// Signal is a real, explainable comparison of the two books' prices — never a prediction.
function computeSignal(quotes: OddsQuote[]): { score: number; reasons: string[] } {
  if (quotes.length < 2) return { score: 50, reasons: ['Single book priced; limited comparison'] };
  const high = Math.max(...quotes.map(q => q.american));
  const low = Math.min(...quotes.map(q => q.american));
  const spread = Math.abs(high - low);
  const score = Math.max(40, Math.min(99, 60 + Math.round(spread / 2)));
  const reasons = [
    `Price gap of ${spread} between books`,
    spread >= 10 ? 'Notable line divergence — verify before acting' : 'Books broadly agree on price',
    'Confirm live price and conditions yourself'
  ];
  return { score, reasons };
}

async function fetchSportEvents(sport: Sport, apiKey: string, capturedAtIso: string): Promise<DemoEvent[]> {
  const key = ODDS_SPORT_KEYS[sport];
  const url = `https://api.the-odds-api.com/v4/sports/${key}/odds/?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals&oddsFormat=decimal&bookmakers=fanduel,draftkings`;
  const res = await fetch(url, { next: { revalidate: 45 } } as RequestInit);
  if (!res.ok) throw new Error(`odds api ${sport} ${res.status}`);
  const games = await res.json() as any[];
  const out: DemoEvent[] = [];
  for (const g of games) {
    const match = `${g.away_team} vs ${g.home_team}`;
    // Prefer h2h (moneyline) for a clean two-book comparison; fall back to spreads/totals.
    const picks: { market: string; selection: string; line: string; outcomeKey: string; point?: number }[] = [];
    const h2h = g.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'h2h');
    if (h2h) picks.push({ market:'Moneyline', selection: g.away_team, line:'ML', outcomeKey: g.away_team });
    const spreads = g.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'spreads');
    if (!h2h && spreads?.outcomes?.[0]) picks.push({ market:'Spread', selection: spreads.outcomes[0].name, line: `${spreads.outcomes[0].point>0?'+':''}${spreads.outcomes[0].point}`, outcomeKey: spreads.outcomes[0].name });
    const totals = g.bookmakers?.[0]?.markets?.find((m: any) => m.key === 'totals');
    if (!h2h && !spreads && totals?.outcomes?.[0]) picks.push({ market:'Total', selection: totals.outcomes[0].name, line: `${totals.outcomes[0].point}`, outcomeKey: totals.outcomes[0].name, point: totals.outcomes[0].point });
    const pick = picks[0];
    if (!pick) continue;
    const quotes: OddsQuote[] = [];
    for (const bm of g.bookmakers ?? []) {
      const book = BOOK_KEYS[bm.key];
      if (!book) continue;
      const market = bm.markets?.find((m: any) => m.key === (pick.market==='Moneyline'?'h2h':pick.market==='Spread'?'spreads':'totals'));
      const outcome = market?.outcomes?.find((o: any) => o.name === pick.outcomeKey);
      if (outcome) quotes.push({ book, american: americanFromPrice(outcome.price), capturedAt: capturedAtIso });
    }
    if (quotes.length === 0) continue;
    const signal = computeSignal(quotes);
    out.push({ id: g.id, sport, match, market: pick.market, selection: pick.selection, line: pick.line, startsAt: g.commence_time, quotes, signalScore: signal.score, reasons: signal.reasons });
  }
  return out;
}

// Loads the event feed. Returns live data when ODDS_API_KEY is set and reachable,
// otherwise falls back to the clearly-labeled demo feed. Never presents demo data as live.
export async function loadEventFeed(): Promise<EventFeed> {
  const apiKey = process.env.ODDS_API_KEY;
  const now = new Date().toISOString();
  if (!apiKey) return { live: false, events: demoEvents, source: 'demo', capturedAt };
  try {
    const sports: Sport[] = ['NBA','NFL','MLB','NHL','NCAAF','NCAAB','UFC'];
    const results = await Promise.allSettled(sports.map(s => fetchSportEvents(s, apiKey, now)));
    const events = results.flatMap(r => r.status === 'fulfilled' ? r.value : []).slice(0, 40);
    if (events.length === 0) return { live: false, events: demoEvents, source: 'demo-fallback', capturedAt };
    return { live: true, events, source: 'the-odds-api', capturedAt: now };
  } catch {
    return { live: false, events: demoEvents, source: 'demo-fallback', capturedAt };
  }
}
