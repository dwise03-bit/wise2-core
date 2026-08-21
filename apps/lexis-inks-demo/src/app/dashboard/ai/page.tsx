'use client';

import Link from 'next/link';
import { useState } from 'react';

const suggestions = [
  {
    type: 'caption',
    title: 'Instagram Caption',
    content: '✨ NEW DROP ALERT ✨ Just finished a stunning batch of crystal-topped navy pens! Each one is uniquely crafted with love. DM us to customize yours! 💙 #handmadepens #customdesign #lexisinks',
  },
  {
    type: 'message',
    title: 'Customer Thank You',
    content: 'Hi Sarah! Thank you so much for choosing Lexi\'s Inks for your custom pens! We just started crafting your order and can\'t wait to show you the finished result. You\'re going to love them! 💙',
  },
  {
    type: 'description',
    title: 'Product Description',
    content: 'Our Crystal-Topped Pens are the perfect blend of elegance and functionality. Each pen is hand-crafted with premium materials and topped with stunning crystals that catch the light beautifully. Personalize with your name or message to make it truly yours!',
  },
  {
    type: 'followup',
    title: 'Follow-up Suggestion',
    content: 'Hi Mike! Just checking in to see how you\'re loving your custom pens! If you have any questions or need anything else, I\'m here to help. Would love to hear your thoughts! ✨',
  },
];

export default function AIPage() {
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="bg-navy min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/dashboard" className="text-cyan hover:text-cyan-glow mb-6 inline-block">← Back</Link>
        <h1 className="text-4xl font-bold mb-2">Lexi - AI Assistant</h1>
        <p className="text-silver-dark mb-8">Get AI-powered suggestions for captions, messages, and more</p>

        {/* Chat Interface */}
        <div className="bg-navy-light rounded-lg border border-navy-light overflow-hidden mb-8 flex flex-col" style={{ height: '400px' }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="bg-navy rounded-lg p-4 max-w-xs">
              <p className="text-silver-dark text-sm">Hey there! I'm Lexi, your WISE² AI assistant. How can I help you grow your custom pen business today?</p>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue rounded-lg p-4 max-w-xs text-right">
                <p className="text-sm">Can you write an Instagram caption for our new crystal pens?</p>
              </div>
            </div>
            <div className="bg-navy rounded-lg p-4 max-w-xs">
              <p className="text-silver-dark text-sm">Absolutely! Check out the Suggestions tab below for a fresh caption. Want me to adjust the tone or add something specific?</p>
            </div>
          </div>
          <div className="border-t border-navy-light p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Lexi anything..."
                className="flex-1 px-4 py-2 bg-navy rounded border border-navy-light focus:border-cyan outline-none text-white text-sm"
              />
              <button className="px-4 py-2 bg-blue hover:bg-blue-light rounded font-bold transition">Send</button>
            </div>
          </div>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-2 gap-6">
          {suggestions.map((suggestion, i) => (
            <div key={i} className="bg-navy-light rounded-lg p-6 border border-navy-light hover:border-cyan transition">
              <h3 className="font-bold text-cyan mb-3">{suggestion.title}</h3>
              <p className="text-sm text-silver-dark mb-4 line-clamp-4">{suggestion.content}</p>
              <button
                onClick={() => handleCopy(`${i}`, suggestion.content)}
                className="w-full px-4 py-2 bg-blue hover:bg-blue-light rounded text-sm font-bold transition"
              >
                {copied === `${i}` ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-cyan to-blue rounded-lg p-8 text-center text-navy">
          <div className="text-4xl mb-3">🚀</div>
          <h3 className="font-bold text-lg mb-2">Ready to scale your business?</h3>
          <p className="opacity-90 mb-4">Lexi can help you draft content, write customer messages, brainstorm product ideas, and automate your growth.</p>
          <button className="px-6 py-2 bg-navy hover:bg-navy-light rounded font-bold transition">
            Explore More Features
          </button>
        </div>
      </div>
    </main>
  );
}
