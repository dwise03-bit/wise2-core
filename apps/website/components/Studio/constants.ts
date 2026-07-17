/**
 * WISE² Studio Constants
 * Navigation items, layout dimensions, and configuration
 */

import { NavItem } from './types';

export const LAYOUT = {
  NAV_COLLAPSED: 80,
  NAV_EXPANDED: 256,
  NAV_TRANSITION: 300,
  TOP_BAR_HEIGHT: 56,
  BOTTOM_BAR_HEIGHT: 40,
  RIGHT_PANEL_MIN: 240,
  RIGHT_PANEL_MAX: 400,
  RIGHT_PANEL_DEFAULT: 320,
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: '📊',
    path: '/studio/dashboard',
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: '🎨',
    path: '/studio/workspace',
    isPinned: true,
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: '⚙️',
    path: '/studio/automation',
    badge: 3,
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: '📁',
    path: '/studio/projects',
  },
  {
    id: 'media',
    label: 'Media Library',
    icon: '📷',
    path: '/studio/media',
  },
  {
    id: 'audio-lab',
    label: 'Audio Lab',
    icon: '🎵',
    path: '/studio/audio',
  },
  {
    id: 'video-lab',
    label: 'Video Lab',
    icon: '🎬',
    path: '/studio/video',
  },
  {
    id: 'ai-agents',
    label: 'AI Agents',
    icon: '🤖',
    path: '/studio/agents',
    badge: 1,
  },
];

export const COMMAND_PALETTE_COMMANDS = [
  { id: 'new-project', label: 'New Project', icon: '📄', shortcut: '⌘N' },
  { id: 'search-assets', label: 'Search Assets', icon: '🔍', shortcut: '⌘P' },
  { id: 'generate-ai', label: 'Generate with AI', icon: '✨', shortcut: '⌘K' },
  { id: 'export', label: 'Export Project', icon: '💾', shortcut: '⌘E' },
  { id: 'settings', label: 'Settings', icon: '⚙️', shortcut: '⌘,' },
  { id: 'help', label: 'Help & Docs', icon: '❓', shortcut: '⌘/' },
];

export const PANEL_TABS = [
  { id: 'properties', label: 'Properties', icon: '🎛️' },
  { id: 'timeline', label: 'Timeline', icon: '⏱️' },
  { id: 'prompt', label: 'Prompt Editor', icon: '✍️' },
  { id: 'inspector', label: 'Inspector', icon: '🔍' },
] as const;

export const ANIMATION_CONFIG = {
  EASE_SPRING: { type: 'spring', stiffness: 300, damping: 30 },
  EASE_SMOOTH: { duration: 0.3, ease: 'easeInOut' as const },
  EASE_FAST: { duration: 0.15, ease: 'easeOut' as const },
} as const;

export const AI_STATUS_MESSAGES = {
  idle: 'Ready to generate',
  processing: 'Processing your request...',
  streaming: 'Streaming response...',
  error: 'Error processing request',
} as const;

export const SYNC_STATUS_MESSAGES = {
  synced: 'All changes saved',
  syncing: 'Syncing to cloud...',
  error: 'Sync failed',
} as const;
