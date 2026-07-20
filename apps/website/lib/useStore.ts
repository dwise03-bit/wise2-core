/**
 * useStore Hook
 * React hook for accessing and updating global state
 */

import { useEffect, useState, useCallback } from 'react';
import { store, AppState, CartItem, UserPreferences } from './store';

export function useStore() {
  const [state, setState] = useState<AppState>(store.getState());

  useEffect(() => {
    // Initialize store from localStorage on first mount
    store.initialize();
    setState(store.getState());

    // Subscribe to state changes
    const unsubscribe = store.subscribe((newState) => {
      setState(newState);
    });

    return unsubscribe;
  }, []);

  // Cart methods
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity?: number) => {
    store.addToCart(item, quantity);
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    store.removeFromCart(itemId);
  }, []);

  const updateCartQuantity = useCallback((itemId: string, quantity: number) => {
    store.updateCartItemQuantity(itemId, quantity);
  }, []);

  const clearCart = useCallback(() => {
    store.clearCart();
  }, []);

  // Auth methods
  const setAuth = useCallback((user: any, token: string) => {
    store.setAuth(user, token);
  }, []);

  const logout = useCallback(() => {
    store.clearAuth();
  }, []);

  const setUser = useCallback((user: any) => {
    store.setUser(user);
  }, []);

  // Preferences
  const setPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    store.setPreferences(preferences);
  }, []);

  // Error handling
  const setError = useCallback((error: string | null) => {
    store.setError(error);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    store.setLoading(loading);
  }, []);

  return {
    // State
    state,
    cart: state.cart,
    auth: state.auth,
    preferences: state.preferences,
    loading: state.loading,
    error: state.error,

    // Cart actions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,

    // Auth actions
    setAuth,
    logout,
    setUser,

    // Preferences
    setPreferences,

    // Error handling
    setError,
    setLoading,
  };
}
