'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RootPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          router.push('/studio');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #000 0%, #0a0a0a 50%, #050505 100%)',
      color: '#fff',
      fontFamily: '"Rajdhani", sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid effect */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '60px',
        maxWidth: '1200px',
        width: '100%',
        padding: '40px',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Left: Profile & Branding */}
        <div style={{ textAlign: 'left' }}>
          <div style={{
            marginBottom: '30px',
            padding: '20px',
            borderLeft: '3px solid #39FF14',
          }}>
            <h1 style={{
              fontSize: '48px',
              margin: '0 0 10px 0',
              color: '#39FF14',
              fontWeight: 900,
              letterSpacing: '-1px',
            }}>
              WISE²
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#888',
              margin: '0 0 20px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}>
              AI-Native Business Operating System
            </p>
          </div>

          <div style={{ marginBottom: '40px' }}>
            <h2 style={{
              fontSize: '32px',
              color: '#fff',
              margin: '0 0 15px 0',
              fontWeight: 700,
            }}>
              Creative Studio
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#aaa',
              lineHeight: '1.8',
              margin: '0 0 20px 0',
            }}>
              Professional AI-native creative suite with integrated modules for audio production, live streaming, voice synthesis, content generation, and analytics.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '30px',
          }}>
            {[
              { label: 'Sound Lab', desc: 'Professional audio' },
              { label: 'Live Studio', desc: 'Stream control' },
              { label: 'Voice Lab', desc: 'Voice synthesis' },
              { label: 'Content Factory', desc: 'Generation' },
            ].map((item) => (
              <div key={item.label} style={{
                padding: '15px',
                background: 'rgba(57, 255, 20, 0.05)',
                border: '1px solid rgba(57, 255, 20, 0.2)',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '12px', color: '#39FF14', fontWeight: 600 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <Link href="/studio" style={{
              padding: '12px 32px',
              background: '#39FF14',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 255, 20, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Enter Studio
            </Link>
            <div style={{
              padding: '12px 32px',
              background: 'transparent',
              border: '1px solid rgba(57, 255, 20, 0.4)',
              color: '#39FF14',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              textAlign: 'center',
            }}>
              Auto-redirect in {countdown}s
            </div>
          </div>
        </div>

        {/* Right: Daniel Profile */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '9 / 12',
            background: 'linear-gradient(135deg, rgba(57,255,20,0.1), rgba(57,255,20,0.05))',
            border: '2px solid rgba(57, 255, 20, 0.3)',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(57, 255, 20, 0.2), inset 0 0 40px rgba(57, 255, 20, 0.05)',
          }}>
            <img src="/daniel-wise2.jpg" alt="Daniel - WISE² Founder" style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
              pointerEvents: 'none',
            }} />
          </div>

          <div style={{
            textAlign: 'center',
            padding: '20px',
            borderTop: '1px solid rgba(57, 255, 20, 0.2)',
            width: '100%',
          }}>
            <h3 style={{
              fontSize: '20px',
              color: '#39FF14',
              margin: '0 0 5px 0',
              fontWeight: 700,
            }}>
              Daniel Wise
            </h3>
            <p style={{
              fontSize: '13px',
              color: '#888',
              margin: '0 0 15px 0',
            }}>
              Founder & Lead Architect
            </p>
            <p style={{
              fontSize: '12px',
              color: '#aaa',
              lineHeight: '1.6',
              margin: '0',
            }}>
              Building AI-native business systems that unify cloud, edge, and desktop experiences into one seamless operating system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
