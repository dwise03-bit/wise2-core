/**
 * WISE² ENTERPRISE DEMO MODE ENGINE
 * Codename: SHOWTIME
 * Version: 1.0
 *
 * Transforms WISE² into a self-contained demonstration environment
 * suitable for customer presentations, sales meetings, and trade shows
 */

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// ============================================================================
// DEMO DATA GENERATORS
// ============================================================================

const demoData = {
  customers: [
    { id: 1, name: "Acme HVAC Inc", industry: "HVAC", employees: 12, revenue: 450000, status: "active" },
    { id: 2, name: "The Golden Fork Restaurant", industry: "Restaurant", employees: 8, revenue: 280000, status: "active" },
    { id: 3, name: "Sterling Law Group", industry: "Legal", employees: 15, revenue: 750000, status: "active" },
    { id: 4, name: "Downtown Medical", industry: "Healthcare", employees: 20, revenue: 1200000, status: "active" },
    { id: 5, name: "BuildRight Construction", industry: "Construction", employees: 25, revenue: 2100000, status: "active" },
    { id: 6, name: "AutoCare Plus", industry: "Automotive", employees: 10, revenue: 380000, status: "active" },
    { id: 7, name: "Fashion Forward Boutique", industry: "Retail", employees: 6, revenue: 520000, status: "active" },
    { id: 8, name: "Sunset Properties Real Estate", industry: "Real Estate", employees: 18, revenue: 890000, status: "active" },
  ],

  users: [
    { id: 1, name: "Alex Chen", role: "admin", company: "Acme HVAC", email: "alex@acmehvac.com", avatar: "👨‍💼" },
    { id: 2, name: "Sarah Johnson", role: "ceo", company: "The Golden Fork", email: "sarah@goldenfork.com", avatar: "👩‍💼" },
    { id: 3, name: "Michael Rodriguez", role: "ops", company: "Sterling Law", email: "michael@sterlinglaw.com", avatar: "👨‍💼" },
    { id: 4, name: "Emily Watson", role: "sales", company: "WISE²", email: "emily@wise2.net", avatar: "👩‍💻" },
    { id: 5, name: "David Park", role: "support", company: "WISE²", email: "david@wise2.net", avatar: "👨‍💻" },
    { id: 6, name: "Lisa Chen", role: "marketing", company: "WISE²", email: "lisa@wise2.net", avatar: "👩‍💻" },
  ],

  projects: [
    { id: 1, name: "Website Redesign", customer: "Acme HVAC", status: "active", progress: 65 },
    { id: 2, name: "Social Media Campaign", customer: "The Golden Fork", status: "active", progress: 45 },
    { id: 3, name: "CRM Implementation", customer: "Sterling Law", status: "active", progress: 80 },
    { id: 4, name: "Patient Portal", customer: "Downtown Medical", status: "completed", progress: 100 },
    { id: 5, name: "Marketing Automation", customer: "BuildRight Construction", status: "active", progress: 35 },
  ],

  metrics: {
    revenue: 5620000,
    mrr: 468333,
    customers: 8,
    projects: 5,
    aiUsage: 847293,
    tokensUsed: 12849374,
    uptime: 99.98,
    activeUsers: 12,
    conversions: 0.042,
  },

  activities: [
    "AI Agent processed invoice for Acme HVAC",
    "Emily Watson logged in from Chrome on MacOS",
    "Automated email sent to 247 leads",
    "Website generated 1,234 impressions",
    "CRM updated 15 customer records",
    "Marketing campaign deployed to 5,000 contacts",
    "Support ticket #2847 resolved by AI",
    "Revenue recorded: $12,450",
    "Infrastructure health check: 99.98% uptime",
    "Storage usage: 2.3GB / 10GB",
  ],

  tickets: [
    { id: 2847, subject: "Website loading slow", customer: "Acme HVAC", status: "resolved", priority: "high" },
    { id: 2848, subject: "API integration question", customer: "The Golden Fork", status: "open", priority: "medium" },
    { id: 2849, subject: "Report export issue", customer: "Sterling Law", status: "resolved", priority: "low" },
  ],

  aiConversations: [
    { user: "Alex Chen", message: "Generate social media posts for this week", response: "I've generated 14 engaging posts across all platforms with optimal posting times." },
    { user: "Sarah Johnson", message: "What's our top performing menu item?", response: "Based on analytics, your Ribeye Steak has 34% higher margins and 28% repeat order rate." },
    { user: "Michael Rodriguez", message: "Summarize this week's billing", response: "Weekly billing: $18,400 gross | $3,200 expenses | $15,200 net profit | 12% week-over-week growth" },
  ],
};

// ============================================================================
// SIMULATION ENGINE
// ============================================================================

class SimulationEngine {
  constructor() {
    this.isRunning = DEMO_MODE;
    this.speed = 'normal'; // normal, fast, presentation, tradeshow, offline
    this.eventQueue = [];
    this.simulationIndex = 0;
  }

  start() {
    if (!this.isRunning) return;
    this.runSimulation();
  }

  stop() {
    this.isRunning = false;
  }

  getRandomActivity() {
    return demoData.activities[Math.floor(Math.random() * demoData.activities.length)];
  }

  getRandomMetricChange() {
    return {
      field: Object.keys(demoData.metrics)[Math.floor(Math.random() * Object.keys(demoData.metrics).length)],
      change: (Math.random() - 0.5) * 1000,
    };
  }

  runSimulation() {
    if (!this.isRunning) return;

    const delays = {
      normal: 3000,
      fast: 1000,
      presentation: 500,
      tradeshow: 250,
      offline: 100,
    };

    setTimeout(() => {
      this.eventQueue.push({
        type: 'activity',
        data: this.getRandomActivity(),
        timestamp: new Date().toISOString(),
      });

      this.simulationIndex++;

      if (this.simulationIndex % 3 === 0) {
        this.eventQueue.push({
          type: 'metric',
          data: this.getRandomMetricChange(),
          timestamp: new Date().toISOString(),
        });
      }

      this.runSimulation();
    }, delays[this.speed] || delays.normal);
  }

  getEvents(limit = 10) {
    return this.eventQueue.slice(-limit).reverse();
  }

  reset() {
    this.eventQueue = [];
    this.simulationIndex = 0;
  }
}

// ============================================================================
// DEMO MIDDLEWARE
// ============================================================================

function demoMiddleware(req, res, next) {
  if (!DEMO_MODE) {
    return next();
  }

  // Inject demo flag into response locals
  res.locals.demo = true;
  res.locals.demoUser = demoData.users[0]; // Default to first demo user

  // Add DEMO watermark to responses
  res.set('X-Demo-Mode', 'true');
  res.set('X-Demo-Version', '1.0');

  next();
}

// ============================================================================
// DEMO AUTHENTICATION
// ============================================================================

function demoAuth(email, password) {
  if (!DEMO_MODE) {
    return null;
  }

  const user = demoData.users.find(u => u.email === email);
  if (!user) {
    return { success: false, message: "Invalid credentials" };
  }

  return {
    success: true,
    token: `demo_${user.id}_${Date.now()}`,
    user: user,
  };
}

// ============================================================================
// DEMO API RESPONSES
// ============================================================================

const demoAPI = {
  getCustomers: () => demoData.customers,
  getMetrics: () => demoData.metrics,
  getActivities: (limit = 10) => demoData.activities.slice(-limit),
  getUsers: () => demoData.users,
  getProjects: () => demoData.projects,
  getTickets: () => demoData.tickets,
  getConversations: () => demoData.aiConversations,

  generateAIResponse: (prompt) => {
    const responses = [
      "I've analyzed the data and found 3 key opportunities for growth.",
      "Based on your metrics, I recommend focusing on customer retention.",
      "This campaign has a 42% conversion rate - well above industry average.",
      "I've identified 15 automation opportunities that could save 40 hours/week.",
      "Your top 3 customers represent 48% of annual revenue.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  createInvoice: () => ({
    id: `INV-${Date.now()}`,
    amount: Math.floor(Math.random() * 5000) + 500,
    status: "paid",
    customer: demoData.customers[Math.floor(Math.random() * demoData.customers.length)].name,
    date: new Date().toISOString(),
  }),

  recordPayment: () => ({
    id: `PAY-${Date.now()}`,
    amount: Math.floor(Math.random() * 10000) + 1000,
    method: "stripe",
    status: "success",
    timestamp: new Date().toISOString(),
  }),
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  DEMO_MODE,
  demoData,
  SimulationEngine,
  demoMiddleware,
  demoAuth,
  demoAPI,
};
