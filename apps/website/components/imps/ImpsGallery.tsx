'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export function ImpsGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const galleryItems = [
    { id: 1, title: 'Front View', description: 'Neon blue eyes and tactical design aesthetic', image: '/wise-imp/imps-product.png' },
    { id: 2, title: 'Full Body', description: 'Complete device with harness and branding', image: '/wise-imp/imps-product.png' },
    { id: 3, title: 'Display & Face', description: '4" touchscreen with dynamic neon animations', image: '/wise-imp/imps-product.png' },
    { id: 4, title: 'Rabbit Ears', description: 'Distinctive sensor and communication antennae', image: '/wise-imp/imps-product.png' },
    { id: 5, title: 'Tactical Gear', description: 'Integrated harness, pockets, and W² branding', image: '/wise-imp/imps-product.png' },
    { id: 6, title: 'Premium Build', description: 'High-detail robotics with blue accent lighting', image: '/wise-imp/imps-product.png' },
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8">
          {galleryItems.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className="group relative aspect-square bg-black rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-105"
            >
              {/* Border & Glow Container */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-blue-500/40 via-blue-600/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 -z-10" />

              {/* Main Border */}
              <div className="absolute inset-0 border border-blue-500/30 group-hover:border-blue-400/60 rounded-2xl transition duration-300" />

              {/* Image with better scaling */}
              <Image
                src={item.image}
                alt={item.title}
                width={400}
                height={400}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent via-50% to-black/80 group-hover:to-black/60 transition duration-300" />

              {/* Top Edge Highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

              {/* Content with refined styling */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-xs sm:text-sm font-bold text-center px-3 text-white drop-shadow-lg tracking-wide">{item.title}</p>
                <p className="text-xs text-gray-200 text-center px-3 drop-shadow-md line-clamp-2">{item.description}</p>
                <div className="pt-2">
                  <span className="text-2xs text-blue-300 font-medium">→ VIEW</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
            <div className="relative w-full max-w-5xl">
              {/* Close Button */}
              <button
                onClick={() => setSelectedIndex(null)}
                className="absolute -top-14 sm:-top-12 right-0 p-2 text-gray-400 hover:text-blue-400 transition duration-200"
              >
                <X size={32} className="drop-shadow-lg" />
              </button>

              {/* Image Container - Enhanced */}
              <div className="bg-black border border-blue-500/40 rounded-2xl overflow-hidden shadow-2xl shadow-blue-600/50">
                <div className="relative w-full aspect-video bg-black flex items-center justify-center">
                  {/* Glow effect behind image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-blue-600/10 pointer-events-none" />
                  <Image
                    src={galleryItems[selectedIndex].image}
                    alt={galleryItems[selectedIndex].title}
                    width={1024}
                    height={576}
                    priority
                    className="w-full h-full object-cover relative z-10"
                  />
                </div>

                {/* Image Info - Enhanced Styling */}
                <div className="p-6 sm:p-8 space-y-3 border-t border-blue-500/30 bg-gradient-to-b from-blue-950/20 to-black/60">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{galleryItems[selectedIndex].title}</h3>
                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{galleryItems[selectedIndex].description}</p>
                </div>
              </div>

              {/* Navigation Buttons - Premium Style */}
              <div className="flex items-center justify-between mt-8 gap-4">
                <button
                  onClick={prevImage}
                  className="p-3 sm:p-4 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 hover:border-blue-300/80 rounded-lg transition duration-200 text-blue-300 hover:text-blue-200 transform hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Progress Dots */}
                <div className="flex items-center gap-2.5">
                  {galleryItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedIndex(idx)}
                      className={`rounded-full transition-all duration-300 ${
                        idx === selectedIndex
                          ? 'bg-blue-400 w-8 h-2.5 shadow-lg shadow-blue-400/50'
                          : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextImage}
                  className="p-3 sm:p-4 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/50 hover:border-blue-300/80 rounded-lg transition duration-200 text-blue-300 hover:text-blue-200 transform hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              {/* Counter - Premium */}
              <p className="text-center mt-6 text-sm sm:text-base font-medium text-blue-300/80 tracking-wider">
                {selectedIndex + 1} <span className="text-gray-500">/ {galleryItems.length}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
