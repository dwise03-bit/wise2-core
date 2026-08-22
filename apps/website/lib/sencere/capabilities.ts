import {
  Shirt,
  Scissors,
  Coffee,
  Zap,
  Layers,
  Settings2,
  Box,
  Cog,
  Monitor,
  type LucideIcon,
} from 'lucide-react';

export interface Capability {
  slug: string;
  title: string;
  icon: LucideIcon;
  items: string[];
}

export const capabilities: Capability[] = [
  {
    slug: 'apparel-decoration',
    title: 'Apparel & Decoration',
    icon: Shirt,
    items: ['DTF', 'Screen Print', 'Embroidery', 'More'],
  },
  {
    slug: 'vinyl-print',
    title: 'Vinyl & Print',
    icon: Layers,
    items: ['Vinyl Cutting', 'Decals', 'Banners', 'Signs', 'Stickers'],
  },
  {
    slug: 'sublimation',
    title: 'Sublimation',
    icon: Coffee,
    items: ['Apparel', 'Mugs', 'Tumblers', 'Drinkware', 'Full-Color Prints'],
  },
  {
    slug: 'laser-engraving',
    title: 'Laser Engraving',
    icon: Zap,
    items: ['Wood', 'Acrylic', 'Leather', 'Metal', 'Glass', 'Custom Gifts'],
  },
  {
    slug: 'heat-press',
    title: 'Heat Press',
    icon: Settings2,
    items: ['T-Shirts', 'Hoodies', 'Bags', 'Promo Items', 'More'],
  },
  {
    slug: 'sewing-finishing',
    title: 'Sewing & Finishing',
    icon: Scissors,
    items: ['Custom Apparel', 'Alterations', 'Quality Finishing'],
  },
  {
    slug: '3d-printing',
    title: '3D Printing',
    icon: Box,
    items: ['Prototypes', 'Parts', 'Miniatures', 'High Detail'],
  },
  {
    slug: 'cnc-fabrication',
    title: 'CNC & Fabrication',
    icon: Cog,
    items: ['CNC Carving', 'Sign Making', 'Prototyping', 'Precision Parts'],
  },
  {
    slug: 'mac-studio-design',
    title: 'Mac Studio (Design)',
    icon: Monitor,
    items: ['Graphic Design', '3D Modeling', 'Mockups', 'Brand Development'],
  },
];
