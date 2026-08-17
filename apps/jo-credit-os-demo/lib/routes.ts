/**
 * Centralized Routes Configuration
 * Single source of truth for all application routes
 */

export type RouteCategory = 'main' | 'studio' | 'shop' | 'auth' | 'admin' | 'content';

export interface Route {
  path: string;
  label: string;
  category: RouteCategory;
  requiresAuth?: boolean;
  external?: boolean;
  icon?: string;
  description?: string;
}

export const ROUTES: Record<string, Route> = {
  // Main Pages
  HOME: {
    path: '/',
    label: 'Home',
    category: 'main',
    description: 'Home dashboard / studio interface',
  },
  LANDING: {
    path: '/landing',
    label: 'Landing',
    category: 'main',
    description: 'Marketing landing page',
  },
  ABOUT: {
    path: '/about',
    label: 'About',
    category: 'main',
  },
  CONTACT: {
    path: '/contact',
    label: 'Contact',
    category: 'main',
  },
  PRICING: {
    path: '/pricing',
    label: 'Pricing',
    category: 'main',
  },
  SERVICES: {
    path: '/services',
    label: 'Services',
    category: 'main',
  },

  // Gallery & Content
  GALLERY: {
    path: '/gallery',
    label: 'Gallery',
    category: 'content',
  },
  HEROES: {
    path: '/heroes',
    label: 'Heroes',
    category: 'content',
  },
  WORLDS: {
    path: '/worlds',
    label: 'Worlds',
    category: 'content',
  },
  WORK: {
    path: '/work',
    label: 'Work',
    category: 'content',
  },

  // Studio Apps
  STUDIO: {
    path: '/studio',
    label: 'Studio',
    category: 'studio',
    description: 'Creative Studio - Command Center',
  },
  SOUNDLAB: {
    path: '/soundlab',
    label: 'Sound Lab',
    category: 'studio',
  },
  JINGLE_LAB: {
    path: '/jingle-lab',
    label: 'Jingle Lab',
    category: 'studio',
  },
  LIVE_STUDIO: {
    path: '/live-studio',
    label: 'Live Studio',
    category: 'studio',
  },
  LIVE: {
    path: '/live',
    label: 'Live',
    category: 'studio',
  },

  // Shopping
  SHOP: {
    path: '/shop',
    label: 'Shop',
    category: 'shop',
  },
  WEBSTORE: {
    path: '/webstore',
    label: 'Webstore',
    category: 'shop',
  },
  CHECKOUT: {
    path: '/checkout',
    label: 'Checkout',
    category: 'shop',
    requiresAuth: true,
  },

  // Apps & Tools
  APPS: {
    path: '/apps',
    label: 'Apps',
    category: 'main',
  },
  MAINTENANCE: {
    path: '/maintenance',
    label: 'Maintenance',
    category: 'admin',
  },
  PRINT_ON_DEMAND: {
    path: '/print-on-demand',
    label: 'Print on Demand',
    category: 'shop',
  },
  COMMUNITY: {
    path: '/community',
    label: 'Community',
    category: 'content',
  },

  // Auth
  LOGIN: {
    path: '/auth/login',
    label: 'Login',
    category: 'auth',
  },
  SIGNUP: {
    path: '/auth/signup',
    label: 'Sign Up',
    category: 'auth',
  },
  VERIFY: {
    path: '/verify',
    label: 'Verify Email',
    category: 'auth',
  },

  // Forms & Intake
  INTAKE: {
    path: '/intake',
    label: 'Intake Form',
    category: 'content',
  },
  START_YOUR_BUILD: {
    path: '/start-your-build',
    label: 'Start Your Build',
    category: 'content',
  },
  PROCESS: {
    path: '/process',
    label: 'Our Process',
    category: 'content',
  },
};

/**
 * Get route by key
 */
export function getRoute(key: keyof typeof ROUTES): Route {
  return ROUTES[key];
}

/**
 * Get all routes by category
 */
export function getRoutesByCategory(category: RouteCategory): Route[] {
  return Object.values(ROUTES).filter(route => route.category === category);
}

/**
 * Get all navigation routes (non-auth, non-admin)
 */
export function getNavigationRoutes(): Route[] {
  return Object.values(ROUTES).filter(
    route => !route.requiresAuth && !route.external && route.category !== 'auth'
  );
}

/**
 * Utility to check if user should be redirected (auth required but not logged in)
 */
export function requiresAuth(routePath: string): boolean {
  const route = Object.values(ROUTES).find(r => r.path === routePath);
  return route?.requiresAuth ?? false;
}
