export type EventType =
  | 'page_view'
  | 'form_start'
  | 'form_field_blur'
  | 'form_submit'
  | 'form_error'
  | 'form_success'
  | 'email_verification_sent'
  | 'email_verified'
  | 'signup_complete'
  | 'login_complete'
  | 'button_click';

export interface AnalyticsEvent {
  type: EventType;
  timestamp: number;
  path: string;
  data?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== 'undefined') {
      this.trackPageView();
    }
  }

  private generateSessionId(): string {
    if (typeof window === 'undefined') {
      return 'server-session';
    }
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackPageView() {
    this.track('page_view', { pathname: typeof window !== 'undefined' ? window.location.pathname : '' });
  }

  track(type: EventType, data?: Record<string, any>) {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      data: { ...data, sessionId: this.sessionId },
    };

    this.events.push(event);

    // Log to console in development
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', type, data);
    }

    // Send to backend in batches
    if (this.events.length >= 5) {
      this.flush();
    }
  }

  async flush() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: eventsToSend }),
        });
      }
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

export const analytics = new Analytics();
