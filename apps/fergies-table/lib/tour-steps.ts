export type FergieTourStep = {
  id: string;
  route: string;
  title: string;
  body: string;
  tip: string;
  voice: string;
  anchor?: string;
};

export const OWNER_TOUR_STEPS: FergieTourStep[] = [
  {
    id: 'command',
    route: '/business',
    title: "Chef's Command",
    body: "This is the pass for the business: revenue, kitchen load, and open inquiries in one view.",
    tip: 'Treat it like the line. One glance, and you know where the house stands.',
    voice:
      'Good evening, Chef. This is Command. Revenue, the kitchen, and open inquiries, all in one place. Treat it like the pass. One glance, and you know where the house stands.',
    anchor: 'command-header',
  },
  {
    id: 'stats',
    route: '/business',
    title: 'The numbers',
    body: 'August revenue, new leads, live tickets, and outstanding balances move with service.',
    tip: 'Outstanding is money still due on deposits and invoices.',
    voice:
      'These are the numbers for the house. August is sitting at eight thousand one hundred. One new inquiry. Two tickets on the board. Sixteen hundred forty still outstanding. No spreadsheet. Just the line.',
    anchor: 'command-stats',
  },
  {
    id: 'leads-preview',
    route: '/business',
    title: 'Who is booking',
    body: 'New and quoted events sit here so you can close the table before the date fills.',
    tip: 'Amina Cole is a new anniversary dinner. Tap All leads to work the book.',
    voice:
      'Here is who is asking for the table. Amina Cole, anniversary dinner, twelve covers. Marcus Hale is quoted on a cocktail soiree for twenty eight. Close them before the book fills.',
    anchor: 'command-leads',
  },
  {
    id: 'kitchen',
    route: '/kitchen',
    title: 'Kitchen tickets',
    body: 'Guest orders land here. Move Confirmed to Preparing to Out to Completed.',
    tip: 'Nothing leaves the pass until the ticket is complete.',
    voice:
      'This is the pass. Tickets come in confirmed, then preparing, then out, then completed. Same discipline as the line. Nothing leaves until the ticket is done.',
    anchor: 'kitchen-tickets',
  },
  {
    id: 'calendar',
    route: '/calendar',
    title: 'The book',
    body: 'Private tables, tastings, and catering dates live here. Gold days already have a hold.',
    tip: "September 7 is Chef's Table. Leave room around a tasting night.",
    voice:
      "This is the book. Gold days are already held. September seventh is Chef's Table. Guard that night. Leave room around a tasting.",
    anchor: 'calendar-book',
  },
  {
    id: 'leads',
    route: '/leads',
    title: 'Lead pipeline',
    body: 'Advance a guest from New to Quoted to Booked. Quotes and payments sit under More.',
    tip: 'Marcus Hale is quoted on a cocktail soirée. Follow up before the date slips.',
    voice:
      'The pipeline. New, quoted, booked. Move a guest as you speak with them. Quotes and payments live under More, next to the date they belong to.',
    anchor: 'leads-list',
  },
  {
    id: 'ai',
    route: '/ai',
    title: 'Personal assistant',
    body: 'Savôré is on the line for menus, pricing, and event planning.',
    tip: 'Ask in the gold cloche anytime. Say start the tour to walk the house again.',
    voice:
      'I am Savôré. I work the house with you. Ask me about tickets, inquiries, menus, or pricing. I am on the line whenever you need me.',
    anchor: 'ai-briefing',
  },
  {
    id: 'finish',
    route: '/business',
    title: 'The house is open',
    body: 'Command, kitchen, calendar, leads. More holds quotes, payments, and the menu board.',
    tip: 'Preview the guest table from More when you want to see what they order.',
    voice:
      'The house is set. Command, kitchen, the book, and leads. More holds quotes, payments, and the board. Go cook, Chef. I will keep the table.',
    anchor: 'command-shortcuts',
  },
];

export const GUEST_TOUR_STEPS: FergieTourStep[] = [
  {
    id: 'welcome',
    route: '/home',
    title: "Welcome to Fergie's Table",
    body: 'We cook. You connect. Order plates, book a private table, or plan catering from your phone.',
    tip: 'Real Food. Real Love. Real Results.',
    voice:
      "Welcome to Fergie's Table. We cook. You connect. Order a plate, book a private table, or plan catering from your phone. Real food. Real love. Real results.",
    anchor: 'home-header',
  },
  {
    id: 'actions',
    route: '/home',
    title: 'Start here',
    body: 'Order now, catering, book a table, or rewards. The concierge can shape the night with you.',
    tip: 'Savôré every moment.',
    voice:
      'Start here. Order now, plan catering, hold a table, or check rewards. If you would rather talk it through, ask me and I will shape the night.',
    anchor: 'home-actions',
  },
  {
    id: 'menu',
    route: '/menu',
    title: 'The plates',
    body: 'Starters through dessert. Sold-out plates are marked from the kitchen board.',
    tip: 'Wine-Braised Short Rib and Citrus Cedar Salmon are the ones people remember.',
    voice:
      'These are the plates. Starters through dessert. Wine-braised short rib and citrus cedar salmon are the ones guests remember. If the kitchen eighty-sixes a dish, you will see it here.',
    anchor: 'menu-list',
  },
  {
    id: 'catering',
    route: '/catering',
    title: 'For the room',
    body: "Luxury Dinner, Cocktail Soirée, Sunday Table, and Chef's Table. Packages start at $48 a guest.",
    tip: "Chef's Table is intimate: 2 to 8 guests, Fergie in the room.",
    voice:
      "For the room. Luxury dinner, cocktail soiree, Sunday table. Chef's Table is intimate. Two to eight guests, with Fergie in the room. Packages begin at forty eight a guest.",
    anchor: 'catering-list',
  },
  {
    id: 'book',
    route: '/book',
    title: 'Hold the date',
    body: 'Pick the occasion, guest count, and service style. Fergie confirms by phone.',
    tip: 'September 7 and 12 are already held.',
    voice:
      'Hold the date. Occasion, covers, and how you would like to be served. Fergie confirms by phone. September seventh and twelfth are already on the book.',
    anchor: 'book-form',
  },
  {
    id: 'ai',
    route: '/ai',
    title: 'Your concierge',
    body: 'Ask Savôré to plan a dinner, price a soirée, or work around allergies.',
    tip: 'Try "Plan a dinner for two" or tap Start voice tour in the assistant.',
    voice:
      'I am Savôré, your concierge. Ask me to plan a dinner, price a soiree, or cook around an allergy. I am here whenever the table needs me.',
    anchor: 'ai-briefing',
  },
  {
    id: 'finish',
    route: '/home',
    title: 'The table is set',
    body: 'Order, book, or ask the concierge. Rewards track every plate toward Inner Circle.',
    tip: 'Tap the gold cloche anytime for help.',
    voice:
      'The table is set. Order, book, or ask. Rewards follow every plate. Tap the gold cloche whenever you need me. I will be right here.',
    anchor: 'home-header',
  },
];

export const OWNER_TOUR_KEY = 'fergie-tour-owner-v3';
export const GUEST_TOUR_KEY = 'fergie-tour-guest-v3';
