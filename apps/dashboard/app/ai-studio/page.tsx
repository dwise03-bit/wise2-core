'use client';

import { useState } from 'react';

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  automationPotential: 'high' | 'medium' | 'low';
  targetProcess: string;
  estimatedTimeSaved: string;
  confidence: number;
  actions: string[];
}

const aiSuggestions: AISuggestion[] = [
  {
    id: 'ai-1',
    title: 'Auto-Qualify Leads with AI',
    description:
      'Use Claude to analyze leads and automatically score them based on fit, budget, and timeline',
    automationPotential: 'high',
    targetProcess: 'Lead Qualification',
    estimatedTimeSaved: '5 hours/week',
    confidence: 94,
    actions: ['Email', 'Database', 'HTTP API'],
  },
  {
    id: 'ai-2',
    title: 'Smart Invoice Routing',
    description:
      'Analyze invoice content and automatically route to correct department or approver',
    automationPotential: 'high',
    targetProcess: 'Invoice Processing',
    estimatedTimeSaved: '3 hours/week',
    confidence: 87,
    actions: ['Email', 'Discord'],
  },
  {
    id: 'ai-3',
    title: 'Churn Risk Detection',
    description: 'Monitor customer behavior and alert on churn risk signals before they leave',
    automationPotential: 'high',
    targetProcess: 'Customer Retention',
    estimatedTimeSaved: '4 hours/week',
    confidence: 91,
    actions: ['Discord', 'Email', 'Database'],
  },
  {
    id: 'ai-4',
    title: 'Deal Forecast Accuracy',
    description:
      'Improve sales forecast by analyzing deal text and history with Claude AI predictions',
    automationPotential: 'medium',
    targetProcess: 'Sales Forecasting',
    estimatedTimeSaved: '2 hours/week',
    confidence: 78,
    actions: ['Database', 'HTTP API'],
  },
  {
    id: 'ai-5',
    title: 'Auto-Generate Project Summaries',
    description:
      'Generate weekly project status summaries from task updates and completion data',
    automationPotential: 'medium',
    targetProcess: 'Project Reporting',
    estimatedTimeSaved: '1.5 hours/week',
    confidence: 85,
    actions: ['Email', 'Discord'],
  },
];

const aiCapabilities = [
  { icon: '🧠', title: 'Claude AI Analysis', description: 'Deep reasoning on text, data, and context' },
  { icon: '📊', title: 'Pattern Recognition', description: 'Detect trends in business data' },
  { icon: '🤖', title: 'Auto-Generation', description: 'Write emails, summaries, reports' },
  { icon: '🎯', title: 'Scoring & Ranking', description: 'Rate leads, deals, risks' },
  { icon: '🔮', title: 'Prediction', description: 'Forecast outcomes and trends' },
  { icon: '💬', title: 'Conversational', description: 'Chat-based automation' },
];

const models = [
  { id: 'claude-opus', name: 'Claude 3.5 Sonnet', speed: 'Balanced', cost: 'Medium', recommended: true },
  { id: 'claude-haiku', name: 'Claude 3.5 Haiku', speed: 'Fast', cost: 'Low', recommended: false },
  { id: 'gpt-4', name: 'GPT-4', speed: 'Balanced', cost: 'High', recommended: false },
];

export default function AIStudioPage() {
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#2cd588]">🧠 AI Studio</h1>
          <p className="text-gray-400 mt-1">AI-powered automations and custom models</p>
        </div>
        <button
          onClick={() => setShowCreatePrompt(true)}
          className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600"
        >
          + Custom Prompt
        </button>
      </div>

      {/* AI Capabilities */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">AI Capabilities</h2>
        <div className="grid grid-cols-3 gap-4">
          {aiCapabilities.map((cap, idx) => (
            <div key={idx} className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 hover:border-[#2cd588] transition-colors">
              <p className="text-3xl mb-2">{cap.icon}</p>
              <h3 className="font-bold text-white">{cap.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">AI Recommendations</h2>
        <p className="text-gray-400 text-sm">Claude analyzed your workflows and found automation opportunities</p>

        <div className="space-y-3">
          {aiSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => setSelectedSuggestion(suggestion)}
              className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-6 cursor-pointer hover:border-[#2cd588] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{suggestion.title}</h3>
                  <p className="text-gray-400 text-sm mt-2">{suggestion.description}</p>

                  <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Process:</span>
                      <span className="text-[#2cd588] font-medium">{suggestion.targetProcess}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Time saved:</span>
                      <span className="text-green-400 font-medium">{suggestion.estimatedTimeSaved}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Actions:</span>
                      <div className="flex gap-1">
                        {suggestion.actions.map((action, idx) => (
                          <span key={idx} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-2">
                  <span
                    className={`inline-block px-3 py-1 rounded text-sm font-bold ${
                      suggestion.automationPotential === 'high'
                        ? 'bg-green-500/20 text-green-400'
                        : suggestion.automationPotential === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {suggestion.automationPotential} impact
                  </span>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <div className="w-20 bg-[#050505] rounded-full h-2 mt-1 overflow-hidden border border-[#2cd588]/20">
                      <div
                        className="bg-[#2cd588] h-full"
                        style={{ width: `${suggestion.confidence}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#2cd588] mt-1">{suggestion.confidence}%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-[#2cd588]">AI Models</h2>
        <div className="grid grid-cols-3 gap-4">
          {models.map((model) => (
            <div
              key={model.id}
              className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                model.recommended
                  ? 'bg-[#2cd588]/10 border-[#2cd588]'
                  : 'bg-[#0f0f1e] border-[#2cd588]/30 hover:border-[#2cd588]'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-white">{model.name}</h3>
                {model.recommended && (
                  <span className="text-xs bg-[#2cd588] text-black px-2 py-1 rounded font-bold">
                    Recommended
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Speed</span>
                  <span className="text-white">{model.speed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost</span>
                  <span className="text-white">{model.cost}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-4 py-2 border border-[#2cd588] rounded text-[#2cd588] font-medium hover:bg-[#2cd588]/10">
                Select
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Suggestion Detail */}
      {selectedSuggestion && (
        <div className="bg-[#0f0f1e] border border-[#2cd588]/30 rounded-lg p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold text-[#2cd588]">{selectedSuggestion.title}</h2>
              <p className="text-gray-400 mt-2">{selectedSuggestion.description}</p>
            </div>
            <button className="px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
              Create Automation
            </button>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Details */}
            <div className="space-y-4">
              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">Target Process</p>
                <p className="text-white font-medium mt-2">{selectedSuggestion.targetProcess}</p>
              </div>
              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">Estimated Time Saved</p>
                <p className="text-green-400 font-bold text-lg mt-2">{selectedSuggestion.estimatedTimeSaved}</p>
              </div>
              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm">AI Confidence</p>
                <div className="mt-3">
                  <div className="w-full bg-[#0f0f1e] rounded-full h-3 overflow-hidden border border-[#2cd588]/20">
                    <div
                      className="bg-[#2cd588] h-full"
                      style={{ width: `${selectedSuggestion.confidence}%` }}
                    />
                  </div>
                  <p className="text-[#2cd588] font-bold mt-2">{selectedSuggestion.confidence}% confident</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm mb-3">Recommended Actions</p>
                <div className="space-y-2">
                  {selectedSuggestion.actions.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-[#0f0f1e] rounded border border-[#2cd588]/20"
                    >
                      <span className="text-2xl">
                        {action === 'Email'
                          ? '📧'
                          : action === 'Discord'
                            ? '💬'
                            : action === 'Database'
                              ? '💾'
                              : '🔌'}
                      </span>
                      <span className="text-white font-medium">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#050505] p-4 rounded border border-[#2cd588]/20">
                <p className="text-gray-500 text-sm mb-3">Impact</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Automation Potential</span>
                    <span className="font-bold text-green-400">
                      {selectedSuggestion.automationPotential.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Weekly Time Savings</span>
                    <span className="font-bold text-[#2cd588]">{selectedSuggestion.estimatedTimeSaved}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Prompt Modal */}
      {showCreatePrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#0f0f1e] border border-[#2cd588] rounded-lg max-w-2xl w-full max-h-96 overflow-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[#2cd588]">Create Custom Prompt</h2>
              <button onClick={() => setShowCreatePrompt(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Prompt Name</label>
                <input
                  type="text"
                  placeholder="e.g., Lead Scorer"
                  className="w-full bg-[#050505] border border-[#2cd588] rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Instructions</label>
                <textarea
                  placeholder="Write detailed instructions for Claude..."
                  rows={6}
                  className="w-full bg-[#050505] border border-[#2cd588] rounded px-4 py-2 text-white placeholder-gray-600 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                <select className="w-full bg-[#050505] border border-[#2cd588] rounded px-4 py-2 text-white focus:outline-none">
                  <option>Claude 3.5 Sonnet (Recommended)</option>
                  <option>Claude 3.5 Haiku</option>
                  <option>GPT-4</option>
                </select>
              </div>

              <button className="w-full px-6 py-3 bg-[#2cd588] text-black font-bold rounded-lg hover:bg-green-600">
                Create Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
