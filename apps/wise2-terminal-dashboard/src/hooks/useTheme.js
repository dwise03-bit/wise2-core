import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('wise2-theme') || 'dark';
    setTheme(saved);
    applyTheme(saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('wise2-theme', newTheme);
    applyTheme(newTheme);
  };

  return { theme, toggleTheme };
}

function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === 'light') {
    root.style.setProperty('--bg-black', '#FFFFFF');
    root.style.setProperty('--bg-dark', '#F5F7FA');
    root.style.setProperty('--bg-dark-grey', '#E8ECEF');
    root.style.setProperty('--primary', '#1E3A8A');
    root.style.setProperty('--secondary', '#3B82F6');
    root.style.setProperty('--success', '#059669');
    root.style.setProperty('--warning', '#D97706');
    root.style.setProperty('--critical', '#DC2626');
    root.style.setProperty('--accent', '#0EA5E9');
    root.style.setProperty('--border', '#E5E7EB');
    root.style.setProperty('--text-primary', '#1F2937');
    root.style.setProperty('--text-secondary', '#6B7280');
    root.style.setProperty('--text-muted', '#9CA3AF');
  } else {
    root.style.setProperty('--bg-black', '#0F0F23');
    root.style.setProperty('--bg-dark', '#1B1B30');
    root.style.setProperty('--bg-dark-grey', '#121212');
    root.style.setProperty('--primary', '#1E1B4B');
    root.style.setProperty('--secondary', '#4338CA');
    root.style.setProperty('--success', '#22C55E');
    root.style.setProperty('--warning', '#FFA500');
    root.style.setProperty('--critical', '#FF0000');
    root.style.setProperty('--accent', '#00D9FF');
    root.style.setProperty('--border', '#312E81');
    root.style.setProperty('--text-primary', '#F8FAFC');
    root.style.setProperty('--text-secondary', '#94A3B8');
    root.style.setProperty('--text-muted', '#64748B');
  }
}
