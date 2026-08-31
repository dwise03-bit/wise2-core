const guestReplies: { test: (q: string) => boolean; text: string }[] = [
  {
    test: (q) => /dinner|plan|tonight|date night|for two/.test(q),
    text: 'For an intimate dinner I would plate Citrus Cedar Salmon, Four-Cheese Mac, and Vanilla Bean Cheesecake. Add Honey Cornbread if you want the table to feel like home. I can hold Saturday at 7:00 PM.',
  },
  {
    test: (q) => /cater|event|party|soiree|soirée/.test(q),
    text: 'The Cocktail Soiree package is the one people remember: passed bites, a grazing table, and a signature mocktail. For 20-30 guests it starts at $55 a person. Want me to draft a quote?',
  },
  {
    test: (q) => /vegan|vegetarian|allergy|gluten/.test(q),
    text: 'We can do a full vegetarian table and most dishes can be made gluten-free with notice. Tell me the guest count and any allergies and I will shape the menu around them.',
  },
  {
    test: (q) => /price|cost|budget/.test(q),
    text: "Plates start at $8 sides and $26 entrees. Catering packages start at $48 a guest for Sunday Table and $125 for Chef's Table. Share a date and headcount and I will price it cleanly.",
  },
  {
    test: (q) => /book|reserve|table/.test(q),
    text: 'I can book a private table or an on-site service date. September 7 and 12 are already held. If you send a date, guest count, and vibe I will lock the hold.',
  },
  {
    test: (q) => /reward|points|loyalty/.test(q),
    text: 'You are on the Savôré tier with 2,480 points. Inner Circle opens at 3,500: that is one more plated dinner or a small catering drop. Birthday dessert is already unlocked.',
  },
  {
    test: (q) => /popular|best|signature|shrimp|rib|salmon/.test(q),
    text: 'The house favorites are Brown Butter Shrimp, Wine-Braised Short Rib, and Citrus Cedar Salmon. Four-Cheese Mac is the side people fight over.',
  },
];

const ownerReplies: { test: (q: string) => boolean; text: string }[] = [
  {
    test: (q) => /kitchen|ticket|preparing|queue/.test(q),
    text: 'The pass has live tickets. Move confirmed to preparing, then out, then completed. New guest orders land there on their own.',
  },
  {
    test: (q) => /lead|amina|marcus|pipeline/.test(q),
    text: 'Amina Cole is a new anniversary dinner, twelve covers, nine hundred eighty. Marcus Hale is quoted on a cocktail soiree for twenty eight. Advance them in Leads when you speak.',
  },
  {
    test: (q) => /revenue|august|outstanding|money/.test(q),
    text: 'August is eight thousand one hundred. Outstanding is sixteen hundred forty, mostly the Hale deposit. Payments under More shows card, Zelle, and invoice.',
  },
  {
    test: (q) => /sold out|86|menu board/.test(q),
    text: 'Menu board lets you 86 a plate for guests. Sold-out items stay visible on the guest menu with Unavailable.',
  },
  {
    test: (q) => /quote|proposal|price/.test(q),
    text: 'Quotes live under More. Sent proposals wait on the client. Accepted ones should move to Booked on the calendar and a payment if a deposit is due.',
  },
  {
    test: (q) => /calendar|booked|september|chef.?s table/.test(q),
    text: "September 7 is Chef's Table. Gold days on the calendar already have a hold. Leave breathing room around tasting nights.",
  },
  {
    test: (q) => /dinner|menu|cater|allergy|gluten/.test(q),
    text: 'For a tasting I would plate Short Rib, Cedar Salmon, and cheesecake. Flag gluten-free on the ticket so the pass sees it.',
  },
];

const fallbackGuest =
  'Tell me the occasion, the covers, and anything they love to eat. I will shape a dinner, a catering package, or a hold.';
const fallbackOwner =
  'Ask me about the pass, new inquiries, revenue, the book, or a menu. Say start the tour if you want to walk Command again.';

export function conciergeReply(message: string, role: 'guest' | 'owner' = 'guest'): string {
  const q = message.toLowerCase();
  const bank = role === 'owner' ? ownerReplies : guestReplies;
  return bank.find((r) => r.test(q))?.text ?? (role === 'owner' ? fallbackOwner : fallbackGuest);
}
