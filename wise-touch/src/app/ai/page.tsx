'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Mic, Copy, MessageSquare, Zap, Brain, Cpu, Sparkles, Activity } from 'lucide-react'
import { PageContainer } from '@/components/layout/PageContainer'
import { PremiumPageHeader, PremiumStatGrid, PremiumSectionContainer } from '@/components/layout/PremiumSections'
import { PremiumHUDPanel, PremiumMetricCard } from '@/components/common/PremiumCards'
import { PremiumButton } from '@/components/common/PremiumButton'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const aiModels = [
  { id: 'claude', name: 'Claude 3.5', status: 'online', latency: 145 },
  { id: 'gpt4', name: 'GPT-4', status: 'online', latency: 234 },
  { id: 'ollama', name: 'Ollama Local', status: 'online', latency: 45 },
]

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with analysis, automation, and decision-making across all your business operations. What would you like help with today?',
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeModel, setActiveModel] = useState('claude')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your request: "${input}". Here's what I found:\n\n• Key insight 1\n• Key insight 2\n• Recommended action\n\nWould you like me to elaborate on any of these points?`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    },
  }

  return (
    <PageContainer>
      <motion.div
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <PremiumPageHeader
            title="AI Intelligence Center"
            subtitle="Multi-model AI system"
            description="Powered by Claude, GPT-4, and local Ollama for intelligent business insights"
            icon={Brain}
            badge="3 Models"
          />
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={itemVariants}>
          <PremiumStatGrid stats={[
            { label: 'Models Online', value: aiModels.length, icon: <Sparkles size={20} />, trend: 'up' },
            { label: 'Tokens This Month', value: '12.4K', icon: <Zap size={20} />, trend: 'up' },
            { label: 'Avg Latency', value: '141ms', icon: <Activity size={20} />, trend: 'down' },
            { label: 'Monthly Cost', value: '$24.50', change: -8 },
          ]} />
        </motion.div>

        {/* Chat Section */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer title="AI Chat" subtitle="Multi-model conversation interface" badge="Live">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chat */}
              <div className="lg:col-span-2">
                <PremiumHUDPanel title="Conversation" status="online" className="h-[600px] flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    <AnimatePresence>
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <motion.div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              message.role === 'user'
                                ? 'bg-blue-electric text-bg-primary font-medium'
                                : 'bg-bg-tertiary/50 border border-steel/30 text-chrome-light'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-50 mt-2">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {isLoading && (
                      <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="w-2.5 h-2.5 bg-blue-electric rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                        />
                        <motion.div
                          className="w-2.5 h-2.5 bg-blue-electric rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                        />
                        <motion.div
                          className="w-2.5 h-2.5 bg-blue-electric rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="space-y-3 pt-4 border-t border-steel/30">
                    <div className="flex gap-2">
                      <motion.input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask anything about your business..."
                        className="flex-1 px-4 py-2.5 bg-bg-tertiary/40 border border-steel/30 rounded-lg text-sm text-chrome-light placeholder-chrome-dark/50 focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 transition-all"
                        whileFocus={{ scale: 1.01 }}
                      />
                      <PremiumButton
                        onClick={handleSend}
                        disabled={isLoading}
                        variant="primary"
                        size="md"
                        icon={Send}
                      >
                        Send
                      </PremiumButton>
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        className="p-2 hover:bg-bg-tertiary/50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        title="Attach file"
                      >
                        <Paperclip size={16} className="text-chrome-dark/60" />
                      </motion.button>
                      <motion.button
                        className="p-2 hover:bg-bg-tertiary/50 rounded-lg transition-colors"
                        whileHover={{ scale: 1.05 }}
                        title="Voice input"
                      >
                        <Mic size={16} className="text-chrome-dark/60" />
                      </motion.button>
                    </div>
                  </div>
                </PremiumHUDPanel>
              </div>

              {/* Sidebar - Models & Stats */}
              <div className="space-y-4">
                {/* Active Models */}
                <PremiumHUDPanel title="Active Models" status="online">
                  <div className="space-y-2">
                    {aiModels.map((model) => (
                      <motion.button
                        key={model.id}
                        onClick={() => setActiveModel(model.id)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          activeModel === model.id
                            ? 'bg-blue-electric/20 border border-blue-electric/50'
                            : 'bg-bg-tertiary/30 border border-steel/30 hover:border-blue-electric/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Cpu size={14} className={activeModel === model.id ? 'text-blue-electric' : 'text-chrome-dark'} />
                            <span className="text-sm font-medium text-chrome-light">{model.name}</span>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        </div>
                        <p className="text-xs text-chrome-dark/60 mt-1">Latency: {model.latency}ms</p>
                      </motion.button>
                    ))}
                  </div>
                </PremiumHUDPanel>

                {/* Usage Stats */}
                <div className="space-y-2">
                  <PremiumMetricCard
                    title="Tokens Used"
                    value="12.4K"
                    subtitle="This month"
                  >
                    <div className="h-2 bg-bg-tertiary/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-blue-electric rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '33%' }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </PremiumMetricCard>

                  <PremiumMetricCard
                    title="Avg. Latency"
                    value="141ms"
                    subtitle="All models"
                    status="good"
                  >
                    <span className="text-xs text-green-400 font-semibold">↓ 12% vs yesterday</span>
                  </PremiumMetricCard>

                  <PremiumMetricCard
                    title="Cost/Month"
                    value="$24.50"
                    subtitle="Current estimate"
                    status="good"
                  >
                    <span className="text-xs text-chrome-dark/60">Within budget</span>
                  </PremiumMetricCard>
                </div>
              </div>
            </div>
          </PremiumSectionContainer>
        </motion.div>

        {/* Prompt Library */}
        <motion.div variants={itemVariants}>
          <PremiumSectionContainer title="Saved Prompts" subtitle="Quick templates and workflows" badge="4 Templates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: '📊', title: 'Business Analysis', desc: 'Analyze KPIs and metrics' },
                { icon: '💻', title: 'Code Review', desc: 'Review and optimize code' },
                { icon: '📝', title: 'Content Strategy', desc: 'Plan content campaigns' },
                { icon: '⚡', title: 'Performance', desc: 'Optimize infrastructure' },
              ].map((prompt) => (
                <motion.button
                  key={prompt.title}
                  className="hud-panel p-4 rounded-xl text-left group"
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="text-2xl mb-2"
                    animate={{ rotate: 0 }}
                    whileHover={{ rotate: 10, scale: 1.2 }}
                  >
                    {prompt.icon}
                  </motion.div>
                  <p className="text-sm font-semibold text-chrome-light">{prompt.title}</p>
                  <p className="text-xs text-chrome-dark/60 mt-1">{prompt.desc}</p>
                </motion.button>
              ))}
            </div>
          </PremiumSectionContainer>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
