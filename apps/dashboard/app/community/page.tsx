'use client';

import { useState } from 'react';

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <div className="min-h-screen bg-black p-lg">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold mb-lg">Community</h1>

        {/* Tabs */}
        <div className="flex gap-md mb-lg border-b border-chrome/20">
          {['leaderboard', 'events', 'creators', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-lg py-md font-semibold capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-400 hover:text-chrome'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {[
              { rank: 1, name: 'SonicArtist', points: 15250, badge: '🥇' },
              { rank: 2, name: 'BeatMaker', points: 12840, badge: '🥈' },
              { rank: 3, name: 'MusicWizard', points: 11230, badge: '🥉' },
              { rank: 4, name: 'ProducerX', points: 9875, badge: '⭐' },
            ].map((user) => (
              <div key={user.rank} className="bg-gray-900 rounded-lg border border-chrome/20 p-md">
                <div className="flex items-center gap-md">
                  <span className="text-3xl">{user.badge}</span>
                  <div className="flex-1">
                    <p className="font-bold">{user.name}</p>
                    <p className="text-gray-500">#{user.rank}</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-500">{user.points}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Events */}
        {activeTab === 'events' && (
          <div className="space-y-md">
            {[
              { name: 'Sound Design Challenge', date: 'July 15-22', users: 234 },
              { name: 'Remix Battle', date: 'July 22-29', users: 156 },
            ].map((event, i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-chrome/20 p-md">
                <h3 className="font-bold mb-md">{event.name}</h3>
                <p className="text-gray-400 text-sm">
                  {event.date} • {event.users} participants
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
