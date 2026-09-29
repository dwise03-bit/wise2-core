/**
 * WISE² Type Definitions
 * Shared TypeScript interfaces and types for the platform
 */

// Project and track types
export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Track {
  id: string
  projectId: string
  name: string
  duration: number
  format: string
  createdAt: Date
}

// User types
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  emailVerified: boolean
  createdAt: Date
}

// Subscription types
export interface Subscription {
  id: string
  userId: string
  plan: 'creator' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'paused'
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export const version = '0.1.0'
