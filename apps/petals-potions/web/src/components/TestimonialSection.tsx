'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    id: 1,
    quote: 'Petals & Potions completely transformed my evening ritual. I feel calm, centered, and connected.',
    author: 'Sarah',
    role: 'Wellness Enthusiast',
  },
  {
    id: 2,
    quote: 'The personalization is incredible. It feels like Paige created this blend just for me.',
    author: 'Maya',
    role: 'Monthly Subscriber',
  },
  {
    id: 3,
    quote: 'More than just tea. It\'s a moment of self-care that I look forward to every single day.',
    author: 'Jordan',
    role: 'Ritual Member',
  },
]

export default function TestimonialSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  return (
    <section className="section-container bg-gradient-to-b from-pp-navy to-pp-midnight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mb-4">
          <span className="text-pp-gold">Community Voices</span>
        </h2>
        <p className="text-pp-cream/70 font-serif-display">
          Real experiences from our Petals & Potions community.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            variants={itemVariants}
            className="card-luxury"
          >
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-pp-gold text-lg">
                  ★
                </span>
              ))}
            </div>

            <p className="text-pp-cream/90 font-serif-display italic mb-6 leading-relaxed">
              "{testimonial.quote}"
            </p>

            <div className="border-t border-pp-gold/20 pt-4">
              <p className="font-serif-header font-bold text-pp-gold text-sm">{testimonial.author}</p>
              <p className="text-pp-cream/60 font-serif-display text-xs">{testimonial.role}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
