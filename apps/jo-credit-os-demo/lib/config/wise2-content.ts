// WISE² Content and Configuration Data
export const wise2Content = {
  brand: {
    title: 'WISE²',
    tagline: 'Building Empires, Changing Culture',
    description: 'The AI-native business operating system for founder-led enterprises',
  },
  services: [
    {
      id: 'consulting',
      name: 'Strategic Consulting',
      description: 'Business strategy and operational optimization',
    },
    {
      id: 'technology',
      name: 'Technology Platform',
      description: 'AI-powered business OS and infrastructure',
    },
    {
      id: 'creative',
      name: 'Creative Services',
      description: 'Brand identity, content, and media production',
    },
  ],
  features: [
    {
      title: 'Intent Management Platform',
      description: 'Natural language control across all systems',
    },
    {
      title: 'Multi-Node Architecture',
      description: 'Distributed execution across Mac, VPS, GPU, and Edge',
    },
    {
      title: 'Risk-Based Access Control',
      description: 'Intelligent authorization with confirmation tokens',
    },
    {
      title: 'Persistent Memory',
      description: 'Durable state management and audit logging',
    },
  ],
};

export const intakeFormConfig = {
  fields: [
    { name: 'fullName', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', required: true, type: 'email' },
    { name: 'company', label: 'Company', required: false },
    { name: 'message', label: 'Message', required: true, type: 'textarea' },
  ],
  submitLabel: 'Send Message',
};
