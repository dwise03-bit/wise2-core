'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBlakkhailProducts } from '@/lib/sencere-products';
import { BlakkhailExperience } from './BlakkhailExperience';
import { BlakkhailMechanicalChorus } from './BlakkhailMechanicalChorus';
import { BlakkhailPiffCityEndCard } from './BlakkhailPiffCityEndCard';
import { BlakkhailVaultReveal } from './BlakkhailVaultReveal';
import { BlakkhailShopScroll } from './BlakkhailShopScroll';
import { BlakkhailMission } from './BlakkhailMission';
import { BlakkhailLookBook, BlakkhailVideo } from './BlakkhailMedia';
import { BlakkhailProducts } from './BlakkhailProducts';
import {
  CINEMATIC_TIMING,
  CATEGORY_COMING_SOON,
  type BlakkhailCategory,
  type CinematicPhase,
} from './blakkhail-experience';
import styles from './blakkhail-cinematic.module.css';

export function BlakkhailStorefront() {
  const [category, setCategory] = useState<BlakkhailCategory | null>(null);
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>('idle');
  const [host, setHost] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<BlakkhailCategory | null>(null);

  useEffect(() => {
    setHost(window.location.hostname);
  }, []);

  const allProducts = getBlakkhailProducts();
  const vaultProduct = useMemo(() => {
    if (!pendingCategory) return null;
    if (pendingCategory === 'tees') return allProducts[0] ?? null;
    return null;
  }, [allProducts, pendingCategory]);

  const finishCinematic = useCallback(() => {
    if (pendingCategory) {
      setCategory(pendingCategory);
      setPendingCategory(null);
    }
    setCinematicPhase('complete');
    window.setTimeout(() => {
      document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }, [pendingCategory]);

  const handleSelectCategory = useCallback((next: BlakkhailCategory) => {
    setPendingCategory(next);
    setCinematicPhase('lights-out');

    window.setTimeout(() => {
      setCinematicPhase('chorus');
    }, CINEMATIC_TIMING.lightsOutMs);
  }, []);

  const handleChorusComplete = useCallback(() => {
    setCinematicPhase('vault');
  }, []);

  const handleVaultComplete = useCallback(() => {
    setCinematicPhase('end-card');
  }, []);

  const handleEndCardComplete = useCallback(() => {
    finishCinematic();
  }, [finishCinematic]);

  useEffect(() => {
    if (cinematicPhase !== 'end-card') return;
    const timer = window.setTimeout(handleEndCardComplete, CINEMATIC_TIMING.endCardMs);
    return () => window.clearTimeout(timer);
  }, [cinematicPhase, handleEndCardComplete]);

  return (
    <>
      {/* Lights die overlay */}
      {cinematicPhase === 'lights-out' && (
        <div
          className={`fixed inset-0 z-[90] ${styles.lightsOutOverlay}`}
          style={{ backgroundColor: '#000' }}
          aria-hidden
        />
      )}

      {cinematicPhase === 'chorus' && (
        <BlakkhailMechanicalChorus onComplete={handleChorusComplete} />
      )}

      {cinematicPhase === 'vault' && pendingCategory && (
        <BlakkhailVaultReveal
          product={vaultProduct}
          category={pendingCategory}
          host={host}
          comingSoonMessage={
            pendingCategory !== 'tees' ? CATEGORY_COMING_SOON[pendingCategory] : undefined
          }
          fullscreen
          onComplete={handleVaultComplete}
        />
      )}

      {cinematicPhase === 'end-card' && (
        <BlakkhailPiffCityEndCard onComplete={handleEndCardComplete} />
      )}

      <BlakkhailExperience
        activeCategory={category}
        cinematicPhase={cinematicPhase}
        onSelectCategory={handleSelectCategory}
      />
      <BlakkhailShopScroll />
      <BlakkhailMission />
      <BlakkhailProducts category={category} showVaultInline={cinematicPhase === 'complete'} />
      <BlakkhailLookBook />
      <BlakkhailVideo />
    </>
  );
}
