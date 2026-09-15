import { ChefHat, Clock, Users, Sparkles, MapPin, Award } from 'lucide-react'

const features = [
  {
    icon: ChefHat,
    title: 'Expert Culinary Team',
    description: 'Award-winning chefs and experienced staff dedicated to excellence in every detail.'
  },
  {
    icon: Sparkles,
    title: 'Premium Ingredients',
    description: 'Sourced locally and internationally for the finest flavors and nutritional value.'
  },
  {
    icon: Users,
    title: 'Personalized Service',
    description: 'Tailored menus and service designed specifically for your event and preferences.'
  },
  {
    icon: Clock,
    title: 'Seamless Execution',
    description: 'Professional coordination ensuring smooth service from start to finish.'
  },
  {
    icon: Award,
    title: 'Award-Winning Quality',
    description: 'Recognized excellence in culinary arts and event catering services.'
  },
  {
    icon: MapPin,
    title: 'Flexible Delivery',
    description: 'On-site catering at your venue or custom delivery to your location.'
  }
]

export default function Features() {
  return (
    <section id="experience" className="py-20 md:py-32 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">Why Choose Fergie's Kitchen</h2>
          <p className="text-lg text-charcoal/70 max-w-2xl mx-auto">
            We combine passion, expertise, and innovation to deliver exceptional culinary experiences.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="p-8 border border-sage/20 rounded-lg hover:shadow-lg transition">
                <Icon className="w-10 h-10 text-bronze mb-4" />
                <h3 className="text-xl font-semibold text-charcoal mb-2">{feature.title}</h3>
                <p className="text-charcoal/70">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
