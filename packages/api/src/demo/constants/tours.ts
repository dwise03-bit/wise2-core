/**
 * WISE² LIVE Default Guided Tours
 *
 * Tour definitions guide visitors through the demo experience.
 */

export interface TourStep {
  id: string;
  title: string;
  description: string;
  route: string;
  targetElement?: string;
  action?: 'navigate' | 'highlight' | 'interact';
  duration?: number; // seconds
  narration?: string;
  audioUrl?: string;
  waitForEvent?: string;
  cta?: string;
}

export interface DemoTourDefinition {
  key: string;
  name: string;
  description: string;
  duration: number; // seconds
  targetAudience: 'owner' | 'customer' | 'both';
  steps: TourStep[];
}

/**
 * Default tour: "From Lead to Money"
 *
 * Shows the complete customer journey from discovery to revenue.
 * Perfect for owner-mode walkthrough.
 *
 * Duration: ~5-7 minutes
 */
export const LEAD_TO_MONEY_TOUR: DemoTourDefinition = {
  key: 'LEAD_TO_MONEY',
  name: 'From Lead to Money',
  description:
    'See how a prospect discovers your business and becomes a paying customer',
  duration: 420, // 7 minutes
  targetAudience: 'owner',
  steps: [
    {
      id: '1-welcome',
      title: 'Welcome to Your Business on WISE²',
      description:
        'This tour shows how WISE² automates your entire customer journey',
      route: '/demo/:slug',
      duration: 45,
      narration:
        'Welcome. In the next 7 minutes, you\'ll see how your business would operate on WISE². We\'ll follow a real customer from discovery all the way to a completed job and payment.',
      cta: 'Start Tour',
    },
    {
      id: '2-discovery',
      title: 'Customer Discovers You',
      description: 'A customer finds your website through Google search',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="hero-cta"]',
      duration: 60,
      narration:
        'Marcus Johnson searches for HVAC repair on Google and finds your website. He sees your reviews, your offers, and your service area. Everything looks professional.',
      action: 'navigate',
      cta: 'Watch Customer Visit Site',
    },
    {
      id: '3-contact',
      title: 'Customer Makes Contact',
      description: 'He submits a service request through your form',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="contact-form"]',
      duration: 45,
      narration:
        'Marcus fills out your contact form. He describes his AC problem, provides his information, and hits submit.',
      action: 'interact',
      cta: 'Submit Request',
    },
    {
      id: '4-capture',
      title: 'Lead Captured in WISE²',
      description: 'The lead appears in your CRM instantly',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="new-lead-card"]',
      duration: 30,
      narration:
        'The moment Marcus hits submit, his information flows into your CRM. WISE² automatically scores the lead, extracts the service type, and calculates estimated value.',
      action: 'highlight',
      cta: 'View in CRM',
    },
    {
      id: '5-ai-response',
      title: 'WISE² AI Responds Instantly',
      description: 'Your AI responds to the lead within seconds',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="ai-response"]',
      duration: 40,
      narration:
        'Before you even see the lead, WISE² AI has already responded to Marcus. It thanked him, asked clarifying questions, and offered an appointment time. Marcus got service instantly — no waiting.',
      cta: 'Read Response',
    },
    {
      id: '6-follow-up',
      title: 'Automated Follow-Up',
      description: 'WISE² sends SMS and email follow-ups',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="follow-up-sequence"]',
      duration: 50,
      narration:
        'WISE² automatically sends follow-up SMS and email. If Marcus doesn\'t respond, it reminds him again in 24 hours. If he does respond, it marks him as engaged and prioritizes him.',
      action: 'highlight',
    },
    {
      id: '7-estimate',
      title: 'Estimate Generated',
      description: 'You create an estimate and send it instantly',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="estimate-btn"]',
      duration: 35,
      narration:
        'When Marcus confirms the appointment, WISE² generates a professional estimate based on your service history. You review it, add notes if you want, then send it. Marcus gets it in seconds.',
      cta: 'Generate Estimate',
    },
    {
      id: '8-booking',
      title: 'Appointment Booked',
      description: 'Marcus books directly through the estimate',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="book-btn"]',
      duration: 40,
      narration:
        'Marcus opens the estimate and books an appointment right there. No phone calls. No back-and-forth. He sees your calendar, picks a time, and confirms.',
      cta: 'Book Appointment',
    },
    {
      id: '9-dispatch',
      title: 'Technician Automatically Assigned',
      description: 'Your team gets the job ready',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="job-dispatch"]',
      duration: 35,
      narration:
        'When Marcus books, WISE² automatically creates a job and assigns it to your closest available technician. Your team gets notified instantly and can start preparing materials.',
      action: 'highlight',
    },
    {
      id: '10-completed',
      title: 'Job Completed',
      description: 'Work is done, invoice issued',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="job-complete"]',
      duration: 30,
      narration:
        'Your technician finishes the AC repair. They mark the job complete in WISE². An invoice is automatically generated and sent to Marcus.',
      cta: 'Mark Complete',
    },
    {
      id: '11-payment',
      title: 'Payment Received',
      description: 'Customer pays instantly',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="payment-status"]',
      duration: 35,
      narration:
        'Marcus receives the invoice with a pay now button. He pays directly through WISE². Your account is updated instantly. No chasing invoices.',
      cta: 'Payment Received',
    },
    {
      id: '12-revenue',
      title: 'Revenue Tracked & Analyzed',
      description: 'See your money flow and repeat business',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="revenue-dashboard"]',
      duration: 60,
      narration:
        'WISE² shows you exactly where that revenue came from. Google search. Your response time. The appointment your AI booked. You can see which marketing channels and which team members bring the most revenue. You know what to repeat.',
      action: 'highlight',
    },
    {
      id: '13-closing',
      title: 'Ready to Run Your Business on WISE²?',
      description: 'This complete system is waiting for you',
      route: '/demo/:slug',
      duration: 60,
      narration:
        'That\'s the complete WISE² journey. Automated lead capture. AI handling first contact. Estimates and bookings on your schedule. Payments processed instantly. Revenue tracked automatically. Everything you just saw is ready to use in your business right now.',
      cta: 'Activate WISE² for My Business',
    },
  ],
};

/**
 * Customer-focused tour
 *
 * Shows what customers experience: easy booking, quick responses, professional service.
 */
export const CUSTOMER_EXPERIENCE_TOUR: DemoTourDefinition = {
  key: 'CUSTOMER_EXPERIENCE',
  name: 'The Customer Experience',
  description: 'See what your customers will experience with WISE²',
  duration: 180, // 3 minutes
  targetAudience: 'customer',
  steps: [
    {
      id: '1-welcome',
      title: 'Your Booking Experience',
      description: 'See how easy it is to book with you',
      route: '/demo/:slug/customer',
      duration: 30,
      narration: 'Welcome. Let\'s see what booking an appointment looks like.',
      cta: 'Start',
    },
    {
      id: '2-website',
      title: 'Find Your Service',
      description: 'Browse your services and get a quote',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="services"]',
      duration: 40,
      narration:
        'First, you browse our services and see pricing. Everything is clear and transparent.',
    },
    {
      id: '3-contact',
      title: 'Quick Contact',
      description: 'Submit your information',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="contact-form"]',
      duration: 30,
      narration: 'You fill out a simple form and submit. No phone trees, no hold music.',
      cta: 'Submit',
    },
    {
      id: '4-response',
      title: 'Instant Response',
      description: 'You get a response right away',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="response-notification"]',
      duration: 35,
      narration:
        'Within seconds, we respond. Our AI answers your questions and offers appointment options.',
    },
    {
      id: '5-quote',
      title: 'Professional Quote',
      description: 'See a detailed estimate',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="quote-view"]',
      duration: 40,
      narration: 'You get a professional quote with all the details. Everything is clear.',
      cta: 'View Quote',
    },
    {
      id: '6-book',
      title: 'Book Right Away',
      description: 'Pick your time and confirm',
      route: '/demo/:slug/customer',
      targetElement: '[data-element="calendar"]',
      duration: 30,
      narration: 'You see our available times and book what works for you. Confirmed immediately.',
      cta: 'Book Appointment',
    },
    {
      id: '7-closing',
      title: 'That\'s the Experience',
      description: 'Fast, professional, easy.',
      route: '/demo/:slug/customer',
      duration: 35,
      narration:
        'That\'s how easy it is to book an appointment. Fast response. Clear pricing. Simple booking. Professional every step of the way.',
      cta: 'Done',
    },
  ],
};

/**
 * Money-focused tour
 *
 * Shows how revenue flows and is tracked.
 */
export const MONEY_VIEW_TOUR: DemoTourDefinition = {
  key: 'MONEY_VIEW',
  name: 'How You Make Money with WISE²',
  description: 'Follow the money from lead to profit',
  duration: 240, // 4 minutes
  targetAudience: 'owner',
  steps: [
    {
      id: '1-overview',
      title: 'Revenue Dashboard',
      description: 'See all your money metrics at a glance',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="money-dashboard"]',
      duration: 45,
      narration: 'This dashboard shows you exactly how your business makes money.',
      cta: 'Start',
    },
    {
      id: '2-breakdown',
      title: 'Revenue Breakdown',
      description: 'See where money comes from',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="revenue-by-source"]',
      duration: 50,
      narration: 'See which marketing channels bring the most revenue. Google brings 35%, referrals bring 40%, direct brings 25%.',
    },
    {
      id: '3-team',
      title: 'Revenue by Team Member',
      description: 'See who brings the most business',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="revenue-by-technician"]',
      duration: 50,
      narration: 'Your top technician brings in 40% of revenue. Knowing this helps you invest in their training and retention.',
    },
    {
      id: '4-forecast',
      title: 'Revenue Forecast',
      description: 'Predict next month\'s income',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="forecast-chart"]',
      duration: 45,
      narration: 'WISE² predicts next month will bring $18,500 based on your pipeline. You can plan accordingly.',
    },
    {
      id: '5-opportunities',
      title: 'Revenue Opportunities',
      description: 'Find ways to make more money',
      route: '/demo/:slug/owner',
      targetElement: '[data-element="upsell-opportunities"]',
      duration: 40,
      narration: 'WISE² spots opportunities: 12 customers are ready to upgrade to maintenance plans. That\'s $4,800 in annual revenue.',
      cta: 'Review Opportunities',
    },
  ],
};

/**
 * All default tours
 */
export const DEFAULT_DEMO_TOURS: DemoTourDefinition[] = [
  LEAD_TO_MONEY_TOUR,
  CUSTOMER_EXPERIENCE_TOUR,
  MONEY_VIEW_TOUR,
];

/**
 * Get tour by key
 */
export function getTourByKey(
  key: string,
): DemoTourDefinition | undefined {
  return DEFAULT_DEMO_TOURS.find((t) => t.key === key);
}

/**
 * Get tours for target audience
 */
export function getToursForAudience(
  audience: 'owner' | 'customer',
): DemoTourDefinition[] {
  return DEFAULT_DEMO_TOURS.filter(
    (t) => t.targetAudience === audience || t.targetAudience === 'both',
  );
}
