/** Demo data for client presentation and offline preview. */

export const DEMO_STATS = {
  todaySales: 1287,
  inventoryItems: 248,
  productCount: 86,
  lowStock: 7,
  bestSellerCount: 12,
};

export const DEMO_NEXT_EVENT = {
  id: 'demo-event-1',
  name: 'Downtown Night Market',
  date: '2026-09-06T17:00:00.000Z',
  venue: 'City Center Plaza',
  address: '123 Main St, Atlanta, GA',
  status: 'PACKING',
};

export const DEMO_BEST_SELLERS = [
  { name: 'Cherry Bomb Hoodie', size: 'M', sold: 18, revenue: 1260 },
  { name: 'Lavender Crop Top', size: 'S', sold: 14, revenue: 560 },
  { name: 'Pink Statement Earrings', size: 'OS', sold: 12, revenue: 360 },
  { name: 'Royal Plum Joggers', size: 'L', sold: 9, revenue: 720 },
  { name: 'Cherry Logo Tee', size: 'M', sold: 8, revenue: 320 },
];

export const DEMO_PRODUCTS = [
  {
    id: 'p1',
    name: 'Cherry Bomb Hoodie',
    sku: 'CB-HOOD-001',
    category: 'Hoodies',
    collection: 'Fall Drop',
    retailPrice: 70,
    cost: 28,
    images: [],
    status: 'ACTIVE',
    variants: [
      { id: 'v1', size: 'S', color: 'Hot Pink', quantity: 4, bin: 'Pink Bin #2', minimumStock: 3 },
      { id: 'v2', size: 'M', color: 'Hot Pink', quantity: 8, bin: 'Pink Bin #2', minimumStock: 3 },
      { id: 'v3', size: 'L', color: 'Hot Pink', quantity: 2, bin: 'Pink Bin #2', minimumStock: 3 },
    ],
  },
  {
    id: 'p2',
    name: 'Lavender Crop Top',
    sku: 'LV-CROP-002',
    category: 'Tops',
    collection: 'Summer Drop',
    retailPrice: 40,
    cost: 14,
    images: [],
    status: 'ACTIVE',
    variants: [
      { id: 'v4', size: 'S', color: 'Lavender', quantity: 6, bin: 'Rack A', minimumStock: 2 },
      { id: 'v5', size: 'M', color: 'Lavender', quantity: 3, bin: 'Rack A', minimumStock: 2 },
    ],
  },
  {
    id: 'p3',
    name: 'Pink Statement Earrings',
    sku: 'PK-EAR-003',
    category: 'Accessories',
    collection: 'Always On',
    retailPrice: 30,
    cost: 8,
    images: [],
    status: 'ACTIVE',
    variants: [
      { id: 'v6', size: 'OS', color: 'Pink', quantity: 15, bin: 'Pink Bin #1', minimumStock: 5 },
    ],
  },
];

export const DEMO_CONTAINERS = [
  { id: 'c1', name: 'Pink Bin #1', type: 'BIN', color: 'Hot Pink', description: 'Accessories', qrCode: 'cc-bin-a1b2c3' },
  { id: 'c2', name: 'Pink Bin #2', type: 'BIN', color: 'Hot Pink', description: 'Hoodies', qrCode: 'cc-bin-d4e5f6' },
  { id: 'c3', name: 'Purple Crate', type: 'TOTE', color: 'Royal Plum', description: 'Limited Drops', qrCode: 'cc-tote-g7h8i9' },
  { id: 'c4', name: 'Rack A', type: 'RACK', color: 'Chrome', description: 'Tops', qrCode: 'cc-rack-j0k1l2' },
];

export const DEMO_CUSTOMERS = [
  {
    id: 'cu1',
    name: 'Brianna R.',
    phone: '(404) 555-0182',
    instagram: '@brianna_styles',
    preferredSize: 'M',
    favoriteColors: ['Lavender', 'Hot Pink'],
    vipStatus: true,
    lifetimeValue: 1240,
    notes: 'Loves limited drops. Always asks about Medium hoodies.',
    demand: [{ request: 'Need Medium', count: 8 }, { request: 'Need Lavender', count: 6 }],
  },
  {
    id: 'cu2',
    name: 'Jasmine K.',
    phone: '(678) 555-0291',
    instagram: '@jazzyk_fashion',
    preferredSize: 'S',
    favoriteColors: ['Cherry Red'],
    vipStatus: false,
    lifetimeValue: 380,
    notes: 'Prefers crop tops and accessories.',
    demand: [{ request: 'Need Small Crop', count: 4 }],
  },
];

export const DEMO_SALES_TREND = [
  { day: 'Mon', sales: 420 },
  { day: 'Tue', sales: 680 },
  { day: 'Wed', sales: 540 },
  { day: 'Thu', sales: 890 },
  { day: 'Fri', sales: 1287 },
  { day: 'Sat', sales: 1540 },
  { day: 'Sun', sales: 980 },
];

export const DEMO_AI_INSIGHT = {
  greeting: 'Hey Boss 💋',
  tip: 'Your Cherry Bomb Hoodie (M) is your #1 seller — consider bringing 6 more to Downtown Night Market.',
  poweredBy: 'WISE² Intelligence',
};

export const DEMO_PHONE_CONFIG = {
  enabled: true,
  phoneNumber: '(404) 867-2446',
  greeting:
    "Hey love! Thanks for calling Brianna's Boutique. I'm Cherry, Brianna's AI assistant. I can help with sizes, our next pop-up, or hold an item for you.",
  afterHoursMessage:
    "We're closed right now, but I can take a message or text you when we're back.",
  transferNumber: '(404) 555-0182',
  smsEnabled: true,
  voicemailEnabled: true,
  aiPersona: 'Cherry',
  businessHours: {
    mon: { open: '10:00', close: '19:00' },
    tue: { open: '10:00', close: '19:00' },
    wed: { open: '10:00', close: '19:00' },
    thu: { open: '10:00', close: '19:00' },
    fri: { open: '10:00', close: '21:00' },
    sat: { open: '11:00', close: '21:00' },
    sun: { closed: true },
  },
};

export const DEMO_PHONE_STATS = {
  callsToday: 3,
  totalCalls: 47,
  avgDurationSeconds: 118,
  leadsCaptured: 12,
  aiActive: true,
};

export const DEMO_PHONE_CALLS = [
  {
    id: 'call-1',
    callerNumber: '(404) 555-0142',
    callerName: 'Sarah M.',
    direction: 'INBOUND',
    status: 'COMPLETED',
    durationSeconds: 134,
    intent: 'Product availability',
    outcome: 'HOLD_PLACED',
    summary: 'Cherry Bomb Hoodie (M) hold placed for Downtown Night Market.',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'call-2',
    callerNumber: '(678) 555-0298',
    callerName: 'Imani L.',
    direction: 'INBOUND',
    status: 'COMPLETED',
    durationSeconds: 182,
    intent: 'Sizing help',
    outcome: 'SMS_SENT',
    summary: 'Sent Lavender Crop Top size chart and Instagram link.',
    startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'call-3',
    callerNumber: '(770) 555-0311',
    callerName: 'Unknown',
    direction: 'INBOUND',
    status: 'COMPLETED',
    durationSeconds: 105,
    intent: 'Pop-up info',
    outcome: 'TRANSFERRED',
    summary: 'Transferred to Brianna for booth details.',
    startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
];

export const DEMO_PHONE_CAPABILITIES = [
  'Answer sizing and availability questions',
  'Share next pop-up date, time, and location',
  'Hold items and capture customer requests',
  'Send SMS follow-ups with Instagram links',
  'Transfer urgent calls to Brianna',
  'Take after-hours voicemails',
];

export const DEMO_PACKING = [
  { item: 'Cherry Bomb Hoodie (M)', bin: 'Pink Bin #2', qty: 6, status: 'PACKED' },
  { item: 'Cherry Bomb Hoodie (L)', bin: 'Pink Bin #2', qty: 4, status: 'PACKED' },
  { item: 'Lavender Crop Top (S)', bin: 'Rack A', qty: 5, status: 'NOT_PACKED' },
  { item: 'Pink Statement Earrings', bin: 'Pink Bin #1', qty: 10, status: 'PACKED' },
  { item: 'Royal Plum Joggers (L)', bin: 'Purple Crate', qty: 3, status: 'NOT_PACKED' },
];
