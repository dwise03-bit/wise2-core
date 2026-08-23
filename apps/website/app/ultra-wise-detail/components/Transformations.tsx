'use client';

import { motion } from 'framer-motion';

const transformations = [
  {
    id: 1,
    title: 'WHITE SEDAN DETAIL',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER',
  },
  {
    id: 2,
    title: 'BLUE SPORTS CAR DETAIL',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER',
  },
  {
    id: 3,
    title: 'HEADLIGHT RESTORATION',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER',
  },
  {
    id: 4,
    title: 'PAINT CORRECTION',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER',
  },
];

export function Transformations() {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-b from-black to-slate-900 overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black font-bebas text-white">
            TRANSFORMATIONS
          </h2>
        </motion.div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {transformations.map((item, index) => {
            // Use real before/after images for first transformation (Genesis exterior)
            const hasRealImages = index === 0;
            const beforeImage = hasRealImages ? '/images/ultra-wise-detail/genesis-exterior.jpg' : null;
            const afterImage = hasRealImages ? '/images/ultra-wise-detail/genesis-exterior.jpg' : null;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div className="relative bg-black border-2 border-gray-800 group-hover:border-orange-500 rounded overflow-hidden transition-all duration-300">
                  {/* Before/After Container */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-900 to-black flex overflow-hidden">
                    {hasRealImages ? (
                      <>
                        {/* Real Before Image */}
                        <div className="absolute left-0 top-0 w-1/2 h-full overflow-hidden">
                          <img
                            src={beforeImage}
                            alt="Before detailing"
                            className="w-full h-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 bg-black/30" />
                        </div>

                        {/* Real After Image */}
                        <div className="absolute right-0 top-0 w-1/2 h-full overflow-hidden">
                          <img
                            src={afterImage}
                            alt="After detailing"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Placeholder Before Half */}
                        <div className="absolute left-0 top-0 w-1/2 h-full flex items-center justify-center bg-gray-900/50">
                          <div className="text-center">
                            <div className="text-4xl mb-2">↔</div>
                            <p className="text-xs text-gray-500">Before</p>
                          </div>
                        </div>

                        {/* Placeholder After Half */}
                        <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center bg-gray-800/50">
                          <div className="text-center">
                            <div className="text-4xl mb-2">✨</div>
                            <p className="text-xs text-gray-500">After</p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Vertical Divider */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-50 z-10" />
                  </div>

                  {/* Title */}
                  <div className="p-4 bg-black/80 border-t border-gray-800 group-hover:border-orange-500/50 transition-colors">
                    <p className="text-sm font-black text-blue-500">
                      {item.title}
                    </p>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-blue-500/0 group-hover:from-orange-500/10 group-hover:to-blue-500/10 pointer-events-none transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 max-w-2xl mx-auto">
            Each transformation is a testament to our commitment to excellence. From complete detail work to specialized restoration, we deliver exceptional results that exceed expectations.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
