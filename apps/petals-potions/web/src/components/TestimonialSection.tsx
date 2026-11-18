'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    text: "Petals & Potions has transformed my evening routine. The Sleep Serum is pure magic.",
    author: "Sarah M.",
    rating: 5,
  },
  {
    text: "The quality is exceptional. Every blend feels like a luxury experience.",
    author: "Jessica L.",
    rating: 5,
  },
  {
    text: "I love supporting a brand that truly cares about wellness and sustainability.",
    author: "Emma W.",
    rating: 5,
  },
]

export default function TestimonialSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-cream to-white px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-serif text-center text-purple mb-4"
        >
          Loved by Our Community
        </motion.h2>

        <div className="divider-gold text-center" />

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="card-luxury"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-gold text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              <p className="font-semibold text-purple">— {testimonial.author}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
