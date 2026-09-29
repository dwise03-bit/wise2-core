'use client';

import { useState } from 'react';
import styles from './trader-3d.module.css';

interface Trader {
  id: string;
  name: string;
  avatar: string;
  winRate: number;
  monthlyReturn: number;
  followers: number;
  speciality: string;
  isFollowed: boolean;
  trades30d: number;
  avgWin: number;
}

const TOP_TRADERS: Trader[] = [
  { id: '1', name: 'TrendMaster', avatar: '📈', winRate: 68, monthlyReturn: 24.5, followers: 12450, speciality: 'Tech Stocks', isFollowed: false, trades30d: 145, avgWin: 3.2 },
  { id: '2', name: 'ValueHunter', avatar: '🎯', winRate: 62, monthlyReturn: 18.3, followers: 8920, speciality: 'Value Plays', isFollowed: false, trades30d: 89, avgWin: 2.8 },
  { id: '3', name: 'SwingKing', avatar: '🔄', winRate: 71, monthlyReturn: 31.2, followers: 15680, speciality: 'Swing Trading', isFollowed: false, trades30d: 203, avgWin: 4.1 },
  { id: '4', name: 'DayTraderPro', avatar: '⚡', winRate: 58, monthlyReturn: 15.7, followers: 6230, speciality: 'Day Trading', isFollowed: false, trades30d: 312, avgWin: 1.9 },
  { id: '5', name: 'CryptoNinja', avatar: '🚀', winRate: 65, monthlyReturn: 42.8, followers: 19540, speciality: 'Crypto', isFollowed: false, trades30d: 178, avgWin: 5.3 },
];

export default function FollowTrader() {
  const [traders, setTraders] = useState<Trader[]>(TOP_TRADERS);
  const [followed, setFollowed] = useState<string[]>([]);
  const [copying, setCopying] = useState<string | null>(null);

  const toggleFollow = (traderId: string) => {
    setFollowed(prev =>
      prev.includes(traderId) ? prev.filter(id => id !== traderId) : [...prev, traderId]
    );
  };

  const copyTrades = (traderId: string) => {
    setCopying(traderId);
    setTimeout(() => setCopying(null), 1500);
  };

  return (
    <article className={styles.premiumPanel} style={{ marginTop: 14 }}>
      <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
        👥 FOLLOW TOP TRADERS
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {traders.map(trader => (
          <div
            key={trader.id}
            style={{
              padding: '14px',
              borderRadius: '16px',
              background: 'rgba(12, 126, 216, 0.2)',
              border: '1px solid rgba(0, 217, 255, 0.25)',
              transition: 'all 200ms ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'perspective(800px) scale(1.02) rotateX(2deg)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 0 30px rgba(0, 217, 255, 0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: '32px' }}>{trader.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#f4f8ff', fontSize: '14px' }}>
                  {trader.name}
                </div>
                <div style={{ fontSize: '11px', color: '#7a9fb5' }}>
                  {trader.speciality}
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#7a9fb5', textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#00ff7f' }}>{trader.followers.toLocaleString()}</div>
                <div>followers</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ padding: 8, background: 'rgba(0, 255, 127, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#7a9fb5' }}>Win Rate</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#00ff7f' }}>
                  {trader.winRate}%
                </div>
              </div>
              <div style={{ padding: 8, background: 'rgba(0, 217, 255, 0.1)', borderRadius: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#7a9fb5' }}>Monthly</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#00D9FF' }}>
                  +{trader.monthlyReturn.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Extra Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 12, fontSize: '11px' }}>
              <div style={{ color: '#7a9fb5' }}>
                <div>Trades (30d)</div>
                <div style={{ color: '#d4e3f7', fontWeight: 600 }}>{trader.trades30d}</div>
              </div>
              <div style={{ color: '#7a9fb5', textAlign: 'right' }}>
                <div>Avg Win</div>
                <div style={{ color: '#d4e3f7', fontWeight: 600 }}>+{trader.avgWin}%</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                onClick={() => toggleFollow(trader.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: followed.includes(trader.id) ? 'none' : '1px solid rgba(0, 217, 255, 0.4)',
                  background: followed.includes(trader.id) ? 'rgba(0, 255, 127, 0.3)' : 'rgba(12, 126, 216, 0.2)',
                  color: followed.includes(trader.id) ? '#00ff7f' : '#00D9FF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                {followed.includes(trader.id) ? '✓ Following' : '+ Follow'}
              </button>
              <button
                onClick={() => copyTrades(trader.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(32, 125, 249, 0.4)',
                  background: copying === trader.id ? 'rgba(32, 125, 249, 0.4)' : 'linear-gradient(135deg, rgba(32, 125, 249, 0.2), rgba(0, 217, 255, 0.2))',
                  color: '#60a5fa',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                }}
              >
                {copying === trader.id ? '✓ Copying' : '📋 Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* My Followers */}
      {followed.length > 0 && (
        <div style={{ marginTop: 20, padding: 14, background: 'rgba(0, 255, 127, 0.05)', borderRadius: 14, border: '1px solid rgba(0, 255, 127, 0.2)' }}>
          <div style={{ fontSize: '12px', color: '#7a9fb5', marginBottom: 8 }}>
            Following {followed.length} trader{followed.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {traders
              .filter(t => followed.includes(t.id))
              .map(t => (
                <div
                  key={t.id}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'rgba(0, 255, 127, 0.15)',
                    fontSize: '11px',
                    color: '#00ff7f',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span>{t.avatar}</span> {t.name}
                </div>
              ))}
          </div>
        </div>
      )}
    </article>
  );
}
