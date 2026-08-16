'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavSection, NavItem } from '@/types/navigation';

interface SidebarNavProps {
  sections: NavSection[];
  collapsed: boolean;
  width: number;
  onToggle: () => void;
  onResize: (newWidth: number) => void;
  onItemClick?: (item: NavItem) => void;
}

export default function SidebarNav({
  sections,
  collapsed,
  width,
  onToggle,
  onResize,
  onItemClick,
}: SidebarNavProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter((s) => !s.collapsed).map((s) => s.id))
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e: globalThis.MouseEvent) => {
    const newWidth = Math.max(180, Math.min(400, e.clientX));
    onResize(newWidth);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
      />

      {/* Sidebar */}
      <motion.div
        initial={{ x: -width }}
        animate={{ x: 0 }}
        transition={{ duration: 0.2 }}
        style={{ width: collapsed ? 80 : width }}
        className="fixed left-0 top-16 bottom-0 z-40 flex flex-col border-r border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-900/30 backdrop-blur-md lg:relative lg:top-0"
      >
        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.id} className="mb-6">
              {/* Section Header */}
              {!collapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <span>{section.title}</span>
                  <motion.span
                    animate={{ rotate: expandedSections.has(section.id) ? 0 : -90 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </button>
              )}

              {/* Section Items */}
              <motion.div
                animate={{ height: collapsed || expandedSections.has(section.id) ? 'auto' : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className={collapsed ? 'space-y-2' : 'space-y-1'}>
                  {section.items.map((item) => (
                    <NavItemButton
                      key={item.id}
                      item={item}
                      collapsed={collapsed}
                      isHovered={hoveredItem === item.id}
                      onHover={() => setHoveredItem(item.id)}
                      onLeave={() => setHoveredItem(null)}
                      onClick={() => onItemClick?.(item)}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        <motion.button
          onClick={onToggle}
          className="m-3 flex items-center justify-center rounded-lg p-2 hover:bg-white/10 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
            className="text-lg"
          >
            ◀
          </motion.span>
        </motion.button>
      </motion.div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`group absolute top-16 left-[calc(var(--sidebar-width,256px)_-_4px)] bottom-0 z-50 w-1 cursor-col-resize bg-gradient-to-b from-transparent via-blue-500/0 to-transparent hover:via-blue-500/50 transition-colors ${
          isDragging ? 'via-blue-500/50' : ''
        }`}
        style={{
          '--sidebar-width': collapsed ? '80px' : `${width}px`,
        } as React.CSSProperties}
      />
    </>
  );
}

interface NavItemButtonProps {
  item: NavItem;
  collapsed: boolean;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}

function NavItemButton({
  item,
  collapsed,
  isHovered,
  onHover,
  onLeave,
  onClick,
}: NavItemButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`relative w-full rounded-lg px-3 py-2 transition-all flex items-center gap-3 ${
        item.active
          ? 'bg-blue-600/30 text-blue-400'
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {/* Background Highlight */}
      {isHovered && !item.active && (
        <motion.div
          layoutId={`nav-item-${item.id}`}
          className="absolute inset-0 rounded-lg bg-white/5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Content */}
      <div className="relative flex-1 flex items-center gap-3">
        <div className="text-lg flex-shrink-0">{item.icon}</div>

        {!collapsed && (
          <>
            <span className="flex-1 text-left text-sm font-medium">{item.label}</span>

            {/* Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center rounded-full bg-blue-600 w-5 h-5 text-xs font-bold text-white"
              >
                {item.badge > 99 ? '99+' : item.badge}
              </motion.span>
            )}

            {/* Pin Icon */}
            {item.pinned && (
              <span className="text-yellow-400" title="Pinned">
                ⭐
              </span>
            )}
          </>
        )}
      </div>

      {/* Tooltip on collapse */}
      {collapsed && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.15 }}
          className="absolute left-full ml-2 whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white pointer-events-none"
        >
          {item.label}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="ml-2 inline-block rounded-full bg-blue-600 w-5 h-5 text-center text-xs text-white">
              {item.badge}
            </span>
          )}
        </motion.div>
      )}
    </motion.button>
  );
}
