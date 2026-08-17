'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function ImpsGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const galleryItems = [
    { id: 1, title: 'Front View', description: 'Hero perspective of the BYTE MINI character', image: '/wise-imp/idle-blue.webp' },
    { id: 2, title: 'Three-Quarter View', description: 'Product depth and dimension', image: '/wise-imp/idle-blue.webp' },
    { id: 3, title: 'Rear Enclosure', description: 'Serviceable rear shell design', image: '/wise-imp/thinking-blue.webp' },
    { id: 4, title: 'Internal Layout', description: 'ESP32-C5 and components arrangement', image: '/wise-imp/thinking-blue.webp' },
    { id: 5, title: 'Screen Close-up', description: 'Touch display with vibrant face animations', image: '/wise-imp/celebrate-blue.webp' },
    { id: 6, title: 'Case Assembly', description: '3D-printed enclosure components', image: '/wise-imp/wave-blue.webp' },
  ];

  const nextImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % galleryItems.length);
  };

  const prevImage = () => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + galleryItems.length) % galleryItems.length);
  };

  return (
    <section id="gallery" className="py-20 sm:py-32 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter text-white">
            PRODUCT
            <br />
            <span className="text-blue-400">GALLERY</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto">
            Explore every angle of the BYTE MINI 4.0
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {galleryItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-square bg-black border border-blue-500/30 hover:border-blue-400/60 rounded-lg overflow-hidden cursor-pointer transition"
            >
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 group-hover:to-black/40 transition" />
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 group-hover:text-blue-400 transition">
                <p className="text-xs sm:text-sm font-bold text-center px-2 text-white group-hover:text-blue-400">{item.title}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="relative w-full max-w-4xl">
              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition"
              >
                <X size={32} />
              </button>

              {/* Image Container */}
              <div className="bg-black border border-blue-500/50 rounded-lg overflow-hidden">
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  <Image
                    src={galleryItems[selectedIndex].image}
                    alt={galleryItems[selectedIndex].title}
                    width={1024}
                    height={576}
                    priority
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Info */}
                <div className="p-6 space-y-2 border-t border-blue-500/20">
                  <h3 className="text-lg sm:text-xl font-bold text-white">{galleryItems[selectedIndex].title}</h3>
                  <p className="text-sm text-gray-400">{galleryItems[selectedIndex].description}</p>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevImage}
                  className="p-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 rounded-lg transition"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                  {galleryItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`w-2 h-2 rounded-full transition ${
                        idx === selectedIndex ? 'bg-blue-400 w-8' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextImage}
                  className="p-3 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 rounded-lg transition"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Counter */}
              <p className="text-center mt-4 text-sm text-gray-500">
                {selectedIndex + 1} / {galleryItems.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
