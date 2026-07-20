'use client';

/**
 * User event tracking utility
 * Sends events to the backend for analytics and activity tracking
 */

export type EventType =
  | 'sound_lab:start'
  | 'sound_lab:end'
  | 'sound_lab:export'
  | 'live_studio:broadcast'
  | 'live_studio:end'
  | 'jingle_lab:generate'
  | 'voice_lab:clone'
  | 'content_factory:request'
  | 'client_showcase:upload'
  | 'dashboard:view'
  | 'page:visit'
  | 'feature:click';

export interface TrackingEvent {
  event_type: EventType;
  event_data?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  timestamp?: Date;
}

const SESSION_ID = typeof window !== 'undefined' ? sessionStorage.getItem('session_id') || generateSessionId() : '';

function generateSessionId(): string {
  const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('session_id', id);
  }
  return id;
}

/**
 * Track a user event
 * @param event_type The type of event being tracked
 * @param event_data Optional metadata about the event
 */
export async function trackEvent(
  event_type: EventType,
  event_data?: Record<string, any>
): Promise<void> {
  try {
    const response = await fetch('/api/v1/events/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type,
        event_data: event_data || {},
        session_id: SESSION_ID,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.warn(`Failed to track event: ${event_type}`, response.statusText);
    }
  } catch (error) {
    console.error(`Error tracking event: ${event_type}`, error);
  }
}

/**
 * Track page visit
 */
export function trackPageVisit(pageName: string, pathname: string): void {
  trackEvent('page:visit', {
    pageName,
    pathname,
  });
}

/**
 * Track feature click
 */
export function trackFeatureClick(featureName: string, featureId?: string): void {
  trackEvent('feature:click', {
    featureName,
    featureId,
  });
}

/**
 * Get current session ID
 */
export function getSessionId(): string {
  return SESSION_ID;
}
