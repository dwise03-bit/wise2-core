'use client';

import React from 'react';

interface Option {
  value: string;
  label: string;
  icon: string;
  description: string;
}

interface QuestionScreenProps {
  question: string;
  options: Option[];
  selected: string | null;
  onSelect: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
  stepNumber: number;
  totalSteps: number;
  onClose: () => void;
}

export function QuestionScreen({
  question,
  options,
  selected,
  onSelect,
  onNext,
  onSkip,
  stepNumber,
  totalSteps,
  onClose,
}: QuestionScreenProps) {
  const handleSubmit = () => {
    if (selected) {
      onNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* Header with close and progress */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            Question {stepNumber} of {totalSteps}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-200">
          <div
            className="h-full bg-red-500 transition-all duration-300"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{question}</h2>

          {/* Radio options */}
          <fieldset className="space-y-3">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                style={{
                  borderColor: selected === option.value ? '#ff1744' : '#e5e7eb',
                  backgroundColor:
                    selected === option.value ? '#fff3f4' : '#ffffff',
                }}
              >
                <input
                  type="radio"
                  name="question"
                  value={option.value}
                  checked={selected === option.value}
                  onChange={(e) => onSelect(e.target.value)}
                  className="mt-1 mr-3"
                  aria-label={option.label}
                />
                <div className="flex-1">
                  <div className="text-lg font-medium text-gray-900">
                    {option.icon} {option.label}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                </div>
              </label>
            ))}
          </fieldset>
        </div>

        {/* Buttons */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
