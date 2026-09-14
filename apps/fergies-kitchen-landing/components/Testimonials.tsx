import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Mitchell',
    event: 'Corporate Gala',
    quote: 'Fergie\'s Kitchen transformed our corporate event into a culinary masterpiece. Every detail was perfect.',
    rating: 5
  },
  {
    name: 'James Chen',
    event: 'Wedding Reception',
    quote: 'The team made our wedding day even more special with their thoughtfulness and exceptional food quality.',
    rating: 5
  },
  {
    name: 'Rebecca Anderson',
    event: 'Private Celebration',
    quote: 'Outstanding service and phenomenal cuisine. Our guests are still talking about the experience.',
    rating: 5
  }
]

export default function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-sage/5">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Client Stories</h2>
          <p className="text-lg text-charcoal/70">Hear from our satisfied clients and partners</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div key={i} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-bronze text-bronze" />
                ))}
              </div>
              <p className="text-charcoal/80 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-charcoal">{testimonial.name}</p>
                <p className="text-sm text-sage">{testimonial.event}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
