'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Calendar, TrendingUp, Award, Settings } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  tier: string;
}

interface Session {
  id: number;
  date: string;
  time: string;
  type: string;
}

interface Progress {
  total_drills: number;
  completed_drills: number;
  quiz_score: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    setUser({
      id: 1,
      email: 'student@example.com',
      name: 'John Doe',
      tier: 'pro',
    });

    fetch('/api/sessions/user', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSessions(data));

    fetch('/api/students/progress', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setProgress(data))
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-400">Not authenticated</div>;

  const drillPercentage = progress ? (progress.completed_drills / progress.total_drills) * 100 : 0;

  return (
    <main className="bg-gray-900 min-h-screen">
      {/* Header */}
      <header className="bg-black border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wise Defense
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="bg-black border-b border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, {user.name}!
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
              {user.tier.toUpperCase()} Plan
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Card */}
            {progress && (
              <div className="bg-black rounded-2xl p-8 border border-gray-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Your Progress</h2>
                  <TrendingUp className="w-6 h-6 text-red-600" />
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">Drills Completed</span>
                      <span className="text-sm font-semibold text-white">
                        {progress.completed_drills} of {progress.total_drills}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-red-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${drillPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Quiz Score</span>
                      <span className="text-lg font-bold text-white">{progress.quiz_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Sessions */}
            <div className="bg-black rounded-2xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Upcoming Sessions</h2>
                <Calendar className="w-6 h-6 text-red-600" />
              </div>

              {sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                      <div>
                        <p className="font-semibold text-white">{session.type}</p>
                        <p className="text-sm text-gray-400">{session.date} at {session.time}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No sessions scheduled yet</p>
                  <Link href="/booking">
                    <button className="btn-primary">Book Your First Session</button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-black rounded-2xl p-6 border border-gray-800">
              <h3 className="font-semibold text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Total Sessions</p>
                  <p className="text-3xl font-bold text-white">{sessions.length}</p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Current Streak</p>
                  <p className="text-3xl font-bold text-white">7 days</p>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Achievements</p>
                  <p className="text-3xl font-bold text-white">3</p>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200">
              <Award className="w-8 h-8 text-red-600 mb-4" />
              <h3 className="font-semibold text-white mb-2">Ready to Level Up?</h3>
              <p className="text-sm text-gray-300 mb-4">
                Upgrade to VIP for unlimited 1-on-1 coaching and personalized training plans.
              </p>
              <Link href="/pricing">
                <button className="w-full bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors">
                  View Plans
                </button>
              </Link>
            </div>

            {/* Account Settings */}
            <Link href="/profile" className="block">
              <div className="bg-black rounded-2xl p-6 border border-gray-800 hover:border-red-300 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-white">Account Settings</p>
                    <p className="text-xs text-gray-400">Manage your profile</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
