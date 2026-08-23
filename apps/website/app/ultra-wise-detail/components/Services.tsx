'use client';

import { motion } from 'framer-motion';
import { Shield, Droplets, Sparkles, Zap, Wand2, Wind, Plus } from 'lucide-react';

const services = [
  {
    id: 1,
    title: 'EXPRESS REFRESH',
    description: 'Quick exterior clean to keep your car looking its best.',
    icon: Wind,
  },
  {
    id: 2,
    title: 'INTERIOR RESET',
    description: 'Refresh & sanitize your interior for a clean, comfortable ride.',
    icon: Sparkles,
  },
  {
    id: 3,
    title: 'FULL DETAIL',
    description: 'Interior & exterior detailing for a showroom finish.',
    icon: Wand2,
  },
  {
    id: 4,
    title: 'PAINT ENHANCEMENT',
    description: 'Remove swirl marks & bring back depth, gloss & clarity.',
    icon: Zap,
  },
  {
    id: 5,
    title: 'CERAMIC PROTECTION',
    description: 'Long-lasting protection with hydrophobic ceramic coatings.',
    icon: Shield,
  },
  {
    id: 6,
    title: 'DEEP INTERIOR RECOVERY',
    description: 'Deep clean, stain removal & odor elimination.',
    icon: Droplets,
  },
  {
    id: 7,
    title: 'ADD-ONS',
    description: 'Headlight restoration, engine bay cleaning, pet hair removal & more.',
    icon: Plus,
  },
];

export function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black font-bebas mb-4">
            <span className="text-white">OUR </span>
            <span className="text-blue-500">SERVICES</span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {services.map((service, index) => {
            const Icon = service.icon;
            const isInteriorService = service.id === 2 || service.id === 6;

            return (
              <motion.div
                key={service.id}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative"
              >
                <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-800 group-hover:border-orange-500 rounded overflow-hidden transition-all duration-300 h-full p-6 flex flex-col">
                  {/* Icon Container or Image */}
                  <div className="mb-6">
                    {isInteriorService ? (
                      <div className="w-full h-24 rounded overflow-hidden border border-blue-500/30 group-hover:border-orange-500 transition-colors">
                        <img
                          src="/images/ultra-wise-detail/genesis-interior.jpg"
                          alt="Premium vehicle interior"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-orange-500/20 flex items-center justify-center border border-blue-500/50 group-hover:border-orange-500 transition-colors">
                        <Icon className="w-7 h-7 text-blue-500 group-hover:text-orange-500 transition-colors" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-black text-white mb-3 group-hover:text-orange-500 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-400 flex-grow">
                    {service.description}
                  </p>

                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-blue-500/0 group-hover:from-orange-500/10 group-hover:to-blue-500/10 transition-all duration-300 pointer-events-none" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Accent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-block px-8 py-3 bg-blue-500/10 border border-blue-500/30 rounded">
            <p className="text-sm text-blue-400">
              All services include professional-grade products & expert application
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
