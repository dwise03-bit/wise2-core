/** Demo data for CC Craft & Create client presentations and iOS companion preview. */

import type { Product } from './types';

export const DEMO_STATS = {
  ordersThisMonth: 47,
  happyCustomers: 128,
  productsOffered: 12,
  avgTurnaroundDays: 4,
};

export const DEMO_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Personalized Drink Labels',
    category: 'Labels',
    occasion: 'Birthday',
    description: 'Custom drink labels for any celebration. Waterproof vinyl, vibrant full-color printing.',
    price: 24.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 2,
    name: 'Chip Bags & Candy Wrappers',
    category: 'Wrappers',
    occasion: 'Birthday',
    description: 'Eye-catching wrappers to elevate your party snacks and treats.',
    price: 19.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 3,
    name: 'Water Bottle Labels',
    category: 'Labels',
    occasion: 'Events',
    description: 'Personalized hydration labels for guests, schools, and corporate events.',
    price: 16.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 4,
    name: 'Custom Party Package',
    category: 'Packages',
    occasion: 'Birthday',
    description: 'Complete party package with labels, wrappers, and coordinating decor.',
    price: 89.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 5,
    name: 'Memorial Bookmarks',
    category: 'Keepsakes',
    occasion: 'Memorials',
    description: 'Lasting tributes with names, dates, and meaningful verses.',
    price: 12.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 6,
    name: 'Graduation Certificates',
    category: 'Certificates',
    occasion: 'Graduations',
    description: 'Personalized achievement certificates for schools and celebrations.',
    price: 34.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 7,
    name: 'Holiday Gift Tags',
    category: 'Tags',
    occasion: 'Holidays',
    description: 'Custom holiday tags that make every gift feel personal.',
    price: 14.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 8,
    name: 'Shower Invitation Set',
    category: 'Invitations',
    occasion: 'Baby Shower',
    description: 'Complete invitation suite with matching RSVP and thank-you cards.',
    price: 44.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 9,
    name: 'Nurse Appreciation Gift Set',
    category: 'Packages',
    occasion: 'Nurse Appreciation',
    description: 'Thoughtful appreciation gifts for healthcare heroes.',
    price: 28.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 10,
    name: 'Business Branding Starter Kit',
    category: 'Business',
    occasion: 'Business',
    description: 'Labels, tags, and packaging to launch your brand look.',
    price: 79.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 11,
    name: 'Church Event Welcome Pack',
    category: 'Community',
    occasion: 'Church',
    description: 'Programs, name tags, and keepsakes for worship and community events.',
    price: 54.99,
    image_url: null,
    in_stock: true,
  },
  {
    id: 12,
    name: 'Teacher Appreciation Bundle',
    category: 'School',
    occasion: 'Teacher Appreciation',
    description: 'Personalized gifts and tags for staff appreciation week.',
    price: 39.99,
    image_url: null,
    in_stock: true,
  },
];

export const DEMO_OCCASIONS = [
  {
    slug: 'birthdays',
    title: 'Birthdays',
    emoji: '🎂',
    description: 'Party packs, drink labels, and custom treats for every age.',
  },
  {
    slug: 'baby-showers',
    title: 'Baby Showers',
    emoji: '👶',
    description: 'Invitation suites, favors, and keepsakes for the little one on the way.',
  },
  {
    slug: 'graduations',
    title: 'Graduations',
    emoji: '🎓',
    description: 'Certificates, labels, and celebration packages for every milestone.',
  },
  {
    slug: 'memorials',
    title: 'Memorials',
    emoji: '🕊️',
    description: 'Bookmarks, programs, and keepsakes designed with care and respect.',
  },
  {
    slug: 'holidays',
    title: 'Holidays',
    emoji: '🎄',
    description: 'Gift tags, packaging, and seasonal decor for every celebration.',
  },
  {
    slug: 'church',
    title: 'Church & Community',
    emoji: '⛪',
    description: 'Event programs, welcome packs, and community outreach materials.',
  },
  {
    slug: 'nurse-appreciation',
    title: 'Nurse Appreciation',
    emoji: '💜',
    description: 'Thoughtful gifts and labels for healthcare heroes.',
  },
  {
    slug: 'teacher-appreciation',
    title: 'Teacher Appreciation',
    emoji: '🍎',
    description: 'Personalized appreciation gifts for teachers and staff.',
  },
];

export const DEMO_BUSINESS_SERVICES = [
  {
    title: 'Brand Packaging',
    description: 'Custom labels, tags, and product packaging that represent your business.',
  },
  {
    title: 'Event Marketing',
    description: 'Banners, flyers, and promotional items for launches and pop-ups.',
  },
  {
    title: 'Corporate Gifting',
    description: 'Personalized gift boxes and appreciation sets for clients and staff.',
  },
  {
    title: 'Bulk Orders',
    description: 'Volume pricing and fast turnaround for schools, nonprofits, and teams.',
  },
];

export const DEMO_CATEGORIES = [...new Set(DEMO_PRODUCTS.map((p) => p.category))].sort();
export const DEMO_OCCASION_FILTERS = [...new Set(DEMO_PRODUCTS.map((p) => p.occasion))].sort();

export const DEMO_GALLERY = [
  { title: 'Birthday Party Pack', category: 'Party', emoji: '🎉' },
  { title: 'Graduation Celebration', category: 'Graduation', emoji: '🎓' },
  { title: 'Nurse Appreciation', category: 'Healthcare', emoji: '💜' },
  { title: 'Memorial Keepsake', category: 'Memorial', emoji: '🕊️' },
  { title: 'Holiday Gift Tags', category: 'Holiday', emoji: '🎁' },
  { title: 'Business Branding', category: 'Business', emoji: '✨' },
];

export const DEMO_TESTIMONIALS = [
  {
    name: 'Maria T.',
    occasion: 'Birthday Party',
    quote: 'CC made my daughter\'s party unforgettable. Every label was perfect!',
  },
  {
    name: 'Pastor James R.',
    occasion: 'Church Event',
    quote: 'Professional, on time, and made with so much care. Our congregation loved it.',
  },
  {
    name: 'Angela M.',
    occasion: 'Nurse Appreciation',
    quote: 'The appreciation gifts were a hit on our unit. Will order again!',
  },
];

export const DEMO_ORDER_PROCESS = [
  { step: 1, title: 'You dream it', detail: 'Tell us your idea and event details.' },
  { step: 2, title: 'We design it', detail: 'We create a proof for your review.' },
  { step: 3, title: 'You approve it', detail: 'Review, tweak, and give the green light.' },
  { step: 4, title: 'We create it', detail: 'Your vision comes to life with care.' },
  { step: 5, title: 'You enjoy it', detail: 'Made with love, just for you.' },
];

export function filterDemoProducts(options: {
  category?: string | null;
  occasion?: string | null;
  search?: string | null;
}): Product[] {
  let results = [...DEMO_PRODUCTS];

  if (options.category) {
    const category = options.category.toLowerCase();
    results = results.filter((p) => p.category.toLowerCase() === category);
  }

  if (options.occasion) {
    const occasion = options.occasion.toLowerCase();
    results = results.filter((p) => {
      const productOccasion = p.occasion.toLowerCase();
      return (
        productOccasion === occasion ||
        productOccasion.includes(occasion) ||
        occasion.includes(productOccasion)
      );
    });
  }

  if (options.search) {
    const term = options.search.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }

  return results.sort((a, b) => a.name.localeCompare(b.name));
}

export function createDemoOrder(items: Array<{ product_id: number; name: string; price: number; quantity: number }>) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 5;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return {
    id: Date.now(),
    order_number: `CC-DEMO-${Date.now()}`,
    status: 'confirmed' as const,
    subtotal,
    shipping,
    tax,
    total,
    created_at: new Date().toISOString(),
    demo: true,
  };
}
