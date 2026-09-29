'use client';

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[60] bg-cc-dark text-white px-5 py-3 rounded-full shadow-lg text-sm font-poppins"
    >
      {message}
    </div>
  );
}
