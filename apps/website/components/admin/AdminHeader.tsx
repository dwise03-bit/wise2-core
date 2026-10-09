'use client';

import { useEffect, useState } from 'react';

export function AdminHeader() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check if user is already logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('blakkhail-admin-token') : null;
    const user = typeof window !== 'undefined' ? localStorage.getItem('blakkhail-admin-user') : null;
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        setUserEmail(userData.email);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Error parsing user data');
      }
    }
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('blakkhail-admin-token');
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      }).then(() => {
        localStorage.removeItem('blakkhail-admin-token');
        localStorage.removeItem('blakkhail-admin-user');
        setIsAuthenticated(false);
        setUserEmail('');
      });
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      zIndex: 9999,
      padding: '1rem 2rem',
      background: 'rgba(0, 0, 0, 0.9)',
      borderLeft: '2px solid #e8c56b',
      borderBottom: '2px solid #e8c56b',
      borderRadius: '0 0 0 8px'
    }}>
      {isAuthenticated ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#e8c56b', fontSize: '0.875rem', fontWeight: 700 }}>
            ✓ {userEmail}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              background: '#e8c56b',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f5d98d';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#e8c56b';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            LOGOUT
          </button>
        </div>
      ) : (
        <a
          href="/blakkhail-admin-tv-login.html"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#e8c56b',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-block',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f5d98d';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#e8c56b';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          🔐 Admin Login
        </a>
      )}
    </div>
  );
}
