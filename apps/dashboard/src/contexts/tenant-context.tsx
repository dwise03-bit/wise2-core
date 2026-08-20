'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './auth-context';

export interface TenantSettings {
  id: string;
  name: string;
  industry?: string;
  timezone?: string;
  currency?: string;
  defaultTemplate?: string;
  emailFrom?: string;
  features?: {
    crm: boolean;
    estimates: boolean;
    dispatch: boolean;
    approvals: boolean;
    workflows: boolean;
    reports: boolean;
    businessIntelligence: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TenantContextType {
  tenant: TenantSettings | null;
  isLoading: boolean;
  error: string | null;
  updateTenant: (data: Partial<TenantSettings>) => Promise<void>;
  clearError: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [tenant, setTenant] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tenant settings from localStorage on mount
  useEffect(() => {
    const storedTenant = localStorage.getItem('tenantSettings');
    if (storedTenant) {
      try {
        setTenant(JSON.parse(storedTenant));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Update tenant when user changes
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setTenant(null);
      return;
    }

    // For now, we can create a basic tenant object from user data
    const basicTenant: TenantSettings = {
      id: user.tenantId,
      name: 'My Company',
      timezone: 'UTC',
      currency: 'USD',
      features: {
        crm: true,
        estimates: true,
        dispatch: true,
        approvals: true,
        workflows: true,
        reports: true,
        businessIntelligence: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTenant(basicTenant);
  }, [isAuthenticated, user]);

  const updateTenant = useCallback(async (data: Partial<TenantSettings>) => {
    if (!tenant) return;

    try {
      setError(null);
      setIsLoading(true);

      const updatedTenant = {
        ...tenant,
        ...data,
        updatedAt: new Date().toISOString(),
      };

      setTenant(updatedTenant);
      localStorage.setItem('tenantSettings', JSON.stringify(updatedTenant));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update tenant settings';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tenant]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: TenantContextType = {
    tenant,
    isLoading,
    error,
    updateTenant,
    clearError,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextType {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

export function useTenantId(): string | null {
  const { tenant } = useTenant();
  return tenant?.id || null;
}
