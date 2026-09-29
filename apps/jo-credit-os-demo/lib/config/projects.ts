// WISE² Projects and Portfolio Data
export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'active' | 'completed' | 'in-progress';
  image?: string;
  link?: string;
}

export const projects: Project[] = [
  {
    id: 'wise-shine',
    title: 'Wise Shine',
    description: 'Premium personal brand and lifestyle platform',
    category: 'Brand',
    status: 'active',
  },
  {
    id: 'piff-city',
    title: 'Piff City Creative Studios',
    description: 'Full-service creative production and content creation',
    category: 'Creative',
    status: 'active',
  },
  {
    id: 'wise2-imp',
    title: 'WISE² Intent Management Platform',
    description: 'AI-native routing and orchestration system',
    category: 'Technology',
    status: 'in-progress',
  },
  {
    id: 'hermes-gateway',
    title: 'Hermes Gateway',
    description: 'Multi-node execution and messaging infrastructure',
    category: 'Infrastructure',
    status: 'active',
  },
  {
    id: 'jo-credit-os',
    title: 'JO Credit OS',
    description: 'Business operating system and credit management',
    category: 'Platform',
    status: 'in-progress',
  },
];

export const projectCategories = [
  'All',
  'Brand',
  'Creative',
  'Technology',
  'Infrastructure',
  'Platform',
];

export const getProjectsByCategory = (category: string): Project[] => {
  if (category === 'All') return projects;
  return projects.filter((project) => project.category === category);
};
