export type MenuCategory = 'Starters' | 'Entrees' | 'Sides' | 'Desserts';

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  price: number;
  serves?: string;
  description: string;
  image: string;
  popular?: boolean;
};

export type CateringPackage = {
  id: string;
  name: string;
  guests: string;
  priceFrom: number;
  description: string;
  includes: string[];
  image: string;
};

export type OrderStatus = 'Confirmed' | 'Preparing' | 'Out for Delivery' | 'Completed' | 'Cancelled';

export type DemoOrder = {
  id: string;
  title: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: string[];
};

export type LeadStatus = 'New' | 'Quoted' | 'Booked' | 'Closed';

export type DemoLead = {
  id: string;
  name: string;
  event: string;
  date: string;
  guests: number;
  status: LeadStatus;
  value: number;
};

export type DemoQuote = {
  id: string;
  client: string;
  packageName: string;
  amount: number;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Expired';
  date: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  guests: number;
  type: 'Dinner' | 'Catering' | 'Tasting' | 'Private Table';
};

const img = (id: string, extra = '') =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80${extra}`;

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'starter-brulee-shrimp',
    name: 'Brown Butter Shrimp',
    category: 'Starters',
    price: 18,
    description: 'Gulf shrimp, brown butter, lemon, herbs, and toasted brioche.',
    image: img('photo-1559737558-2f5a35f4523b'),
    popular: true,
  },
  {
    id: 'starter-burrata',
    name: 'Heirloom Burrata',
    category: 'Starters',
    price: 16,
    description: 'Warm honey, cracked pepper, basil oil, and grilled sourdough.',
    image: img('photo-1608897013039-887f21d8c804'),
  },
  {
    id: 'starter-oxtail',
    name: 'Oxtail Empanadas',
    category: 'Starters',
    price: 14,
    description: 'Slow-braised oxtail, sofrito, and gold-dusted pastry.',
    image: img('photo-1626082927389-6cd097cdc6ec'),
  },
  {
    id: 'entree-short-rib',
    name: 'Wine-Braised Short Rib',
    category: 'Entrees',
    price: 38,
    serves: 'Plate',
    description: 'Red wine jus, garlic mashed potatoes, and glazed carrots.',
    image: img('photo-1544025162-d76694265947'),
    popular: true,
  },
  {
    id: 'entree-salmon',
    name: 'Citrus Cedar Salmon',
    category: 'Entrees',
    price: 34,
    description: 'Charred citrus, herb butter, and roasted fennel.',
    image: img('photo-1467003909585-2f8a72700288'),
    popular: true,
  },
  {
    id: 'entree-chicken',
    name: 'Herb-Roasted Chicken',
    category: 'Entrees',
    price: 28,
    description: 'Pan jus, rosemary potatoes, and collard greens.',
    image: img('photo-1598103442097-8b74394b95c6'),
  },
  {
    id: 'entree-pasta',
    name: 'Truffle Mushroom Pasta',
    category: 'Entrees',
    price: 26,
    description: 'Handmade pasta, wild mushrooms, parmesan cream, black truffle.',
    image: img('photo-1621996346565-e3dbc646d9a9'),
  },
  {
    id: 'side-mac',
    name: 'Four-Cheese Mac',
    category: 'Sides',
    price: 12,
    description: 'Smoked gouda, gruyere, cheddar, and gold breadcrumb crust.',
    image: img('photo-1543339494-b4cd4f7ba686'),
    popular: true,
  },
  {
    id: 'side-greens',
    name: 'Garlic Collard Greens',
    category: 'Sides',
    price: 10,
    description: 'Slow-simmered greens, smoked turkey, and chili oil.',
    image: img('photo-1576045057995-568f588f82fb'),
  },
  {
    id: 'side-cornbread',
    name: 'Honey Cornbread',
    category: 'Sides',
    price: 8,
    description: 'Skillet cornbread, whipped honey butter, flaky salt.',
    image: img('photo-1574085733277-851d9d856a3a'),
  },
  {
    id: 'dessert-cheesecake',
    name: 'Vanilla Bean Cheesecake',
    category: 'Desserts',
    price: 14,
    description: 'Rose gold berry glaze and pistachio crumble.',
    image: img('photo-1533134242443-d4fd215305ad'),
    popular: true,
  },
  {
    id: 'dessert-cobbler',
    name: 'Bourbon Peach Cobbler',
    category: 'Desserts',
    price: 13,
    description: 'Brown sugar peaches, buttermilk biscuit, vanilla cream.',
    image: img('photo-1464305795204-6f5bbfc7fb81'),
  },
];

export const CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'luxury-dinner',
    name: 'Luxury Dinner',
    guests: '8–20 guests',
    priceFrom: 85,
    description: 'A plated chef experience with wine pairing notes and full table styling.',
    includes: ['3-course plated menu', 'Tablescape styling', 'Service staff', 'Dessert service'],
    image: img('photo-1414235077428-338989a2e8c0'),
  },
  {
    id: 'cocktail-soiree',
    name: 'Cocktail Soirée',
    guests: '15–40 guests',
    priceFrom: 55,
    description: 'Passed bites, signature sips, and a grazing table that photographs beautifully.',
    includes: ['8 canapé selections', 'Grazing table', 'Signature mocktail', 'Setup & breakdown'],
    image: img('photo-1559339352-11d035aa65de'),
  },
  {
    id: 'sunday-table',
    name: 'Sunday Table',
    guests: '6–16 guests',
    priceFrom: 48,
    description: 'Family-style comfort, elevated. Built for connection, not just the plate.',
    includes: ['Family-style entrees', '3 sides', 'Cornbread & honey butter', 'Cobbler'],
    image: img('photo-1504674900247-0877df9cc836'),
  },
  {
    id: 'chefs-table',
    name: "Chef's Table",
    guests: '2–8 guests',
    priceFrom: 125,
    description: 'Intimate tasting menu with Chef Fergie in the room. Limited dates.',
    includes: ['6-course tasting', 'Wine pairing add-on', 'Personal chef service', 'Keepsake menu'],
    image: img('photo-1551218808-94e220e084d2'),
  },
];

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'FT-2041',
    title: 'Friday Date Night',
    date: '2026-09-05',
    total: 96,
    status: 'Confirmed',
    items: ['Citrus Cedar Salmon', 'Four-Cheese Mac', 'Vanilla Bean Cheesecake'],
  },
  {
    id: 'FT-2033',
    title: 'Sunday Table for 8',
    date: '2026-08-24',
    total: 412,
    status: 'Completed',
    items: ['Sunday Table package', 'Honey Cornbread', 'Bourbon Peach Cobbler'],
  },
  {
    id: 'FT-2028',
    title: 'Office Lunch Drop',
    date: '2026-08-18',
    total: 186,
    status: 'Completed',
    items: ['Herb-Roasted Chicken x6', 'Garlic Collard Greens'],
  },
];

export const REWARDS = {
  points: 2480,
  tier: 'Savôré',
  nextTier: 'Inner Circle',
  nextAt: 3500,
  perks: ['Priority booking', 'Birthday dessert', 'Early menu access'],
};

export const DEMO_LEADS: DemoLead[] = [
  { id: 'L-118', name: 'Amina Cole', event: 'Anniversary dinner', date: '2026-09-12', guests: 12, status: 'New', value: 980 },
  { id: 'L-117', name: 'Marcus Hale', event: 'Cocktail soirée', date: '2026-09-20', guests: 28, status: 'Quoted', value: 1640 },
  { id: 'L-114', name: 'Nia Brooks', event: "Chef's table", date: '2026-09-07', guests: 6, status: 'Booked', value: 820 },
  { id: 'L-110', name: 'Jordan Ellis', event: 'Sunday Table', date: '2026-08-30', guests: 10, status: 'Closed', value: 540 },
];

export const DEMO_QUOTES: DemoQuote[] = [
  { id: 'Q-441', client: 'Marcus Hale', packageName: 'Cocktail Soirée', amount: 1640, status: 'Sent', date: '2026-08-27' },
  { id: 'Q-438', client: 'Amina Cole', packageName: 'Luxury Dinner', amount: 980, status: 'Draft', date: '2026-08-29' },
  { id: 'Q-429', client: 'Nia Brooks', packageName: "Chef's Table", amount: 820, status: 'Accepted', date: '2026-08-21' },
];

export const DEMO_EVENTS: CalendarEvent[] = [
  { id: 'E-1', title: "Nia's Chef Table", date: '2026-09-07', time: '6:00 PM', guests: 6, type: 'Private Table' },
  { id: 'E-2', title: 'Cole Anniversary', date: '2026-09-12', time: '7:30 PM', guests: 12, type: 'Dinner' },
  { id: 'E-3', title: 'Hale Soirée', date: '2026-09-20', time: '5:00 PM', guests: 28, type: 'Catering' },
  { id: 'E-4', title: 'Menu tasting', date: '2026-09-03', time: '2:00 PM', guests: 2, type: 'Tasting' },
];

export const REVENUE_TREND = [
  { month: 'Mar', revenue: 4200 },
  { month: 'Apr', revenue: 5100 },
  { month: 'May', revenue: 4800 },
  { month: 'Jun', revenue: 6400 },
  { month: 'Jul', revenue: 7200 },
  { month: 'Aug', revenue: 8100 },
];

export const BUSINESS_STATS = {
  monthlyRevenue: 8100,
  newLeads: 7,
  bookedEvents: 4,
  outstanding: 1640,
};

export const EVENT_TYPES = ['Intimate Dinner', 'Catering', 'Cocktail Soirée', "Chef's Table", 'Sunday Table'] as const;
export const SERVICE_TYPES = ['Pickup', 'Delivery', 'On-site service', 'Private table'] as const;
export const GUEST_COUNTS = [2, 4, 6, 8, 12, 16, 20, 30, 40] as const;

export const PROFILE = {
  name: 'Guest',
  email: 'guest@fergiestable.com',
  phone: '(404) 555-0148',
  memberSince: 'March 2026',
};

export const OWNER_PROFILE = {
  name: 'Chef Fergie',
  business: "Fergie's Table & Savôré",
  email: 'fergie@fergiestable.com',
  phone: '(404) 555-0180',
  city: 'Atlanta, GA',
  hours: 'Thu-Sun · 4:00 PM - 10:00 PM',
};

export type PaymentStatus = 'Paid' | 'Pending' | 'Deposit' | 'Refunded';

export type DemoPayment = {
  id: string;
  client: string;
  amount: number;
  method: 'Card' | 'Cash' | 'Zelle' | 'Invoice';
  status: PaymentStatus;
  date: string;
  note: string;
};

export const DEMO_PAYMENTS: DemoPayment[] = [
  { id: 'P-882', client: 'Nia Brooks', amount: 820, method: 'Card', status: 'Paid', date: '2026-08-21', note: "Chef's Table deposit + balance" },
  { id: 'P-871', client: 'Sunday Table for 8', amount: 412, method: 'Zelle', status: 'Paid', date: '2026-08-24', note: 'Family-style package' },
  { id: 'P-860', client: 'Marcus Hale', amount: 400, method: 'Invoice', status: 'Deposit', date: '2026-08-27', note: 'Cocktail Soirée 25%' },
  { id: 'P-844', client: 'Office Lunch Drop', amount: 186, method: 'Card', status: 'Paid', date: '2026-08-18', note: 'Chicken + greens' },
  { id: 'P-839', client: 'Amina Cole', amount: 980, method: 'Invoice', status: 'Pending', date: '2026-08-29', note: 'Luxury Dinner quote' },
];

export const ORDER_STATUS_FLOW: OrderStatus[] = ['Confirmed', 'Preparing', 'Out for Delivery', 'Completed'];

export const LEAD_STATUS_FLOW: LeadStatus[] = ['New', 'Quoted', 'Booked', 'Closed'];
