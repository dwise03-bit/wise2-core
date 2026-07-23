'use client';

import React, { useState, useEffect } from 'react';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 hover:bg-[#101010] rounded transition"
      title="Toggle theme (Cmd+T)"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
