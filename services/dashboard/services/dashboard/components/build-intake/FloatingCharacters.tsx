'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FloatingCharacters() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <>
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed left-4 top-1/4 z-20 pointer-events-none"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-32 bg-gradient-to-br from-[#00D9FF]/20 to-[#FF4D4D]/20 rounded-lg border-2 border-[#00D9FF]/50 flex flex-col items-center justify-center backdrop-blur-sm"
          style={{
            boxShadow: '0 0 30px rgba(0, 217, 255, 0.3)',
          }}
        >
          <div className="text-5xl mb-2">🤖</div>
          <p className="text-xs font-bold text-[#00D9FF] text-center">DARRIN</p>
          <p className="text-[10px] text-gray-400 text-center">Idea Hunter</p>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -35, 0],
          x: [0, -25, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed right-4 top-1/3 z-20 pointer-events-none"
      >
        <motion.div
          animate={{
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-32 bg-gradient-to-br from-[#FF4D4D]/20 to-[#00D9FF]/20 rounded-lg border-2 border-[#FF4D4D]/50 flex flex-col items-center justify-center backdrop-blur-sm"
          style={{
            boxShadow: '0 0 30px rgba(255, 77, 77, 0.3)',
          }}
        >
          <div className="text-5xl mb-2">⚙️</div>
          <p className="text-xs font-bold text-[#FF4D4D] text-center">DANIEL</p>
          <p className="text-[10px] text-gray-400 text-center">System Builder</p>
        </motion.div>
      </motion.div>

      <motion.div
        animate={{
          rotate: 360,
          y: [0, -15, 0],
        }}
        transition={{
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          },
          y: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
      >
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 blur-3xl bg-[#00D9FF]/20 rounded-full"></div>
          <div
            className="w-20 h-20 bg-gradient-to-br from-[#00D9FF] to-[#FF4D4D] rounded-full flex items-center justify-center relative z-10 border-2 border-[#00D9FF]"
            style={{
              boxShadow: '0 0 40px rgba(0, 217, 255, 0.5)',
            }}
          >
            <span className="text-3xl font-black text-white">W²</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -40, 0],
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="fixed bottom-1/4 left-1/4 z-15 pointer-events-none"
      >
        <div className="text-4xl">✨</div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -40, 0],
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        className="fixed bottom-1/3 right-1/4 z-15 pointer-events-none"
      >
        <div className="text-4xl">⚡</div>
      </motion.div>
    </>
  );
}
