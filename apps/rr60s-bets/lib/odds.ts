export type Sport = 'NBA'|'NFL'|'MLB'|'NHL'|'NCAAF'|'NCAAB'|'UFC';
export type Book = 'FanDuel'|'DraftKings';
export type OddsQuote = { book: Book; american: number; capturedAt: string };
export type DemoEvent = { id: string; sport: Sport; match: string; market: string; selection: string; line: string; startsAt: string; quotes: OddsQuote[]; signalScore: number; reasons: string[] };
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
