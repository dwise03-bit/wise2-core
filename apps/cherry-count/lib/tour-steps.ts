export interface CherryTourStep {
  id: string;
  route: string;
  title: string;
  body: string;
  tip: string;
  anchor?: string;
}

export const CHERRY_TOUR_STEPS: CherryTourStep[] = [
  {
    id: 'welcome',
    route: '/dashboard',
    title: 'Welcome to Cherry Count',
    body: 'This is your pop-up command center — sales, inventory, packing, and customers in one mobile-first app.',
    tip: "Built for Brianna's Boutique, powered by WISE² behind the scenes.",
    anchor: 'dashboard-header',
  },
  {
    id: 'stats',
    route: '/dashboard',
    title: 'Today at a Glance',
    body: 'Today\'s sales, inventory count, best sellers, and low-stock alerts update as you sell and restock.',
    tip: 'Low stock warnings help you restock before the next pop-up.',
    anchor: 'dashboard-stats',
  },
  {
    id: 'next-popup',
    route: '/dashboard',
    title: 'Next Pop-Up',
    body: 'Your upcoming event, venue, and packing progress stay pinned so nothing gets forgotten.',
    tip: 'Tap through to Pop-Ups when you\'re ready to pack or go live.',
    anchor: 'dashboard-next-event',
  },
  {
    id: 'inventory',
    route: '/inventory',
    title: 'Inventory',
    body: 'Every product, variant, size, color, and bin location — with profit margins and stock levels.',
    tip: 'Open any item to see variants and low-stock warnings.',
    anchor: 'inventory-list',
  },
  {
    id: 'popups',
    route: '/pop-ups',
    title: 'Pop-Up Mode',
    body: 'Plan events, track packing progress, and switch into live selling mode on the floor.',
    tip: 'Pack Smart tells you exactly what went into each container.',
    anchor: 'popups-event',
  },
  {
    id: 'customers',
    route: '/customers',
    title: 'Customers & CRM',
    body: 'VIP status, purchase history, sizes, and demand signals like "Need Medium" for Brianna.',
    tip: 'Cherry Count learns what your customers actually want.',
    anchor: 'customers-list',
  },
  {
    id: 'ai',
    route: '/ai',
    title: 'Cherry AI',
    body: 'Daily briefings, restock suggestions, packing lists, and trend summaries — your 24/7 business partner.',
    tip: 'AI suggests. You decide. Nothing destructive runs without your OK.',
    anchor: 'ai-briefing',
  },
  {
    id: 'phone',
    route: '/phone',
    title: 'AI Phone Service',
    body: 'Cherry answers your boutique line 24/7 — sizing, pop-up info, holds, SMS follow-ups, and transfers to you when it matters.',
    tip: 'Your AI number is (404) 867-2446. Every call syncs to CRM automatically.',
    anchor: 'phone-hero',
  },
  {
    id: 'finish',
    route: '/dashboard',
    title: 'You\'re Ready',
    body: 'Track it. Pack it. Profit. Use the center + button for quick actions anywhere in the app.',
    tip: 'Open Client Presentation from More when you\'re ready to show the full story.',
    anchor: 'dashboard-insight',
  },
];

export const TOUR_STORAGE_KEY = 'cherry-count-tour-completed';
