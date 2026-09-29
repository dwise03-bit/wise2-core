import type { LucideIcon } from 'lucide-react';
import {
  Bot,
  Building2,
  CalendarClock,
  ClipboardList,
  CreditCard,
  FileText,
  FolderLock,
  Gauge,
  Users,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  PhoneCall,
  Receipt,
  Repeat,
  Settings,
  Star,
  Tags,
  Truck,
  UserPlus,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  group: string;
  badge?: string;
}

export const NAV: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, group: 'Command' },
  { href: '/calls', label: 'Calls', icon: PhoneCall, group: 'Command', badge: '3' },
  { href: '/leads', label: 'Leads', icon: UserPlus, group: 'Revenue' },
  { href: '/customers', label: 'Customers', icon: Users, group: 'Revenue' },
  { href: '/properties', label: 'Properties', icon: Building2, group: 'Revenue' },
  { href: '/estimates', label: 'Estimates', icon: ClipboardList, group: 'Revenue' },
  { href: '/dispatch', label: 'Schedule / Dispatch', icon: CalendarClock, group: 'Operations' },
  { href: '/jobs', label: 'Jobs', icon: Truck, group: 'Operations' },
  { href: '/invoices', label: 'Invoices', icon: Receipt, group: 'Money' },
  { href: '/payments', label: 'Payments', icon: CreditCard, group: 'Money' },
  { href: '/follow-ups', label: 'Follow Ups', icon: Repeat, group: 'Growth', badge: '12' },
  { href: '/contracts', label: 'Recurring Contracts', icon: FileText, group: 'Growth' },
  { href: '/lighting', label: 'Lighting Division', icon: Lightbulb, group: 'Growth' },
  { href: '/reviews', label: 'Reviews', icon: Star, group: 'Growth' },
  { href: '/marketing', label: 'Marketing', icon: Megaphone, group: 'Growth' },
  { href: '/pricebook', label: 'Pricebook', icon: Tags, group: 'Back Office' },
  { href: '/documents', label: 'Documents', icon: FolderLock, group: 'Back Office', badge: '2' },
  { href: '/reports', label: 'Reports', icon: Gauge, group: 'Back Office' },
  { href: '/ai', label: 'AI Command Center', icon: Bot, group: 'Command' },
  { href: '/growth', label: 'Owner Growth View', icon: Gauge, group: 'Command' },
  { href: '/settings', label: 'Settings', icon: Settings, group: 'Back Office' },
];

export const NAV_GROUPS = ['Command', 'Revenue', 'Operations', 'Money', 'Growth', 'Back Office'];
