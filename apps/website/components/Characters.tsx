'use client';

import { ReactNode } from 'react';

interface CharacterProps {
  name: string;
  role: string;
  avatar: ReactNode;
  color: string;
  bio: string;
  expertise: string[];
}

export const DanielAvatar = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="daniel-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#39FF14" />
        <stop offset="100%" stopColor="#00D9FF" />
      </linearGradient>
    </defs>
    {/* Head */}
    <circle cx="100" cy="70" r="35" fill="url(#daniel-grad)" />
    {/* Headphones */}
    <path d="M 70 60 Q 70 45 100 45 Q 130 45 130 60" stroke="#39FF14" strokeWidth="3" fill="none" />
    <circle cx="70" cy="70" r="8" fill="#39FF14" />
    <circle cx="130" cy="70" r="8" fill="#39FF14" />
    {/* Body */}
    <rect x="75" y="110" width="50" height="60" fill="url(#daniel-grad)" rx="5" />
    {/* Tech lines */}
    <line x1="85" y1="120" x2="115" y2="120" stroke="#00D9FF" strokeWidth="2" />
    <line x1="85" y1="135" x2="115" y2="135" stroke="#00D9FF" strokeWidth="2" />
    <line x1="85" y1="150" x2="115" y2="150" stroke="#00D9FF" strokeWidth="2" />
    {/* Aura */}
    <circle cx="100" cy="100" r="55" fill="none" stroke="#39FF14" strokeWidth="1" opacity="0.3" />
  </svg>
);

export const DarrenAvatar = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
    <defs>
      <linearGradient id="darren-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D9FF" />
        <stop offset="100%" stopColor="#e0a83c" />
      </linearGradient>
    </defs>
    {/* Head */}
    <circle cx="100" cy="70" r="35" fill="url(#darren-grad)" />
    {/* Hair/Crown */}
    <path d="M 70 50 Q 75 35 100 35 Q 125 35 130 50" fill="#e0a83c" />
    {/* Eyes glow */}
    <circle cx="90" cy="65" r="4" fill="#00D9FF" />
    <circle cx="110" cy="65" r="4" fill="#00D9FF" />
    {/* Mouth smile */}
    <path d="M 90 80 Q 100 85 110 80" stroke="#e0a83c" strokeWidth="2" fill="none" />
    {/* Body */}
    <rect x="75" y="110" width="50" height="60" fill="url(#darren-grad)" rx="5" />
    {/* Creative marks */}
    <circle cx="85" cy="125" r="3" fill="#00D9FF" />
    <circle cx="100" cy="120" r="3" fill="#00D9FF" />
    <circle cx="115" cy="128" r="3" fill="#00D9FF" />
    {/* Aura */}
    <circle cx="100" cy="100" r="55" fill="none" stroke="#00D9FF" strokeWidth="1" opacity="0.3" />
  </svg>
);

export const CharacterCard: React.FC<CharacterProps> = ({
  name,
  role,
  avatar,
  color,
  bio,
  expertise,
}) => (
  <div
    style={{
      background: `linear-gradient(135deg, ${color}15 0%, transparent 100%)`,
      border: `2px solid ${color}40`,
      borderRadius: '16px',
      padding: '24px',
      textAlign: 'center',
      transition: 'all 0.3s',
    }}
  >
    <div
      style={{
        width: '120px',
        height: '120px',
        margin: '0 auto 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `${color}10`,
        borderRadius: '50%',
        border: `2px solid ${color}40`,
      }}
    >
      {avatar}
    </div>

    <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
      {name}
    </h3>
    <p style={{ color, fontWeight: 600, marginBottom: '12px', fontSize: '14px' }}>
      {role}
    </p>

    <p style={{ color: '#ccc', fontSize: '14px', marginBottom: '16px', lineHeight: 1.6 }}>
      {bio}
    </p>

    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
      {expertise.map((exp, i) => (
        <span
          key={i}
          style={{
            padding: '6px 12px',
            background: `${color}20`,
            color,
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          {exp}
        </span>
      ))}
    </div>
  </div>
);

export const characters = {
  daniel: {
    name: 'Daniel',
    role: 'Audio Architect',
    avatar: DanielAvatar,
    color: '#39FF14',
    bio: 'Master of sonic branding and production. Creates audio signatures that define brand identity.',
    expertise: ['Sound Design', 'Mixing', 'Mastering'],
  },
  darren: {
    name: 'Darren',
    role: 'Creative Director',
    avatar: DarrenAvatar,
    color: '#00D9FF',
    bio: 'Storyteller and visionary. Crafts compelling narratives and lyrics that resonate.',
    expertise: ['Lyrics', 'Narrative', 'Direction'],
  },
};
