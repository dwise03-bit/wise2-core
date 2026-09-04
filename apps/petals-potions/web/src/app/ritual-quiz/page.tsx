'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const quizQuestions = [
  {
    id: 1,
    question: 'What's your primary wellness goal right now?',
    options: [
      { text: 'Peace & Relaxation', value: 'body' },
      { text: 'Mental Clarity', value: 'mind' },
      { text: 'Emotional Balance', value: 'heart' },
      { text: 'Spiritual Growth', value: 'soul' },
    ],
  },
  {
    id: 2,
    question: 'How would you describe your ideal moment?',
    options: [
      { text: 'Quiet, still, restored', value: 'body' },
      { text: 'Focused, clear, sharp', value: 'mind' },
      { text: 'Connected, loved, open', value: 'heart' },
      { text: 'Inspired, elevated, aligned', value: 'soul' },
    ],
  },
  {
    id: 3,
    question: 'What time of day feels most important for your ritual?',
    options: [
      { text: 'Evening wind-down', value: 'body' },
      { text: 'Morning preparation', value: 'mind' },
      { text: 'Afternoon break', value: 'heart' },
      { text: 'Anytime I need intention', value: 'soul' },
    ],
  },
]

export default function RitualQuizPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<string[]>([])

  const handleAnswer = (value: string) => {
    const newResponses = [...responses, value]
    setResponses(newResponses)

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const resetQuiz = () => {
    setCurrentStep(0)
    setResponses([])
  }

  const getPillarResult = () => {
    const counts = { heart: 0, mind: 0, body: 0, soul: 0 }
    responses.forEach((r) => {
      counts[r as keyof typeof counts]++
    })
    return Object.keys(counts).reduce((a, b) =>
      counts[a as keyof typeof counts] > counts[b as keyof typeof counts] ? a : b
    )
  }

  const pillarDescriptions: Record<string, { name: string; blend: string; description: string }> = {
    heart: {
      name: 'HEART',
      blend: 'Love & Heart',
      description: 'Your blend focuses on emotional connection, opening your heart, and nurturing deep relationships.',
    },
    mind: {
      name: 'MIND',
      blend: 'Focus & Clarity',
      description: 'Your blend sharpens mental clarity, enhances focus, and elevates your cognitive performance.',
    },
    body: {
      name: 'BODY',
      blend: 'Calm & Restore',
      description: 'Your blend promotes deep relaxation, physical restoration, and peaceful inner calm.',
    },
    soul: {
      name: 'SOUL',
      blend: 'Soul Connect',
      description: 'Your blend elevates spiritual connection, aligns you with your purpose, and transcends the everyday.',
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pp-midnight to-pp-navy section-container flex items-center justify-center">
      {responses.length === quizQuestions.length ? (
        // Results Screen
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif-header font-bold text-pp-cream mb-6">
            Your Ritual Revealed
          </h1>

          <div className="card-luxury mb-8 p-8">
            <div className="text-6xl mb-4">✿</div>
            <p className="text-pp-gold font-serif-header font-bold text-lg mb-2">
              {pillarDescriptions[getPillarResult()].name}
            </p>
            <h2 className="text-3xl font-serif-header font-bold text-pp-cream mb-6">
              {pillarDescriptions[getPillarResult()].blend}
            </h2>
            <p className="text-pp-cream/80 font-serif-display text-lg leading-relaxed mb-8">
              {pillarDescriptions[getPillarResult()].description}
            </p>

            <div className="bg-pp-purple/30 border border-pp-gold/30 rounded-lg p-4 mb-8">
              <p className="text-pp-cream/70 font-serif-display italic">
                "This blend is crafted to guide you deeper into your wellness journey, honoring what your ritual needs."
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-4">
            <Link href="/products" className="btn-primary block">
              View This Blend
            </Link>
            <Link href="/subscription" className="btn-secondary block">
              Subscribe for Monthly Delivery
            </Link>
            <button
              onClick={resetQuiz}
              className="btn-ghost block w-full text-center"
            >
              Retake Quiz
            </button>
          </div>
        </motion.div>
      ) : (
        // Quiz Screen
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="max-w-2xl w-full"
        >
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-pp-gold font-serif-header text-sm">
                Question {currentStep + 1} of {quizQuestions.length}
              </span>
              <span className="text-pp-cream/60 text-sm">
                {Math.round(((currentStep + 1) / quizQuestions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-pp-navy/50 h-1 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-pp-gold to-pp-green h-full transition-all duration-500"
                style={{
                  width: `${((currentStep + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="card-luxury mb-8 p-8">
            <h2 className="text-3xl md:text-4xl font-serif-header font-bold text-pp-cream mb-8">
              {quizQuestions[currentStep].question}
            </h2>

            {/* Options */}
            <div className="space-y-4">
              {quizQuestions[currentStep].options.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 text-left bg-pp-purple/20 border border-pp-gold/20 hover:border-pp-gold/60 hover:bg-pp-purple/30 rounded-lg transition-all duration-300 group"
                >
                  <p className="text-pp-cream group-hover:text-pp-gold font-serif-display font-bold transition-colors">
                    {option.text}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Step Info */}
          <p className="text-center text-pp-cream/60 font-serif-display text-sm">
            Step {currentStep + 1} of {quizQuestions.length}
          </p>
        </motion.div>
      )}
    </div>
  )
}
