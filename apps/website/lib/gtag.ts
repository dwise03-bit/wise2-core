export const GA_MEASUREMENT_ID = 'G-XXXXX'; // Replace with actual GA4 ID

declare const gtag: (...args: unknown[]) => void;

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('config', GA_MEASUREMENT_ID, { page_path: url });
  }
};

export const event = (action: string, category: string, label: string, value?: number) => {
  if (typeof window !== 'undefined' && typeof gtag !== 'undefined') {
    gtag('event', action, { event_category: category, event_label: label, value });
  }
};
