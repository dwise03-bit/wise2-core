'use client';

import React, { useState, useEffect } from 'react';

export function CommandCenterHeader() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="px-6 py-8 border-b border-emerald-500/20 bg-gradient-to-b from-[#101010] to-[#050505]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-white mb-1">WISE²</h1>
            <p className="text-sm text-emerald-400">Enterprise AI Operating System</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-white">{time}</p>
            <p className="text-xs text-gray-500">UTC</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#101010] border border-[#161616] rounded p-3">
            <p className="text-xs text-gray-500 mb-1">WORKSPACE</p>
            <p className="text-sm font-semibold">Production</p>
          </div>
          <div className="bg-[#101010] border border-[#161616] rounded p-3">
            <p className="text-xs text-gray-500 mb-1">USER</p>
            <p className="text-sm font-semibold">Daniel Wise</p>
          </div>
          <div className="bg-[#101010] border border-[#161616] rounded p-3">
            <p className="text-xs text-gray-500 mb-1">ENVIRONMENT</p>
            <p className="text-sm font-semibold text-emerald-400">LIVE</p>
          </div>
          <div className="bg-[#101010] border border-[#161616] rounded p-3">
            <p className="text-xs text-gray-500 mb-1">SYNC STATUS</p>
            <p className="text-sm font-semibold text-emerald-400">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}
