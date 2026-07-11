'use client';

import { useState } from 'react';
import { Calendar, Send } from 'lucide-react';

export default function SchedulePage() {
  const [content, setContent] = useState('');
  const [platforms, setPlatforms] = useState<string[]>(['discord']);
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch('/api/admin/bots/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, platforms, scheduledTime }),
      });

      if (res.ok) {
        setSuccess(true);
        setContent('');
        setPlatforms(['discord']);
        setScheduledTime('');
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Error scheduling:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="section-heading mb-2">Schedule Announcement</h2>
        <p className="text-gray text-sm">Post announcements across Discord, Telegram, and social media</p>
      </div>

      <form onSubmit={handleSchedule} className="card space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray mb-2">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement... You can use markdown formatting."
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-neon-red focus:outline-none transition-colors"
            rows={6}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray mb-3">Platforms</label>
          <div className="space-y-2">
            {['discord', 'telegram', 'social'].map((platform) => (
              <label key={platform} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={platforms.includes(platform)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setPlatforms([...platforms, platform]);
                    } else {
                      setPlatforms(platforms.filter((p) => p !== platform));
                    }
                  }}
                  className="w-4 h-4 accent-neon-red"
                />
                <span className="text-gray capitalize">
                  {platform === 'social' ? 'Twitter / Instagram / LinkedIn' : platform}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray mb-2">Schedule Time (UTC)</label>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray" />
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-red focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {success && (
          <div className="bg-green-900 bg-opacity-20 border border-green-700 rounded-lg p-3 text-green-200 text-sm">
            ✅ Announcement scheduled successfully!
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !content || !scheduledTime || platforms.length === 0}
          className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Send size={18} />
          {loading ? 'Scheduling...' : 'Schedule Announcement'}
        </button>
      </form>
    </div>
  );
}
