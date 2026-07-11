'use client';

import { useEffect, useState } from 'react';
import { Share2, Users } from 'lucide-react';

interface LiveEvent {
  userName: string;
  action: string;
  timestamp: string;
}

interface Testimonial {
  name: string;
  quote: string;
  tier: string;
}

export default function SocialProof() {
  const [events, setEvents] = useState<LiveEvent[]>([]);

  const testimonials: Testimonial[] = [
    {
      name: 'John D.',
      quote: 'Best training I\'ve ever had. The personalized approach really made a difference in my confidence and technique.',
      tier: 'VIP'
    },
    {
      name: 'Sarah M.',
      quote: 'Professional, knowledgeable instructor who genuinely cares about student success. Highly recommend.',
      tier: 'Pro'
    },
    {
      name: 'Mike T.',
      quote: 'Finally found an instructor who explains the why behind every technique. Exceptional value.',
      tier: 'Starter'
    }
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/social/proof');
        const data = await response.json();
        setEvents(data.recentEvents || []);
      } catch (error) {
        console.error('Error fetching social proof:', error);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section className="bg-black py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-silver text-3xl text-center mb-12">What Students Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-silver font-semibold">{testimonial.name}</h3>
                  <span className="text-xs font-bold bg-neon-red text-black px-2 py-1 rounded">
                    {testimonial.tier}
                  </span>
                </div>
                <p className="text-gray italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {events.length > 0 && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-secondary-black border border-neon-red border-opacity-50 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="text-neon-red" size={16} />
            <h3 className="text-silver font-semibold text-sm">Live Activity</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.map((event, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-gray-muted">
                <Users size={12} className="text-neon-red mt-0.5 flex-shrink-0" />
                <div>
                  <p>
                    <span className="text-silver font-semibold">{event.userName}</span>
                    {' '}
                    <span>{event.action}</span>
                  </p>
                  <p className="text-gray-muted text-xs">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
