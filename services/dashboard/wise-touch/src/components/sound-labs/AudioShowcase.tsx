'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Volume2 } from 'lucide-react'

interface Track {
  id: string
  title: string
  category: string
  duration: string
}

const demoTracks: Track[] = [
  { id: '1', title: 'Brand Anthem Example 1', category: 'Brand Anthem', duration: 'Demo coming soon' },
  { id: '2', title: 'Jingle Example 1', category: 'Jingle', duration: 'Demo coming soon' },
  { id: '3', title: 'Event Song Example 1', category: 'Event Song', duration: 'Demo coming soon' },
  { id: '4', title: 'Artist Package Example 1', category: 'Artist Package', duration: 'Demo coming soon' },
  { id: '5', title: 'Sonic Logo Example 1', category: 'Sonic Logo', duration: 'Demo coming soon' },
]

const categories = ['All', 'Brand Anthem', 'Jingle', 'Event Song', 'Artist Package', 'Sonic Logo']

export function AudioShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [playing, setPlaying] = useState<string | null>(null)

  const filteredTracks = selectedCategory === 'All'
    ? demoTracks
    : demoTracks.filter(t => t.category === selectedCategory)

  return (
    <section id="showcase" className="py-20 md:py-32 px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Listen & Explore
          </h2>
          <p className="text-chrome-dark text-lg max-w-2xl mx-auto">
            Hear the range of styles we create. Filter by category to find your sound.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded font-mono text-sm transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-blue-electric text-bg-primary border border-blue-electric'
                  : 'bg-transparent border border-blue-electric/30 text-chrome-light hover:border-blue-electric/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Tracks Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTracks.map((track, index) => (
            <motion.div
              key={track.id}
              className="hud-panel-glass p-6 rounded-lg group cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-blue-electric-light mb-1">{track.category}</p>
                  <h3 className="text-lg font-bold text-chrome-light mb-2">{track.title}</h3>
                  <p className="text-sm text-chrome-dark">{track.duration}</p>
                </div>
                <button
                  onClick={() => setPlaying(playing === track.id ? null : track.id)}
                  className="ml-4 p-3 rounded-full bg-blue-electric/20 hover:bg-blue-electric/40 border border-blue-electric/50 text-blue-electric-light transition-all duration-300 flex-shrink-0"
                  disabled={track.duration === 'Demo coming soon'}
                >
                  {playing === track.id ? (
                    <Pause size={20} />
                  ) : (
                    <Play size={20} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
              {track.duration === 'Demo coming soon' && (
                <div className="mt-4 p-3 rounded bg-chrome-dark/10 border border-chrome-dark/20 text-xs text-chrome-dark text-center font-mono">
                  Audio files coming soon — real demos will replace this placeholder
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State Note */}
        {filteredTracks.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-chrome-dark">No demos in this category yet.</p>
          </motion.div>
        )}

        {/* Info Banner */}
        <motion.div
          className="mt-12 p-6 hud-panel-accent rounded-lg text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Volume2 className="inline-block mb-3 text-blue-electric-light" size={24} />
          <p className="text-chrome-light">
            <strong>Real demos are coming.</strong> For now, these are placeholders showing where audio will live.
            <br />
            Start your project to hear the full range of what we can create for your brand.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
