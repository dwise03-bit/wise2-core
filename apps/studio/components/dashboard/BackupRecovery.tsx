'use client';

import React, { useState } from 'react';

interface Backup {
  id: string;
  timestamp: Date;
  size: string;
  status: 'completed' | 'in-progress' | 'failed';
}

export function BackupRecovery() {
  const [backups] = useState<Backup[]>([
    { id: '1', timestamp: new Date(Date.now() - 1 * 60 * 60000), size: '2.4 GB', status: 'completed' },
    { id: '2', timestamp: new Date(Date.now() - 25 * 60 * 60000), size: '2.3 GB', status: 'completed' },
    { id: '3', timestamp: new Date(Date.now() - 49 * 60 * 60000), size: '2.2 GB', status: 'completed' },
  ]);

  const getStatusIcon = (status: Backup['status']) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '⏳';
      case 'failed': return '✕';
    }
  };

  return (
    <div className="bg-[#101010] border border-[#161616] rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white">BACKUP & RECOVERY</h3>
        <button className="px-3 py-1 text-xs bg-emerald-500 text-black rounded font-semibold hover:bg-emerald-400 transition">
          Backup Now
        </button>
      </div>

      <div className="space-y-2">
        {backups.map((backup, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-[#050505] rounded text-xs">
            <div>
              <p className="text-gray-400">
                {backup.timestamp.toLocaleDateString()} {backup.timestamp.toLocaleTimeString()}
              </p>
              <p className="text-emerald-400 font-semibold">{backup.size}</p>
            </div>
            <span className="text-emerald-400">{getStatusIcon(backup.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
