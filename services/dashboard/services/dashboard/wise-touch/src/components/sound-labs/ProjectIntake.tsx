'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { soundLabsFormFields } from '@/lib/sound-labs-data'

interface FormData {
  [key: string]: string | boolean
}

export function ProjectIntake() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    business: '',
    email: '',
    phone: '',
    projectType: '',
    packageInterest: '',
    deadline: '',
    budget: '',
    direction: '',
    references: '',
    consent: false,
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target
    if (type === 'checkbox') {
      const input = e.target as HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: input.checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: e.target.value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Connect to actual backend/form service
      // For now, this is wired for future integration
      console.log('Form submission:', formData)

      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSubmitted(true)
      setFormData({
        name: '',
        business: '',
        email: '',
        phone: '',
        projectType: '',
        packageInterest: '',
        deadline: '',
        budget: '',
        direction: '',
        references: '',
        consent: false,
      })

      // Reset after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-20 md:py-32 px-6 md:px-8 bg-bg-secondary">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-chrome-light">
            Start Your Project
          </h2>
          <p className="text-chrome-dark text-lg">
            Tell us about your vision. We'll respond within 24 hours with next steps.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.form
          onSubmit={handleSubmit}
          className="hud-panel-accent p-8 md:p-12 rounded-lg space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            {soundLabsFormFields.map((field) => {
              if (field.type === 'checkbox') {
                return (
                  <label key={field.name} className="md:col-span-2 flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name={field.name}
                      checked={(formData[field.name] as boolean) || false}
                      onChange={handleChange}
                      required={field.required}
                      className="mt-1 w-4 h-4 rounded border border-blue-electric/50 accent-blue-electric"
                    />
                    <span className="text-sm text-chrome-light">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                  </label>
                )
              }

              if (field.type === 'textarea') {
                return (
                  <textarea
                    key={field.name}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] as string}
                    onChange={handleChange}
                    required={field.required}
                    className="md:col-span-2 px-4 py-3 rounded bg-bg-tertiary border border-steel text-chrome-light text-sm placeholder-chrome-dark focus:border-blue-electric focus:shadow-glow-blue focus:outline-none transition-all resize-none"
                    rows={5}
                  />
                )
              }

              if (field.type === 'select') {
                return (
                  <select
                    key={field.name}
                    name={field.name}
                    value={formData[field.name] as string}
                    onChange={handleChange}
                    required={field.required}
                    className="px-4 py-3 rounded bg-bg-tertiary border border-steel text-chrome-light text-sm focus:border-blue-electric focus:shadow-glow-blue focus:outline-none transition-all"
                  >
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-bg-primary">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )
              }

              return (
                <input
                  key={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.label}
                  value={formData[field.name] as string}
                  onChange={handleChange}
                  required={field.required}
                  className="px-4 py-3 rounded bg-bg-tertiary border border-steel text-chrome-light text-sm placeholder-chrome-dark focus:border-blue-electric focus:shadow-glow-blue focus:outline-none transition-all"
                />
              )
            })}
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || submitted}
            className="w-full py-4 rounded font-bold bg-blue-electric text-bg-primary hover:bg-blue-electric-light disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {submitted ? (
              <>
                <span>✓ Received! We'll be in touch.</span>
              </>
            ) : loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-bg-primary border-t-transparent rounded-full"
                />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Let's Create Together</span>
              </>
            )}
          </motion.button>

          {/* Support Note */}
          <p className="text-xs text-chrome-dark text-center">
            Questions before you submit? Call us or email sound-labs@wise2.net
            <br />
            <strong>Note:</strong> Integration with email backend still required—form collects data locally for now.
          </p>
        </motion.form>

        {/* Privacy & Legal Links */}
        <motion.div
          className="mt-8 text-center text-xs text-chrome-dark space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p>
            By submitting this form, you agree to our{' '}
            <a href="/privacy" className="text-blue-electric hover:underline">
              Privacy Policy
            </a>
            {' '}and{' '}
            <a href="/terms" className="text-blue-electric hover:underline">
              Terms of Service
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
