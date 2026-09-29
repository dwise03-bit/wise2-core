export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  badge?: number;
  pinned?: boolean;
  submenu?: NavItem[];
  active?: boolean;
}

export interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  collapsed?: boolean;
}

export interface Command {
  id: string;
  title: string;
  description?: string;
  category: 'pages' | 'ai-commands' | 'settings' | 'files';
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
  recent?: boolean;
}

export interface NavigationState {
  sidebarCollapsed: boolean;
  rightPanelOpen: boolean;
  rightPanelWidth: number;
  sidebarWidth: number;
  commandPaletteOpen: boolean;
  mobileMenuOpen: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface StatusIndicator {
  status: 'connected' | 'disconnected' | 'connecting';
  lastSyncTime?: Date;
  syncing?: boolean;
  deploymentStatus?: 'idle' | 'deploying' | 'success' | 'error';
  aiProcessing?: boolean;
}
