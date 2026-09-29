import { Shirt, HardHat, GraduationCap, Star, Store, type LucideIcon } from 'lucide-react';

export interface Industry {
  label: string;
  icon: LucideIcon;
}

export const industries: Industry[] = [
  { label: 'Apparel & Brands', icon: Shirt },
  { label: 'Contractors', icon: HardHat },
  { label: 'Schools & Teams', icon: GraduationCap },
  { label: 'Events & Promotions', icon: Star },
  { label: 'Small Businesses', icon: Store },
];
