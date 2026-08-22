// SenCere Creative LLC - Product Catalog
// Custom apparel, printing, fabrication, and creative services

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  options: {
    [key: string]: string[];
  };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: 'apparel' | 'printing' | 'fabrication' | 'service' | 'design';
  description: string;
  longDescription: string;
  basePrice: number;
  image: string;
  gallery: string[];
  variants: ProductVariant[];
  features: string[];
  turnaround?: string; // e.g. "3-5 business days"
  minOrder?: number;
  available: boolean;
  badge?: string; // "New", "Best Seller", etc
}

export const SENCERE_PRODUCTS: Product[] = [
  {
    id: 'custom-tees',
    name: 'Custom Screen-Printed Apparel',
    slug: 'custom-tees',
    category: 'apparel',
    description: 'Premium custom t-shirts, hoodies, and apparel with your design',
    longDescription: 'Hand-selected 100% ringspun cotton apparel, professionally screen-printed with vibrant, long-lasting color. Perfect for brand launches, team events, or personal collections. Custom designs available; minimum order 12 units.',
    basePrice: 18,
    image: '/sencere/apparel-hero.jpg',
    gallery: [
      '/sencere/apparel-1.jpg',
      '/sencere/apparel-2.jpg',
      '/sencere/apparel-3.jpg',
    ],
    features: [
      '100% Ringspun Cotton',
      'Professional screen printing',
      'Custom color matching',
      'Multiple garment options',
      '3-5 day turnaround',
    ],
    turnaround: '3-5 business days',
    minOrder: 12,
    variants: [
      {
        id: 'tee-unisex',
        name: 'Unisex Classic Tee',
        price: 18,
        options: {
          size: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
          color: ['Black', 'White', 'Navy', 'Heather Gray', 'Stone'],
        },
      },
      {
        id: 'tee-hoodie',
        name: 'Premium Hoodie',
        price: 45,
        options: {
          size: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
          color: ['Black', 'Navy', 'Charcoal', 'White'],
        },
      },
      {
        id: 'tee-longsleeve',
        name: 'Long Sleeve Tee',
        price: 22,
        options: {
          size: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
          color: ['Black', 'White', 'Navy', 'Heather Gray'],
        },
      },
    ],
    available: true,
    badge: 'Best Seller',
  },
  {
    id: 'custom-prints',
    name: 'Custom Print Services',
    slug: 'custom-prints',
    category: 'printing',
    description: 'Full-color digital printing for merchandise, signage, and more',
    longDescription: 'Professional full-color digital printing on apparel, canvas, paper, and custom substrates. From business cards to large-format signage. Each piece is individually printed with precision color accuracy.',
    basePrice: 5,
    image: '/sencere/printing-hero.jpg',
    gallery: [
      '/sencere/printing-1.jpg',
      '/sencere/printing-2.jpg',
      '/sencere/printing-3.jpg',
    ],
    features: [
      'Full-color digital printing',
      'Precision color accuracy',
      'Multiple substrate options',
      'Rush orders available',
      '1-2 day standard turnaround',
    ],
    turnaround: '1-2 business days',
    minOrder: 1,
    variants: [
      {
        id: 'print-apparel',
        name: 'Apparel Printing',
        price: 8,
        options: {
          type: ['T-shirt', 'Hoodie', 'Hat', 'Tote Bag'],
          quantity: ['1', '5', '10', '25'],
        },
      },
      {
        id: 'print-signage',
        name: 'Custom Signage',
        price: 25,
        options: {
          size: ['12x18"', '18x24"', '24x36"', '36x48"'],
          material: ['Vinyl Banner', 'Canvas', 'Metal', 'Wood'],
        },
      },
    ],
    available: true,
  },
  {
    id: 'custom-fabrication',
    name: 'Custom Fabrication & Prototyping',
    slug: 'custom-fabrication',
    category: 'fabrication',
    description: 'One-off custom pieces, prototypes, and bespoke creations',
    longDescription: 'From idea to reality. Whether you need a custom display, prototype, or one-of-a-kind piece, our fabrication team brings your vision to life. Specializing in wood, metal, acrylic, and mixed media.',
    basePrice: 150,
    image: '/sencere/fabrication-hero.jpg',
    gallery: [
      '/sencere/fabrication-1.jpg',
      '/sencere/fabrication-2.jpg',
      '/sencere/fabrication-3.jpg',
    ],
    features: [
      'Full design consultation',
      'Material options: wood, metal, acrylic, mixed media',
      'Professional CAD drawings',
      'Prototyping and iteration',
      'Quality craftsmanship',
    ],
    variants: [
      {
        id: 'fab-consultation',
        name: 'Design Consultation',
        price: 0,
        options: {
          scope: ['30-min Call', '1-hour Workshop', 'Full Project Planning'],
        },
      },
      {
        id: 'fab-custom',
        name: 'Custom Fabrication',
        price: 150,
        options: {
          material: ['Wood', 'Metal', 'Acrylic', 'Mixed Media'],
          scope: ['Small', 'Medium', 'Large', 'Complex'],
        },
      },
    ],
    available: true,
    badge: 'Custom',
  },
  {
    id: 'design-services',
    name: 'Design Services',
    slug: 'design-services',
    category: 'design',
    description: 'Professional graphic and product design for your brand',
    longDescription: 'Custom branding, logo design, product design, and creative direction. Our design team collaborates with you to create cohesive visual systems that elevate your brand.',
    basePrice: 500,
    image: '/sencere/design-hero.jpg',
    gallery: [
      '/sencere/design-1.jpg',
      '/sencere/design-2.jpg',
      '/sencere/design-3.jpg',
    ],
    features: [
      'Logo & branding design',
      'Unlimited revisions',
      'Professional deliverables',
      'Brand guidelines',
      '2-week turnaround standard',
    ],
    turnaround: '2 weeks standard',
    variants: [
      {
        id: 'design-logo',
        name: 'Logo Design',
        price: 500,
        options: {
          package: ['Startup', 'Professional', 'Premium'],
        },
      },
      {
        id: 'design-branding',
        name: 'Full Branding Package',
        price: 2000,
        options: {
          scope: ['Logo + Guidelines', 'Logo + Guidelines + Collateral'],
        },
      },
    ],
    available: true,
  },
  {
    id: 'merch-packages',
    name: 'Merchandise Packages',
    slug: 'merch-packages',
    category: 'apparel',
    description: 'Curated merchandise bundles for events, brands, and creators',
    longDescription: 'Pre-designed merchandise packages optimized for events, content creators, and brand launches. Mix and match items to build your perfect collection.',
    basePrice: 150,
    image: '/sencere/merch-hero.jpg',
    gallery: [
      '/sencere/merch-1.jpg',
      '/sencere/merch-2.jpg',
      '/sencere/merch-3.jpg',
    ],
    features: [
      'Starter, Creator, and Pro bundles',
      'Flexible customization',
      'Volume discounts',
      'White-label available',
    ],
    variants: [
      {
        id: 'merch-starter',
        name: 'Starter Bundle',
        price: 150,
        options: {
          items: ['3x Tees + 1x Hat', '5x Tees + 2x Hoodies'],
        },
      },
      {
        id: 'merch-creator',
        name: 'Creator Bundle',
        price: 450,
        options: {
          items: ['10x Tees + 5x Hoodies + 5x Hats', 'Full Customization'],
        },
      },
    ],
    available: true,
    badge: 'Creator Favorite',
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return SENCERE_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(
  category: Product['category']
): Product[] {
  return SENCERE_PRODUCTS.filter((p) => p.category === category);
}

export function getAllProductCategories(): Product['category'][] {
  return Array.from(new Set(SENCERE_PRODUCTS.map((p) => p.category)));
}
