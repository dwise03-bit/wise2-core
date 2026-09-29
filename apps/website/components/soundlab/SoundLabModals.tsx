'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SoundLabModalsState {
  intakeOpen: boolean;
  intakePackage: string | null;
  openIntake: (pkg?: string) => void;
  closeIntake: () => void;
  producerOpen: boolean;
  openProducer: () => void;
  closeProducer: () => void;
}

const SoundLabModalsContext = createContext<SoundLabModalsState | null>(null);

export function SoundLabModalsProvider({ children }: { children: ReactNode }) {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [intakePackage, setIntakePackage] = useState<string | null>(null);
  const [producerOpen, setProducerOpen] = useState(false);

  const openIntake = (pkg?: string) => {
    setIntakePackage(pkg ?? null);
    setIntakeOpen(true);
  };
  const closeIntake = () => setIntakeOpen(false);
  const openProducer = () => setProducerOpen(true);
  const closeProducer = () => setProducerOpen(false);

  return (
    <SoundLabModalsContext.Provider
      value={{
        intakeOpen,
        intakePackage,
        openIntake,
        closeIntake,
        producerOpen,
        openProducer,
        closeProducer,
      }}
    >
      {children}
    </SoundLabModalsContext.Provider>
  );
}

export function useSoundLabModals() {
  const ctx = useContext(SoundLabModalsContext);
  if (!ctx) {
    throw new Error('useSoundLabModals must be used within SoundLabModalsProvider');
  }
  return ctx;
}
