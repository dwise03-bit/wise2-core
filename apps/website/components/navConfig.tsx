import { NavSection, Command } from '@/types/navigation';

export const defaultNavSections: NavSection[] = [
  {
    id: 'main',
    title: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', active: true },
      { id: 'studio', label: 'Studio', icon: '🎬', href: '/studio' },
      { id: 'automation', label: 'Automation', icon: '⚡', href: '/automation', badge: 3 },
      { id: 'projects', label: 'Projects', icon: '📁', href: '/projects' },
    ],
  },
  {
    id: 'creative',
    title: 'Creative',
    items: [
      { id: 'media', label: 'Media', icon: '🎨', href: '/media' },
      { id: 'jingle-lab', label: 'Jingle Lab', icon: '🎵', href: '/studio/jingle-lab', badge: 1 },
      { id: 'soundlab', label: 'SoundLab', icon: '🎚️', href: '/soundlab' },
      { id: 'live-studio', label: 'Live Studio', icon: '📹', href: '/live-studio' },
      { id: 'labs', label: 'Labs', icon: '🧪', href: '/labs' },
      { id: 'ai', label: 'AI', icon: '✨', href: '/ai', badge: 12 },
    ],
  },
  {
    id: 'data',
    title: 'Data',
    items: [
      { id: 'knowledge', label: 'Knowledge', icon: '📚', href: '/knowledge' },
      { id: 'crm', label: 'CRM', icon: '👥', href: '/crm' },
      { id: 'analytics', label: 'Analytics', icon: '📈', href: '/analytics' },
    ],
  },
  {
    id: 'system',
    title: 'System',
    items: [
      { id: 'infrastructure', label: 'Infrastructure', icon: '🖥️', href: '/infrastructure' },
      { id: 'files', label: 'Files', icon: '🗂️', href: '/files' },
      { id: 'marketplace', label: 'Marketplace', icon: '🛒', href: '/marketplace' },
      { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', pinned: true },
    ],
  },
];

export function buildDefaultCommands(router: { push: (path: string) => void }): Command[] {
  const pageCommands: Command[] = defaultNavSections.flatMap((section) =>
    section.items.map((item) => ({
      id: `page-${item.id}`,
      title: item.label,
      description: `Go to ${item.label}`,
      category: 'pages' as const,
      icon: item.icon,
      action: () => item.href && router.push(item.href),
    }))
  );

  const aiCommands: Command[] = [
    {
      id: 'ai-generate-copy',
      title: 'Generate marketing copy',
      description: 'AI-assisted copywriting for landing pages',
      category: 'ai-commands',
      icon: '✍️',
      shortcut: 'G C',
      action: () => console.log('Generate copy'),
    },
    {
      id: 'ai-summarize',
      title: 'Summarize document',
      description: 'AI summary of the current file',
      category: 'ai-commands',
      icon: '📝',
      shortcut: 'S D',
      action: () => console.log('Summarize'),
    },
    {
      id: 'ai-analyze-data',
      title: 'Analyze dataset',
      description: 'Run AI analysis on selected data',
      category: 'ai-commands',
      icon: '🔬',
      action: () => console.log('Analyze data'),
    },
  ];

  const settingsCommands: Command[] = [
    {
      id: 'settings-theme',
      title: 'Toggle theme',
      description: 'Switch between light and dark mode',
      category: 'settings',
      icon: '🌓',
      shortcut: '⌘T',
      action: () => console.log('Toggle theme'),
    },
    {
      id: 'settings-account',
      title: 'Account settings',
      description: 'Manage your profile and account',
      category: 'settings',
      icon: '👤',
      action: () => console.log('Account settings'),
    },
    {
      id: 'settings-notifications',
      title: 'Notification preferences',
      description: 'Configure alert and notification settings',
      category: 'settings',
      icon: '🔔',
      action: () => console.log('Notification prefs'),
    },
  ];

  const fileCommands: Command[] = [
    {
      id: 'files-new',
      title: 'New file',
      description: 'Create a new file in the current project',
      category: 'files',
      icon: '📄',
      shortcut: '⌘N',
      action: () => console.log('New file'),
    },
    {
      id: 'files-upload',
      title: 'Upload file',
      description: 'Upload a file from your device',
      category: 'files',
      icon: '⬆️',
      action: () => console.log('Upload file'),
    },
    {
      id: 'files-recent',
      title: 'Recent files',
      description: 'View recently accessed files',
      category: 'files',
      icon: '🕒',
      action: () => console.log('Recent files'),
    },
  ];

  return [...pageCommands, ...aiCommands, ...settingsCommands, ...fileCommands];
}

export const sampleNotifications = [
  {
    id: 'n1',
    title: 'Deployment successful',
    message: 'wise2.net was deployed to production',
    type: 'success' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: 'n2',
    title: 'New AI model available',
    message: 'GPT-5.2-turbo is now available in Labs',
    type: 'info' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
  },
  {
    id: 'n3',
    title: 'Storage warning',
    message: 'Media storage is at 85% capacity',
    type: 'warning' as const,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
  },
];
