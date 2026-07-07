'use client';

import React, { useState } from 'react';
import { QuestionScreen } from './QuestionScreen';
import { RecommendationScreen } from './RecommendationScreen';
import {
  Experience,
  TimeCommitment,
  Goal,
  getRecommendedTier,
  getRecommendationExplanation,
  TIER_RECOMMENDATIONS,
} from '../../lib/tierRecommendation';

interface TierDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTierSelect: (tier: string) => void;
}

export function TierDiscoveryModal({
  isOpen,
  onClose,
  onTierSelect,
}: TierDiscoveryModalProps) {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [timeCommitment, setTimeCommitment] = useState<TimeCommitment | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 'result'>(1);

  if (!isOpen) return null;

  const handleExperienceSelect = (value: string) => {
    setExperience(value as Experience);
  };

  const handleTimeSelect = (value: string) => {
    setTimeCommitment(value as TimeCommitment);
  };

  const handleGoalSelect = (value: string) => {
    setGoal(value as Goal);
  };

  const handleSkip = () => {
    onClose();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3 && experience && timeCommitment && goal) {
      setCurrentStep('result');
    }
  };

  const handleStartTier = (tier: string) => {
    onTierSelect(tier);
    onClose();
  };

  const handleViewAll = () => {
    onClose();
  };

  if (currentStep === 'result' && experience && timeCommitment && goal) {
    const recommendedTier = getRecommendedTier(experience, timeCommitment, goal);
    const tierInfo = TIER_RECOMMENDATIONS[recommendedTier];
    const { profilePoints, explanation } = getRecommendationExplanation(
      experience,
      timeCommitment,
      goal,
      recommendedTier
    );

    return (
      <RecommendationScreen
        tier={recommendedTier}
        tierInfo={tierInfo}
        profilePoints={profilePoints}
        explanation={explanation}
        onStart={handleStartTier}
        onViewAll={handleViewAll}
        onClose={onClose}
      />
    );
  }

  if (currentStep === 1) {
    return (
      <QuestionScreen
        question="What's your background?"
        options={[
          {
            value: 'beginner',
            label: 'Beginner',
            icon: '🔰',
            description: 'Never shot before',
          },
          {
            value: 'some',
            label: 'Some experience',
            icon: '📍',
            description: 'Taken a course or two',
          },
          {
            value: 'competitive',
            label: 'Competitive shooter',
            icon: '🎯',
            description: 'Looking to improve',
          },
        ]}
        selected={experience}
        onSelect={handleExperienceSelect}
        onNext={handleNext}
        onSkip={handleSkip}
        stepNumber={1}
        totalSteps={3}
        onClose={onClose}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <QuestionScreen
        question="How much time can you dedicate?"
        options={[
          {
            value: 'casual',
            label: 'Casual',
            icon: '😌',
            description: 'Learn at my own pace, no schedule',
          },
          {
            value: '2-3hrs',
            label: '2-3 hours/week',
            icon: '⏰',
            description: 'Want to build momentum',
          },
          {
            value: 'serious',
            label: 'Serious',
            icon: '💪',
            description: '1+ hour coaching weekly',
          },
        ]}
        selected={timeCommitment}
        onSelect={handleTimeSelect}
        onNext={handleNext}
        onSkip={handleSkip}
        stepNumber={2}
        totalSteps={3}
        onClose={onClose}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <QuestionScreen
        question="What's your main goal?"
        options={[
          {
            value: 'safe',
            label: 'Learn safely',
            icon: '🛡️',
            description: 'Foundational skills',
          },
          {
            value: 'self-defense',
            label: 'Self-defense',
            icon: '🎯',
            description: 'Real-world readiness',
          },
          {
            value: 'competition',
            label: 'Competition',
            icon: '🏆',
            description: 'Master advanced techniques',
          },
          {
            value: 'improve',
            label: 'Improve skills',
            icon: '📈',
            description: 'Already know basics',
          },
        ]}
        selected={goal}
        onSelect={handleGoalSelect}
        onNext={handleNext}
        onSkip={handleSkip}
        stepNumber={3}
        totalSteps={3}
        onClose={onClose}
      />
    );
  }

  return null;
}
