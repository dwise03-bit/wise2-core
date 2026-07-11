'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Send, MessageCircle, Zap } from 'lucide-react';

interface BotMessage {
  platform: 'discord' | 'telegram';
  message: string;
  recipient?: string;
}

export default function BotsControlPage() {
  const [activeTab, setActiveTab] = useState<'discord' | 'telegram'>('discord');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('');
  const [botStatus, setBotStatus] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/auth/login';
      return;
    }
    setToken(t);
    fetchBotStatus();
  }, []);

  const fetchBotStatus = async () => {
    try {
      const response = await fetch('/api/admin/bots/status');
      const data = await response.json();
      setBotStatus(data);
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !message.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/bots/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: activeTab,
          message: message.trim(),
          recipient: recipient.trim() || null,
        }),
      });

      if (response.ok) {
        setMessage('');
        setRecipient('');
        alert(`Message sent to ${activeTab}!`);
        fetchBotStatus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-black min-h-screen">
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-w2.png" alt="Wise Defense" width={160} height={50} className="h-12 w-auto" />
          </Link>
          <h1 className="heading-silver text-xl">Hermes Bot Control Panel</h1>
          <Link href="/dashboard" className="text-gray hover:text-neon-red">Dashboard</Link>
        </div>
      </header>

      <section className="bg-black py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="section-heading text-center mb-12">Bot Management & Messaging</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Bot Status Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <MessageCircle className="text-neon-red" size={24} />
                  <h3 className="heading-silver">Discord Bot</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray">
                    Status: <span className="text-neon-red font-bold">
                      {botStatus.discord?.online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </p>
                  <p className="text-gray">
                    Uptime: <span className="text-silver">{botStatus.discord?.uptime || 'N/A'}</span>
                  </p>
                  <p className="text-gray">
                    Messages Sent: <span className="text-silver">{botStatus.discord?.messages_sent || 0}</span>
                  </p>
                  <p className="text-gray-muted text-xs mt-4">
                    Posts reminders, tips, and announcements to Discord channels
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <Send className="text-neon-red" size={24} />
                  <h3 className="heading-silver">Telegram Bot</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray">
                    Status: <span className="text-neon-red font-bold">
                      {botStatus.telegram?.online ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </p>
                  <p className="text-gray">
                    Uptime: <span className="text-silver">{botStatus.telegram?.uptime || 'N/A'}</span>
                  </p>
                  <p className="text-gray">
                    Messages Sent: <span className="text-silver">{botStatus.telegram?.messages_sent || 0}</span>
                  </p>
                  <p className="text-gray-muted text-xs mt-4">
                    Sends reminders and tips via Telegram to individual users
                  </p>
                </div>
              </div>
            </div>

            {/* Message Sender */}
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="heading-silver mb-6">Send Message via Hermes</h3>

                {/* Tab Selector */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab('discord')}
                    className={`px-4 py-2 rounded font-semibold transition-all ${
                      activeTab === 'discord'
                        ? 'bg-neon-red text-black'
                        : 'bg-secondary-black text-gray border-2 border-neon-red'
                    }`}
                  >
                    Discord
                  </button>
                  <button
                    onClick={() => setActiveTab('telegram')}
                    className={`px-4 py-2 rounded font-semibold transition-all ${
                      activeTab === 'telegram'
                        ? 'bg-neon-red text-black'
                        : 'bg-secondary-black text-gray border-2 border-neon-red'
                    }`}
                  >
                    Telegram
                  </button>
                </div>

                {/* Message Form */}
                <form onSubmit={handleSendMessage} className="space-y-4">
                  {activeTab === 'telegram' && (
                    <div>
                      <label className="text-silver block mb-2">User Telegram ID</label>
                      <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter Telegram chat ID (optional for broadcast)"
                        className="w-full"
                      />
                      <p className="text-gray-muted text-sm mt-1">
                        Leave blank to send to all subscribed users
                      </p>
                    </div>
                  )}

                  {activeTab === 'discord' && (
                    <div>
                      <label className="text-silver block mb-2">Channel</label>
                      <select className="w-full">
                        <option>Announcements (#announcements)</option>
                        <option>Training Tips (#training-tips)</option>
                        <option>General (#general)</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-silver block mb-2">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Type your ${activeTab} message here...`}
                      rows={6}
                      className="w-full"
                    />
                    <p className="text-gray-muted text-sm mt-2">
                      {activeTab === 'discord' && 'Supports Discord markdown formatting'}
                      {activeTab === 'telegram' && 'Supports Telegram formatting (bold, italic, code)'}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'Sending...' : `Send to ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
                  </button>
                </form>
              </div>

              {/* Scheduled Tasks */}
              <div className="card mt-6">
                <h3 className="heading-silver mb-4 flex items-center gap-2">
                  <Zap className="text-neon-red" size={20} />
                  Scheduled Tasks
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="border-l-4 border-neon-red pl-3 py-2">
                    <p className="text-silver font-semibold">Discord: Session Reminders</p>
                    <p className="text-gray">Every hour - Sends upcoming session reminders</p>
                  </div>
                  <div className="border-l-4 border-neon-red pl-3 py-2">
                    <p className="text-silver font-semibold">Discord: Training Tips</p>
                    <p className="text-gray">Every Monday 8:00 AM - Posts training tips</p>
                  </div>
                  <div className="border-l-4 border-neon-red pl-3 py-2">
                    <p className="text-silver font-semibold">Telegram: Daily Tips</p>
                    <p className="text-gray">Every day 7:00 AM - Sends daily training tips</p>
                  </div>
                  <div className="border-l-4 border-neon-red pl-3 py-2">
                    <p className="text-silver font-semibold">Telegram: Weekly Summary</p>
                    <p className="text-gray">Every Sunday 6:00 PM - Sends progress summary</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
