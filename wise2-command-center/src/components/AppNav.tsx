'use client';

import Link from 'next/link';

export default function AppNav() {
  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      width: '200px',
      background: 'linear-gradient(180deg, rgba(0,217,255,0.05) 0%, rgba(10,14,39,0.9) 100%)',
      borderRight: '1px solid rgba(0,217,255,0.2)',
      padding: '30px 20px',
      zIndex: 999,
      fontFamily: "'Syne', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 700,
        color: '#00D9FF',
        textTransform: 'uppercase',
        letterSpacing: '2px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(0,217,255,0.2)',
      }}>
        WISE²
      </div>

      <Link href="/" style={{
        color: '#E8F0FF',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,217,255,0.1)';
        e.currentTarget.style.color = '#00D9FF';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E8F0FF';
      }}>
        🏠 Home
      </Link>

      <Link href="/woji" style={{
        color: '#E8F0FF',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,217,255,0.1)';
        e.currentTarget.style.color = '#00D9FF';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E8F0FF';
      }}>
        🎛️ WOJI Control
      </Link>

      <Link href="/hermes-control" style={{
        color: '#E8F0FF',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,217,255,0.1)';
        e.currentTarget.style.color = '#00D9FF';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E8F0FF';
      }}>
        ⚡ Hermes Control
      </Link>

      <Link href="/tracker" style={{
        color: '#E8F0FF',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,217,255,0.1)';
        e.currentTarget.style.color = '#00D9FF';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E8F0FF';
      }}>
        📦 Order Tracker
      </Link>

      <Link href="/tracker-pro" style={{
        color: '#E8F0FF',
        textDecoration: 'none',
        fontSize: '14px',
        padding: '12px',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
      }} onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(0,217,255,0.1)';
        e.currentTarget.style.color = '#00D9FF';
      }} onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#E8F0FF';
      }}>
        🚀 Tracker Pro
      </Link>
    </nav>
  );
}
