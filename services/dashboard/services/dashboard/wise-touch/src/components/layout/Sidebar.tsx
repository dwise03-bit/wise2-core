'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  LayoutGrid, Zap, Briefcase, Cloud, GitBranch, Shield,
  MessageSquare, HardDrive, Package, Truck, BookOpen,
  CheckSquare, BarChart3, Workflow, Store, DollarSign,
  FileText, Users, Settings, ChevronDown, Menu
} from 'lucide-react'
import { SIDEBAR } from '@/lib/design-tokens'

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutGrid,
    href: '/',
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Zap,
    href: '/ai',
  },
  {
    id: 'business',
    label: 'Business',
    icon: Briefcase,
    href: '/business',
    children: [
      { label: 'CRM', href: '/business/crm', icon: Users },
      { label: 'Invoices', href: '/business/invoices', icon: FileText },
      { label: 'Customers', href: '/business/customers', icon: Users },
      { label: 'Calendar', href: '/business/calendar', icon: BarChart3 },
    ],
  },
  {
    id: 'infrastructure',
    label: 'Infrastructure',
    icon: Cloud,
    href: '/infrastructure',
  },
  {
    id: 'deployments',
    label: 'Deployments',
    icon: GitBranch,
    href: '/deployments',
  },
  {
    id: 'security',
    label: 'Cyber Security',
    icon: Shield,
    href: '/security',
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    href: '/communications',
  },
  {
    id: 'storage',
    label: 'Storage',
    icon: HardDrive,
    href: '/storage',
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    href: '/inventory',
  },
  {
    id: 'fleet',
    label: 'Fleet',
    icon: Truck,
    href: '/fleet',
  },
  {
    id: 'training',
    label: 'Training',
    icon: BookOpen,
    href: '/training',
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: CheckSquare,
    href: '/projects',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: Workflow,
    href: '/automation',
  },
  {
    id: 'store',
    label: 'Store',
    icon: Store,
    href: '/store',
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: DollarSign,
    href: '/finance',
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    href: '/documents',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null)

  return (
    <motion.aside
      className="bg-bg-secondary border-r border-steel/30 flex flex-col h-screen overflow-y-auto"
      animate={{
        width: isOpen ? SIDEBAR.width : SIDEBAR.collapsedWidth,
      }}
      transition={{
        duration: parseFloat(SIDEBAR.transitionDuration) / 1000,
      }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-steel/30">
        <motion.div
          className="flex items-center justify-between"
          animate={{
            justifyContent: isOpen ? 'space-between' : 'center',
          }}
        >
          {isOpen && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-electric to-blue-dark rounded-lg flex items-center justify-center">
                  <span className="text-bg-primary font-black text-sm">W²</span>
                </div>
                <div className="absolute inset-0 rounded-lg animate-pulse-blue"></div>
              </div>
              <span className="font-bold text-sm text-chrome-light">WISE TOUCH</span>
            </motion.div>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-bg-tertiary rounded transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-chrome" />
          </button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            item={item}
            isOpen={isOpen}
            isExpanded={expandedSection === item.id}
            onExpand={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
          />
        ))}
      </nav>

      {/* Footer */}
      {isOpen && (
        <motion.div
          className="p-4 border-t border-steel/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-xs text-chrome-dark text-center">
            <p className="font-mono">v1.0.0</p>
          </div>
        </motion.div>
      )}
    </motion.aside>
  )
}

function NavItem({
  item,
  isOpen,
  isExpanded,
  onExpand,
}: {
  item: any
  isOpen: boolean
  isExpanded: boolean
  onExpand: () => void
}) {
  const Icon = item.icon
  const hasChildren = item.children && item.children.length > 0

  return (
    <div>
      <motion.div
        className="relative group"
        whileHover={{ x: 4 }}
        transition={{ duration: 0.2 }}
      >
        <Link
          href={item.href}
          onClick={(e) => {
            if (hasChildren) {
              e.preventDefault()
              onExpand()
            }
          }}
          className="flex items-center gap-3 px-3 py-2 rounded text-chrome hover:text-blue-electric hover:bg-bg-tertiary transition-colors group/nav relative"
        >
          <Icon size={20} className="flex-shrink-0" />
          {isOpen && (
            <>
              <span className="text-sm font-medium">{item.label}</span>
              {hasChildren && (
                <motion.div
                  className="ml-auto"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              )}
            </>
          )}
          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-bg-tertiary border border-steel rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              {item.label}
            </div>
          )}
        </Link>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded bg-blue-electric/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
      </motion.div>

      {/* Submenu */}
      {hasChildren && isOpen && isExpanded && (
        <motion.div
          className="ml-4 mt-1 space-y-1 pl-3 border-l border-steel/30"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          {item.children.map((child: any) => (
            <Link
              key={child.href}
              href={child.href}
              className="flex items-center gap-2 px-3 py-2 rounded text-sm text-chrome-dark hover:text-blue-electric hover:bg-bg-tertiary transition-colors"
            >
              {child.icon && <child.icon size={16} />}
              <span>{child.label}</span>
            </Link>
          ))}
        </motion.div>
      )}
    </div>
  )
}
