'use client';

import React, { useState } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Deployment Complete',
      message: 'Phase 2 deployed to production',
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Redis memory at 78%',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
    },
    {
      id: '3',
      type: 'info',
      title: 'System Update',
      message: 'Backup completed successfully',
      timestamp: new Date(Date.now() - 1 * 60 * 60000),
      read: true,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠️';
      case 'error': return '✕';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#101010] rounded transition"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#101010] border border-emerald-500/30 rounded-lg shadow-2xl z-40">
          <div className="p-4 border-b border-[#161616]">
            <h3 className="text-sm font-bold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 border-b border-[#161616] last:border-0 ${
                  !notif.read ? 'bg-emerald-500/5' : ''
                }`}
              >
                <div className="flex gap-3">
                  <span className="text-lg">{getIcon(notif.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{notif.title}</p>
                    <p className="text-xs text-gray-500">{notif.message}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {Math.floor((Date.now() - notif.timestamp.getTime()) / 60000)} min ago
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
