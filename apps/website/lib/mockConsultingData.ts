/**
 * Mock Consulting Services Data
 * Use this for development, testing, and Storybook demonstrations
 */

export const mockConsultingServices = {
  'business-strategy': {
    id: 'business-strategy',
    name: 'Business Strategy Consulting',
    description:
      'Transform your business with expert strategic guidance. Our consultants help organizations identify market opportunities, optimize operations, and accelerate growth through proven frameworks and industry best practices.',
    hourlyRate: 150,
    tags: ['Strategy', 'Growth', 'Operations', 'Leadership', 'Market Analysis'],
    consultants: [
      {
        id: 'consultant-001',
        name: 'Jane Smith',
        bio: '15-year veteran in business strategy and operations with 5 successful exits',
        expertise: ['Business Strategy', 'Operations', 'Growth Hacking', 'Leadership', 'Market Expansion'],
        hourlyRate: 150,
        rating: 4.9,
        yearsExperience: 15,
        bookingsCompleted: 287,
        avgReview:
          "Jane's strategic insights transformed our approach and helped us scale from $2M to $50M ARR. Her operational guidance was invaluable.",
      },
      {
        id: 'consultant-002',
        name: 'Michael Chen',
        bio: 'Former CTO and founder who scaled two companies from seed to $100M+',
        expertise: ['Technical Strategy', 'Scaling', 'Leadership', 'Product Strategy', 'Team Building'],
        hourlyRate: 175,
        rating: 4.8,
        yearsExperience: 18,
        bookingsCompleted: 156,
        avgReview:
          "Michael's deep technical background combined with business acumen is rare. He identified technical debt issues we didn't even know we had.",
      },
      {
        id: 'consultant-003',
        name: 'Sarah Johnson',
        bio: 'Strategy consultant for Fortune 500 companies and high-growth startups',
        expertise: ['Corporate Strategy', 'M&A', 'Market Research', 'Competitive Analysis', 'Change Management'],
        hourlyRate: 160,
        rating: 4.7,
        yearsExperience: 12,
        bookingsCompleted: 203,
        avgReview:
          'Sarah helped us navigate a complex market entry strategy. Her frameworks are practical and immediately actionable.',
      },
    ],
  },
  'marketing-strategy': {
    id: 'marketing-strategy',
    name: 'Marketing Strategy & Growth',
    description:
      'Build a comprehensive marketing strategy that drives measurable growth. Our consultants specialize in demand generation, brand positioning, customer acquisition, and retention strategies for B2B and B2C companies.',
    hourlyRate: 120,
    tags: ['Marketing', 'Growth', 'Branding', 'Customer Acquisition', 'Analytics'],
    consultants: [
      {
        id: 'consultant-004',
        name: 'Lisa Rodriguez',
        bio: 'Former VP of Marketing who built go-to-market strategies for multiple SaaS unicorns',
        expertise: [
          'Go-to-Market Strategy',
          'Demand Generation',
          'Brand Positioning',
          'Customer Acquisition',
          'Marketing Analytics',
        ],
        hourlyRate: 140,
        rating: 4.9,
        yearsExperience: 14,
        bookingsCompleted: 312,
        avgReview:
          "Lisa's GTM playbook increased our MQL to SQL conversion by 45%. She truly understands the complete funnel.",
      },
      {
        id: 'consultant-005',
        name: 'David Park',
        bio: 'Growth marketer with expertise in digital channels and data-driven optimization',
        expertise: ['Digital Marketing', 'Growth Hacking', 'Analytics', 'Conversion Optimization', 'Social Media'],
        hourlyRate: 110,
        rating: 4.6,
        yearsExperience: 9,
        bookingsCompleted: 178,
        avgReview:
          'David helped us set up our analytics infrastructure and identified growth levers we were missing. Very data-driven approach.',
      },
      {
        id: 'consultant-006',
        name: 'Amanda Foster',
        bio: 'Brand strategist and content expert with background in consumer marketing',
        expertise: ['Brand Strategy', 'Content Marketing', 'Storytelling', 'Customer Experience', 'Creative Direction'],
        hourlyRate: 125,
        rating: 4.8,
        yearsExperience: 11,
        bookingsCompleted: 245,
        avgReview:
          'Amanda elevated our brand messaging and created a content strategy that resonates with our target audience perfectly.',
      },
    ],
  },
  'tech-leadership': {
    id: 'tech-leadership',
    name: 'Technical Leadership & Architecture',
    description:
      'Build high-performing engineering teams and make strategic technical decisions. Our CTO-level consultants help with architecture decisions, team scaling, engineering culture, and technical hiring.',
    hourlyRate: 180,
    tags: ['Technology', 'Engineering', 'Leadership', 'Architecture', 'Hiring'],
    consultants: [
      {
        id: 'consultant-007',
        name: 'Alex Thompson',
        bio: 'Former CTO at multiple high-growth startups, expert in scaling engineering teams',
        expertise: [
          'Engineering Leadership',
          'Team Scaling',
          'Technical Architecture',
          'Engineering Culture',
          'Hiring Strategy',
        ],
        hourlyRate: 200,
        rating: 4.9,
        yearsExperience: 17,
        bookingsCompleted: 134,
        avgReview:
          "Alex's frameworks for scaling engineering teams are gold. He helped us go from 5 to 50 engineers without losing velocity.",
      },
      {
        id: 'consultant-008',
        name: 'Priya Patel',
        bio: 'Senior architect specializing in distributed systems and cloud infrastructure',
        expertise: ['System Architecture', 'Cloud Infrastructure', 'DevOps', 'Performance Optimization', 'Security'],
        hourlyRate: 190,
        rating: 4.8,
        yearsExperience: 16,
        bookingsCompleted: 98,
        avgReview:
          'Priya redesigned our entire infrastructure and cut our cloud costs by 40% while improving reliability.',
      },
      {
        id: 'consultant-009',
        name: 'Marcus Williams',
        bio: 'Full-stack expert with deep experience in product engineering and team dynamics',
        expertise: [
          'Product Engineering',
          'Agile Transformation',
          'Code Quality',
          'Team Dynamics',
          'Process Improvement',
        ],
        hourlyRate: 170,
        rating: 4.7,
        yearsExperience: 13,
        bookingsCompleted: 167,
        avgReview:
          'Marcus introduced us to modern development practices that significantly improved our shipping velocity.',
      },
    ],
  },
  'finance-operations': {
    id: 'finance-operations',
    name: 'Finance & Operations Consulting',
    description:
      'Optimize financial performance and operational efficiency. Our finance consultants help with budgeting, forecasting, unit economics, cash flow management, and operational process improvements.',
    hourlyRate: 140,
    tags: ['Finance', 'Operations', 'Accounting', 'Unit Economics', 'Process Optimization'],
    consultants: [
      {
        id: 'consultant-010',
        name: 'Robert Chang',
        bio: 'CFO with 20+ years in financial planning, fundraising, and M&A',
        expertise: ['Financial Planning', 'Unit Economics', 'Fundraising', 'M&A', 'Cash Flow Management'],
        hourlyRate: 200,
        rating: 4.9,
        yearsExperience: 20,
        bookingsCompleted: 89,
        avgReview:
          "Robert helped us restructure our financials and improved our unit economics significantly. Invaluable during our Series A process.",
      },
      {
        id: 'consultant-011',
        name: 'Elena Vasquez',
        bio: 'Operations expert focused on scaling and process optimization',
        expertise: [
          'Operations Scaling',
          'Process Improvement',
          'Supply Chain',
          'Cost Optimization',
          'Vendor Management',
        ],
        hourlyRate: 130,
        rating: 4.8,
        yearsExperience: 14,
        bookingsCompleted: 201,
        avgReview:
          'Elena identified inefficiencies that were costing us hundreds of thousands annually. Her process improvements are sustainable.',
      },
      {
        id: 'consultant-012',
        name: 'James Sullivan',
        bio: 'Accounting and compliance specialist for high-growth companies',
        expertise: ['Accounting', 'Tax Strategy', 'Compliance', 'Financial Systems', 'Audit Preparation'],
        hourlyRate: 120,
        rating: 4.6,
        yearsExperience: 11,
        bookingsCompleted: 156,
        avgReview:
          'James set up our accounting infrastructure properly from the start, saving us from headaches down the road.',
      },
    ],
  },
};

export type ServiceKey = keyof typeof mockConsultingServices;

export const getMockService = (serviceId: string) => {
  return mockConsultingServices[serviceId as ServiceKey] || null;
};

export const getAllMockServices = () => {
  return Object.values(mockConsultingServices);
};

export const getMockServicesList = () => {
  return Object.values(mockConsultingServices).map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description.substring(0, 150) + '...',
    hourlyRate: service.hourlyRate,
    consultantCount: service.consultants.length,
    tags: service.tags.slice(0, 3),
  }));
};
