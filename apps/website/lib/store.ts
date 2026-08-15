/**
 * Global State Management Store
 * Centralized storage for cart, auth, user preferences
 */

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  total: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
}

export interface UserPreferences {
  theme?: 'light' | 'dark';
  notifications?: boolean;
  emailUpdates?: boolean;
}

export interface AppState {
  cart: CartState;
  auth: AuthState;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

const INITIAL_STATE: AppState = {
  cart: {
    items: [],
    total: 0,
  },
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  preferences: {
    theme: 'dark',
    notifications: true,
    emailUpdates: true,
  },
  loading: false,
  error: null,
};

class Store {
  private state: AppState = INITIAL_STATE;
  private listeners: Set<(state: AppState) => void> = new Set();

  // Initialize from localStorage
  initialize() {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('app-state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }

    // Check for auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.state.auth.token = token;
      this.state.auth.isAuthenticated = true;
    }
  }

  // Save state to localStorage
  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem('app-state', JSON.stringify(this.state));
  }

  // Subscribe to state changes
  subscribe(listener: (state: AppState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners
  private notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current state
  getState(): AppState {
    return this.state;
  }

  // Cart Operations
  addToCart(item: Omit<CartItem, 'quantity'>, quantity: number = 1) {
    const existing = this.state.cart.items.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.state.cart.items.push({ ...item, quantity });
    }
    this.updateCartTotal();
    this.persist();
    this.notify();
  }

  removeFromCart(itemId: string) {
    this.state.cart.items = this.state.cart.items.filter(i => i.id !== itemId);
    this.updateCartTotal();
    this.persist();
    this.notify();
  }

  updateCartItemQuantity(itemId: string, quantity: number) {
    const item = this.state.cart.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = Math.max(0, quantity);
      if (item.quantity === 0) {
        this.removeFromCart(itemId);
      } else {
        this.updateCartTotal();
        this.persist();
        this.notify();
      }
    }
  }

  clearCart() {
    this.state.cart = { items: [], total: 0 };
    this.persist();
    this.notify();
  }

  private updateCartTotal() {
    this.state.cart.total = this.state.cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  // Auth Operations
  setAuth(user: any, token: string) {
    this.state.auth = {
      isAuthenticated: true,
      user,
      token,
    };
    localStorage.setItem('auth_token', token);
    this.persist();
    this.notify();
  }

  clearAuth() {
    this.state.auth = {
      isAuthenticated: false,
      user: null,
      token: null,
    };
    localStorage.removeItem('auth_token');
    this.persist();
    this.notify();
  }

  setUser(user: any) {
    this.state.auth.user = user;
    this.persist();
    this.notify();
  }

  // Preferences
  setPreferences(preferences: Partial<UserPreferences>) {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    this.persist();
    this.notify();
  }

  // Error handling
  setError(error: string | null) {
    this.state.error = error;
    this.notify();
  }

  setLoading(loading: boolean) {
    this.state.loading = loading;
    this.notify();
  }
}

// Export singleton
export const store = new Store();
