'use client';

import { useEffect, useState } from 'react';

export default function CreativeStudioPage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHTML = async () => {
      try {
        const response = await fetch('/wise2-creative-studio.html');
        if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Creative Studio');
        console.error('Error loading Creative Studio:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHTML();
  }, []);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#050505',
        color: '#ff6b6b',
        fontFamily: 'monospace',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <h2>Error Loading Creative Studio</h2>
          <p>{error}</p>
          <p style={{ fontSize: '12px', marginTop: '20px', color: '#999' }}>
            Try refreshing the page or check that the wise2-creative-studio.html file exists in /public
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#050505'
      }}>
        <div style={{
          fontSize: '18px',
          color: '#39FF14',
          fontFamily: 'Orbitron, sans-serif'
        }}>
          Loading Creative Studio...
        </div>
      </div>
    );
  }

  // Render HTML in iframe using blob URL (safe, works with standalone)
  return (
    <iframe
      srcDoc={htmlContent}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        display: 'block'
      }}
      title="WISE² Creative Studio"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock"
    />
  );
}
