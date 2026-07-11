'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import BookingCalendar from '@/components/BookingCalendar';
import { Calendar, Clock, User } from 'lucide-react';

interface AvailableSession {
  id: number;
  date: string;
  time: string;
  type: string;
  title: string;
  student_ids: number[];
  status: string;
}

export default function BookingPage() {
  const [booked, setBooked] = useState<number[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    setToken(t);
  }, []);

  const handleSessionBooked = (session: AvailableSession) => {
    const t = localStorage.getItem('token');
    if (!t) {
      window.location.href = '/auth/login';
      return;
    }
    setBooked([...booked, session.id]);
  };

  return (
    <main className="bg-black min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Wise Defense
          </Link>
          <div className="flex items-center gap-8">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">
              Home
            </Link>
            <Link href="/pricing" className="text-gray-400 hover:text-white text-sm">
              Pricing
            </Link>
            <Link href="/community" className="text-gray-400 hover:text-white text-sm">
              Community
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-800">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
            <Calendar className="w-10 h-10 text-red-600" />
            Book Your Training Session
          </h1>
          <p className="text-lg text-gray-400">
            Schedule a 1-on-1 session with your instructor at a time that works for you.
          </p>
        </div>
      </section>

      {/* Booking Calendar */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-2xl mx-auto">
          <div className="card">
            <BookingCalendar onSessionBooked={handleSessionBooked} />
          </div>

          {booked.length > 0 && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-600"></div>
                <h3 className="text-lg font-semibold text-green-900">Sessions Booked!</h3>
              </div>
              <p className="text-green-700">
                You have {booked.length} training session{booked.length !== 1 ? 's' : ''} scheduled. Check your email for confirmation details.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* What to Expect */}
      <section className="py-24 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-16 text-center">
            What to Expect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Flexible Scheduling</h3>
              <p className="text-gray-400">
                Book sessions around your schedule with flexible time slots available throughout the week.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">1-on-1 Coaching</h3>
              <p className="text-gray-400">
                Personalized instruction tailored to your skill level, goals, and learning pace.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
              <p className="text-gray-400">
                Track your progress and build a personalized training plan based on your results.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
