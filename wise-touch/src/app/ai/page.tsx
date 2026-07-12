'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Paperclip, Mic, Copy, MessageSquare, Zap, Brain, Cpu, Sparkles, Activity } from 'lucide-react'
import { PageContainer, SectionContainer } from '@/components/layout/PageContainer'
import { PageHeader, StatGrid } from '@/components/layout/PageSections'
import { HUDPanel, MetricCard } from '@/components/common/Cards'

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

    // Simulate AI response
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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <PageContainer title="AI Intelligence Center" subtitle="Multi-model AI system powered by Claude, GPT-4, and Ollama">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Key Metrics */}
        <motion.div variants={itemVariants}>
          <StatGrid stats={[
            { label: 'Models Online', value: aiModels.length, icon: <Sparkles size={20} /> },
            { label: 'Tokens This Month', value: '12.4K', icon: <Zap size={20} /> },
            { label: 'Avg Latency', value: '141ms', icon: <Activity size={20} /> },
            { label: 'Monthly Cost', value: '$24.50', change: -8 },
          ]} />
        </motion.div>

        {/* Chat Section */}
        <motion.div variants={itemVariants}>
          <SectionContainer title="AI Chat" subtitle="Multi-model conversation interface">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Chat */}
              <div className="lg:col-span-2">
          <HUDPanel title="AI Chat" status="online" className="h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-electric text-bg-primary'
                          : 'bg-bg-tertiary border border-steel/50 text-chrome-light'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-2 h-2 bg-blue-electric rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-electric rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-electric rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="space-y-3 pt-4 border-t border-steel/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask anything about your business..."
                  className="flex-1 px-3 py-2 bg-bg-tertiary border border-steel/50 rounded text-sm text-chrome-light placeholder-chrome-dark"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className="p-2 bg-blue-electric hover:bg-blue-electric-light text-bg-primary rounded transition-colors disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>

              <div className="flex gap-2">
                <button className="p-2 hover:bg-bg-tertiary rounded transition-colors" title="Attach file">
                  <Paperclip size={16} className="text-chrome-dark" />
                </button>
                <button className="p-2 hover:bg-bg-tertiary rounded transition-colors" title="Voice input">
                  <Mic size={16} className="text-chrome-dark" />
                </button>
              </div>
            </div>
          </HUDPanel>
        </div>

        {/* Sidebar - Models & Stats */}
        <div className="space-y-4">
          {/* Active Models */}
          <HUDPanel title="Active Models">
            <div className="space-y-2">
              {aiModels.map((model) => (
                <motion.button
                  key={model.id}
                  onClick={() => setActiveModel(model.id)}
                  className={`w-full p-3 rounded text-left transition-all ${
                    activeModel === model.id
                      ? 'bg-blue-electric/20 border border-blue-electric/50'
                      : 'bg-bg-tertiary border border-steel/30 hover:border-blue-electric/30'
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
                  <p className="text-xs text-chrome-dark mt-1">Latency: {model.latency}ms</p>
                </motion.button>
              ))}
            </div>
          </HUDPanel>

          {/* Usage Stats */}
          <div className="space-y-2">
            <MetricCard title="Tokens Used" value="12.4K" subtitle="This month">
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full bg-blue-electric w-1/3 rounded-full"></div>
              </div>
            </MetricCard>

            <MetricCard title="Avg. Latency" value="141ms" subtitle="All models">
              <span className="text-xs text-green-500">↓ 12% vs yesterday</span>
            </MetricCard>

            <MetricCard title="Cost/Month" value="$24.50" subtitle="Current estimate">
              <span className="text-xs text-chrome-dark">Within budget</span>
            </MetricCard>
          </div>
        </div>
            </div>
          </SectionContainer>
        </motion.div>

        {/* Prompt Library */}
        <motion.div variants={itemVariants}>
          <SectionContainer title="Saved Prompts" subtitle="Quick templates and workflows">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            'Business Analysis',
            'Code Review',
            'Content Strategy',
            'Performance Optimization',
          ].map((prompt) => (
            <motion.button
              key={prompt}
              className="p-3 bg-bg-tertiary hover:bg-bg-tertiary/80 rounded border border-steel/30 hover:border-blue-electric/50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare size={16} className="text-blue-electric mb-2" />
              <p className="text-sm text-chrome-light">{prompt}</p>
            </motion.button>
          ))}
            </div>
          </SectionContainer>
        </motion.div>
      </motion.div>
    </PageContainer>
  )
}
