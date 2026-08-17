'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  Download,
  Share2,
  Clock,
  CheckCircle2,
  Circle,
  Edit2,
  Save,
  X,
  Calendar,
  AlertCircle,
  Volume2,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import Tabs from '@/components/ui/Tabs'
import { Input } from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'

// TypeScript Interfaces
export interface ActionItem {
  id: string
  title: string
  description: string
  owner: 'user' | 'consultant'
  dueDate: string
  completed: boolean
}

export interface PostCallSummaryData {
  recordingUrl: string
  transcript: string
  summary: string
  actionItems: ActionItem[]
  followUpDate: string
  consultantNotes?: string
}

interface PostCallSummaryProps {
  bookingId: string
  summary: PostCallSummaryData
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
}

const checklistVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

export default function PostCallSummary({
  bookingId,
  summary,
}: PostCallSummaryProps) {
  const [activeTab, setActiveTab] = useState('summary')
  const [actionItems, setActionItems] = useState<ActionItem[]>(summary.actionItems)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState<string>('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [showScheduleFollowUp, setShowScheduleFollowUp] = useState(false)
  const [followUpDate, setFollowUpDate] = useState(summary.followUpDate)

  // Action Items Management
  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const startEditDate = (item: ActionItem) => {
    setEditingId(item.id)
    setEditDate(item.dueDate)
  }

  const saveEditDate = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, dueDate: editDate } : item
      )
    )
    setEditingId(null)
  }

  const cancelEditDate = () => {
    setEditingId(null)
    setEditDate('')
  }

  // Download Transcript
  const downloadTranscript = () => {
    const element = document.createElement('a')
    const file = new Blob([summary.transcript], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `call-transcript-${bookingId}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // Share Summary via Email
  const shareViaEmail = async () => {
    const subject = `Call Summary - ${new Date().toLocaleDateString()}`
    const body = `
Call Summary Report
==================

Summary:
${summary.summary}

Action Items:
${actionItems.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.title} (Due: ${item.dueDate})`).join('\n')}

Follow-up Date: ${followUpDate}

${summary.consultantNotes ? `\nConsultant Notes:\n${summary.consultantNotes}` : ''}
    `.trim()

    // Fallback copy to clipboard
    const text = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = text

    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  // Tab Items Configuration
  const tabItems = [
    {
      value: 'summary',
      label: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {/* Summary Text */}
          <motion.div variants={itemVariants}>
            <Card variant="elevated" className="p-6">
              <h3 className="text-lg font-semibold text-wise-text-primary mb-4">
                Call Summary
              </h3>
              <p className="text-wise-text-secondary leading-relaxed">
                {summary.summary}
              </p>
            </Card>
          </motion.div>

          {/* Consultant Notes */}
          {summary.consultantNotes && (
            <motion.div variants={itemVariants}>
              <Card variant="elevated" className="p-6 border-l-2 border-wise-primary">
                <h3 className="text-lg font-semibold text-wise-text-primary mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-wise-primary" />
                  Consultant Notes
                </h3>
                <p className="text-wise-text-secondary leading-relaxed">
                  {summary.consultantNotes}
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      ),
    },
    {
      value: 'actions',
      label: 'Action Items',
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {actionItems.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card variant="elevated" className="p-8 text-center">
                <p className="text-wise-text-muted">No action items recorded</p>
              </Card>
            </motion.div>
          ) : (
            actionItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={checklistVariants}
                custom={index}
              >
                <Card
                  variant="elevated"
                  className={`p-4 transition-all hover:border-[#2CD588] ${
                    item.completed
                      ? 'opacity-60 border-wise-success/30'
                      : 'border-wise-surface/50'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleActionItem(item.id)}
                        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wise-primary rounded-md"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-6 h-6 text-wise-success" />
                        ) : (
                          <Circle className="w-6 h-6 text-wise-text-muted hover:text-wise-primary transition-colors" />
                        )}
                      </motion.button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h4
                            className={`font-semibold text-base ${
                              item.completed
                                ? 'text-wise-text-muted line-through'
                                : 'text-wise-text-primary'
                            }`}
                          >
                            {item.title}
                          </h4>
                          <p className="text-sm text-wise-text-secondary mt-1">
                            {item.description}
                          </p>
                        </div>

                        {/* Owner Badge */}
                        <motion.span
                          whileHover={{ scale: 1.05 }}
                          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            item.owner === 'user'
                              ? 'bg-wise-primary/20 text-wise-primary'
                              : 'bg-wise-surface/60 text-wise-text-secondary'
                          }`}
                        >
                          {item.owner === 'user' ? 'Your Task' : 'Consultant'}
                        </motion.span>
                      </div>

                      {/* Due Date */}
                      <div className="flex items-center gap-2 mt-4">
                        <Clock className="w-4 h-4 text-wise-text-muted" />
                        {editingId === item.id ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-2 flex-1"
                          >
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="flex-1 bg-wise-surface/50 border border-wise-primary/30 rounded px-3 py-1 text-sm text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-primary"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => saveEditDate(item.id)}
                              className="p-1.5 hover:bg-wise-surface/60 rounded transition-colors"
                            >
                              <Save className="w-4 h-4 text-wise-success" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={cancelEditDate}
                              className="p-1.5 hover:bg-wise-surface/60 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-wise-danger" />
                            </motion.button>
                          </motion.div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => startEditDate(item)}
                            className="flex-1 flex items-center gap-2 text-sm text-wise-text-secondary hover:text-wise-primary transition-colors group"
                          >
                            <span>{new Date(item.dueDate).toLocaleDateString()}</span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      ),
    },
    {
      value: 'recording',
      label: 'Recording',
      icon: <Volume2 className="w-4 h-4" />,
      content: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <Card variant="elevated" className="p-8">
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-wise-primary to-blue-600 flex items-center justify-center shadow-glow-blue-lg">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full"
                  >
                    <Play className="w-12 h-12 text-white fill-white" />
                  </motion.button>
                </div>

                <div className="text-center">
                  <h3 className="text-lg font-semibold text-wise-text-primary mb-2">
                    Call Recording
                  </h3>
                  <p className="text-sm text-wise-text-muted">
                    {isPlaying ? 'Playing...' : 'Click to play recording'}
                  </p>
                </div>

                {/* Audio Player */}
                {summary.recordingUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <audio
                      controls
                      className="w-full"
                      src={summary.recordingUrl}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                    />
                  </motion.div>
                )}

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    const a = document.createElement('a')
                    a.href = summary.recordingUrl
                    a.download = `call-recording-${bookingId}.mp3`
                    a.click()
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download Recording
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ),
    },
    {
      value: 'transcript',
      label: 'Transcript',
      icon: <FileText className="w-4 h-4" />,
      content: (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          <motion.div variants={itemVariants}>
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-wise-text-primary">
                  Call Transcript
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={downloadTranscript}
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <div className="prose prose-invert max-w-none">
                  <p className="text-wise-text-secondary whitespace-pre-wrap leading-relaxed text-sm">
                    {summary.transcript}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ),
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-3xl font-bold text-wise-text-primary">
          Post-Call Summary
        </h1>
        <p className="text-wise-text-secondary">
          Booking ID: {bookingId} • {new Date().toLocaleDateString()}
        </p>
      </motion.div>

      {/* Premium Card Container */}
      <motion.div variants={itemVariants}>
        <Card variant="elevated" className="overflow-hidden">
          {/* Tabs Navigation */}
          <div className="p-6 pb-0">
            <Tabs
              items={tabItems}
              value={activeTab}
              onChange={setActiveTab}
              className="mb-6"
            />
          </div>

          {/* Tabs Content */}
          <div className="px-6 pb-6">
            <AnimatePresence mode="wait">
              {tabItems.map(
                (tab) =>
                  tab.value === activeTab && (
                    <motion.div
                      key={tab.value}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tab.content}
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowScheduleFollowUp(!showScheduleFollowUp)}
        >
          <Calendar className="w-4 h-4" />
          Schedule Follow-up
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={shareViaEmail}
        >
          <Share2 className="w-4 h-4" />
          {copiedEmail ? 'Email Prepared' : 'Share via Email'}
        </Button>
      </motion.div>

      {/* Follow-up Scheduling Section */}
      <AnimatePresence>
        {showScheduleFollowUp && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            <Card variant="elevated" className="p-6 border-l-2 border-wise-primary">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-wise-text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-wise-primary" />
                  Schedule Next Follow-up
                </h3>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="datetime-local"
                      value={followUpDate}
                      onChange={(e) => setFollowUpDate(e.target.value)}
                      className="w-full bg-wise-surface/50 border border-wise-primary/30 rounded-lg px-4 py-2.5 text-wise-text-primary focus:outline-none focus:ring-2 focus:ring-wise-primary"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setShowScheduleFollowUp(false)
                      // Handle follow-up scheduling
                    }}
                  >
                    Confirm
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setShowScheduleFollowUp(false)}
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-sm text-wise-text-muted">
                  Scheduled for: {new Date(followUpDate).toLocaleString()}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Section */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Completion Stats */}
        <Card variant="elevated" className="p-6 text-center transition-colors hover:border-[#2CD588]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold text-wise-primary mb-2"
          >
            {actionItems.filter((a) => a.completed).length}/{actionItems.length}
          </motion.div>
          <p className="text-wise-text-secondary text-sm">
            Action Items Completed
          </p>
        </Card>

        {/* Owner Distribution */}
        <Card variant="elevated" className="p-6 text-center transition-colors hover:border-[#2CD588]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15 }}
            className="text-3xl font-bold text-wise-primary mb-2"
          >
            {actionItems.filter((a) => a.owner === 'user').length}
          </motion.div>
          <p className="text-wise-text-secondary text-sm">Your Assigned Tasks</p>
        </Card>

        {/* Follow-up Scheduled */}
        <Card variant="elevated" className="p-6 text-center transition-colors hover:border-[#2CD588]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-2"
          >
            <Calendar className="w-8 h-8 text-wise-primary mx-auto" />
          </motion.div>
          <p className="text-wise-text-secondary text-sm">
            Follow-up: {new Date(followUpDate).toLocaleDateString()}
          </p>
        </Card>
      </motion.div>
    </motion.div>
  )
}
