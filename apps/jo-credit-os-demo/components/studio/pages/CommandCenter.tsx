'use client';

import { useEffect, useState } from 'react';
import { characters, storyMilestones, type StoryMode, initializeStoryMode } from '@/lib/storyMode';

export default function CommandCenter() {
  const [storyMode, setStoryMode] = useState<StoryMode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load story mode from localStorage
    const saved = localStorage.getItem('wise2_story_mode');
    const story = saved ? JSON.parse(saved) : initializeStoryMode();
    setStoryMode(story);
    setLoading(false);
  }, []);

  if (loading || !storyMode) {
    return <div style={{ color: '#888', textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const currentMilestone = storyMilestones.find(m => m.id === storyMode.currentMilestone);
  const character = currentMilestone ? characters[currentMilestone.character as keyof typeof characters] : characters.daniel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Story Mode Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, ${character.color}15 0%, ${character.color}05 100%)`,
        border: `2px solid ${character.color}40`,
        borderRadius: '12px',
        padding: '24px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
      }}>
        <div style={{
          fontSize: '64px',
          minWidth: '80px',
          textAlign: 'center',
          animation: 'pulse 2s infinite',
        }}>
          {character.avatar}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '12px',
            color: character.color,
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '4px',
            fontWeight: 700,
          }}>
            {currentMilestone?.chapter || 'Welcome'}
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            marginBottom: '8px',
            color: '#fff',
          }}>
            {character.name} — {character.role}
          </div>
          <div style={{
            fontSize: '14px',
            color: '#ccc',
            lineHeight: '1.5',
            fontStyle: 'italic',
          }}>
            "{currentMilestone?.message || character.bio}"
          </div>
        </div>

        <div style={{ minWidth: '120px', textAlign: 'right' }}>
          <div style={{
            fontSize: '28px',
            fontWeight: 700,
            color: character.color,
            marginBottom: '4px',
          }}>
            {storyMode.progress}%
          </div>
          <div style={{
            width: '100px',
            height: '6px',
            background: '#1a1a1a',
            borderRadius: '3px',
            overflow: 'hidden',
            margin: '0 auto 8px',
          }}>
            <div style={{
              width: `${storyMode.progress}%`,
              height: '100%',
              background: character.color,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>Journey</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#39FF14', marginBottom: '4px' }}>
            {storyMode.lyricsGenerated}
          </div>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Lyrics Created</div>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#00D9FF', marginBottom: '4px' }}>
            {storyMode.projectsCreated}
          </div>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Projects Built</div>
        </div>

        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#e0a83c', marginBottom: '4px' }}>
            {storyMode.completedMilestones.length}
          </div>
          <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Milestones</div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div>
        <div style={{ fontSize: '13px', color: '#39FF14', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700 }}>
          Your Journey
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {storyMilestones.slice(0, 3).map((milestone, idx) => {
            const isCompleted = storyMode.completedMilestones.includes(milestone.id);
            const isCurrent = milestone.id === storyMode.currentMilestone;
            const char = characters[milestone.character as keyof typeof characters];

            return (
              <div key={idx} style={{
                background: isCurrent ? `${char.color}15` : isCompleted ? '#0f0f0f' : '#1a1a1a',
                border: `1px solid ${isCurrent ? char.color + '60' : isCompleted ? '#333' : '#2a2a2a'}`,
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                opacity: isCompleted ? 0.6 : 1,
              }}>
                <div style={{ fontSize: '20px' }}>{char.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: char.color }}>
                    {milestone.chapter}
                  </div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    {char.name} • {milestone.progress}% progress
                  </div>
                </div>
                <div style={{ fontSize: '14px' }}>
                  {isCompleted ? '✓' : isCurrent ? '→' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(57,255,20,.1) 0%, rgba(0,217,255,.1) 100%)',
        border: '1px solid rgba(57,255,20,.3)',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'center',
        color: '#ccc',
      }}>
        <div style={{ fontSize: '12px', marginBottom: '8px' }}>
          🚀 {currentMilestone?.message.split('.')[0] || 'Ready to create'}?
        </div>
        <div style={{ fontSize: '11px', color: '#888' }}>
          Head to Lyrics Lab to start your first song
        </div>
      </div>
    </div>
  );
}
