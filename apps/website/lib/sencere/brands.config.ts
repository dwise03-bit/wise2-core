// SenCere Brands Configuration
// Single source of truth for all brand data, products, and styling

export interface Brand {
  id: string;
  name: string;
  tagline: string;
  description: string;
  accentColor: string;
  headerBg: string;
  products: BrandProduct[];
  navText?: string;
}

export interface BrandProduct {
  id: number;
  name: string;
  price: string;
  category: string;
}

export const BRANDS: Record<string, Brand> = {
  blakkhail: {
    id: 'blakkhail',
    name: 'BLAKKHAIL',
    tagline: 'LEGACY / ORIGIN',
    description: 'The foundation. The history. The real.',
    accentColor: '#D4842F',
    headerBg: '#E8D4B8',
    products: [
      { id: 1, name: 'Chain Gang - Black', price: '$24.99', category: 'Apparel' },
      { id: 2, name: '2Cans - Red/White/Gold', price: '$24.99', category: 'Apparel' },
      { id: 3, name: '2Cans - Blue/White/Black', price: '$24.99', category: 'Apparel' },
      { id: 4, name: 'Alien Alliance - Gray', price: '$26.99', category: 'Apparel' },
      { id: 5, name: 'Alien Alliance - Black', price: '$26.99', category: 'Apparel' },
      { id: 6, name: 'Alien Alliance - White', price: '$26.99', category: 'Apparel' },
    ],
  },
  'piff-city': {
    id: 'piff-city',
    name: 'PIFF CITY',
    tagline: 'THE FLAGSHIP BRAND',
    description: 'The lifestyle. The culture. The future.',
    accentColor: '#E8A23A',
    headerBg: '#FFF8E7',
    products: [
      { id: 1, name: 'Flagship Tee - Gold', price: '$32.99', category: 'Apparel' },
      { id: 2, name: 'Culture Movement Hoodie', price: '$72.99', category: 'Apparel' },
      { id: 3, name: 'Future Capsule Jacket', price: '$95.99', category: 'Outerwear' },
      { id: 4, name: 'City Lifestyle Cap', price: '$28.99', category: 'Accessories' },
      { id: 5, name: 'Movement Joggers', price: '$65.99', category: 'Apparel' },
      { id: 6, name: 'Signature Crew Tee', price: '$34.99', category: 'Apparel' },
    ],
  },
  vandals: {
    id: 'vandals',
    name: 'VANDALS',
    tagline: 'UNDERGROUND REBELLION',
    description: 'The rebels. The art. The vandals.',
    accentColor: '#5B2D7F',
    headerBg: '#2a1a3a',
    products: [
      { id: 1, name: 'Rebellion Tee - Purple', price: '$29.99', category: 'Apparel' },
      { id: 2, name: 'Underground Statement Hoodie', price: '$68.99', category: 'Apparel' },
      { id: 3, name: 'Anarchist Oversized Jacket', price: '$92.99', category: 'Outerwear' },
      { id: 4, name: 'Urban Vandal Cap', price: '$26.99', category: 'Accessories' },
      { id: 5, name: 'Rebel Cargo Pants', price: '$62.99', category: 'Apparel' },
      { id: 6, name: 'Art Rebellion Tee', price: '$31.99', category: 'Apparel' },
    ],
  },
};

export const BRAND_ORDER = ['blakkhail', 'piff-city', 'vandals'] as const;

export function getBrand(id: string): Brand | undefined {
  return BRANDS[id];
}

export function getAllBrands(): Brand[] {
  return BRAND_ORDER.map(id => BRANDS[id]);
}
