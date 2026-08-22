import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export const PRODUCTS = [
  {
    id: 'grad_combo',
    name: 'Graduation Combo',
    price: 34.99,
    image: '/images/product-graduation.webp',
    desc: 'Celebrate achievements with custom graduation gifts',
  },
  {
    id: 'nurse_set',
    name: 'Nurse Appreciation Set',
    price: 28.99,
    image: '/images/product-nurse.webp',
    desc: 'Honor healthcare heroes with personalized appreciation gifts',
  },
  {
    id: 'memorial_box',
    name: 'Memorial Keepsake Box',
    price: 44.99,
    image: '/images/product-memorial.webp',
    desc: 'Preserve cherished memories with elegant memorial items',
  },
  {
    id: 'holiday_pack',
    name: 'Holiday Cheer Pack',
    price: 39.99,
    image: '/images/product-holiday.webp',
    desc: 'Spread joy with custom holiday-themed collections',
  },
] as const;
