'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Template, DesignElement } from '../types/web-design';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
  onClose: () => void;
}

/**
 * Template Selector Modal
 * 5 professional templates: Landing, Portfolio, Services, About, Contact
 */
export default function TemplateSelector({
  onSelect,
  onClose,
}: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  const templates: Template[] = [
    {
      id: 'landing',
      name: 'Landing Page',
      description: 'Perfect for promoting products or services',
      category: 'landing',
      colors: {
        primary: '#2563eb',
        secondary: '#1e40af',
        accent: '#dbeafe',
        background: '#ffffff',
        text: '#1f2937',
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      elements: [
        {
          id: 'hero',
          type: 'container',
          label: 'Hero Section',
          content: 'Welcome to Our Product',
          styles: {
            width: '100%',
            padding: '80px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            textAlign: 'center',
            minHeight: '500px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
          },
        },
        {
          id: 'features',
          type: 'container',
          label: 'Features Section',
          content: 'Our Key Features',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#f9fafb',
          },
        },
        {
          id: 'cta',
          type: 'container',
          label: 'Call to Action',
          content: 'Get Started Today',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            textAlign: 'center',
          },
        },
      ],
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Showcase your work and projects',
      category: 'portfolio',
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        accent: '#ede9fe',
        background: '#ffffff',
        text: '#1f2937',
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      elements: [
        {
          id: 'header',
          type: 'container',
          label: 'Header',
          content: 'My Portfolio',
          styles: {
            width: '100%',
            padding: '40px 24px',
            borderBottom: '2px solid #8b5cf6',
            fontSize: '32px',
            fontWeight: 'bold',
          },
        },
        {
          id: 'gallery',
          type: 'container',
          label: 'Portfolio Gallery',
          styles: {
            width: '100%',
            padding: '60px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          },
        },
        {
          id: 'contact',
          type: 'container',
          label: 'Contact Section',
          content: 'Get in Touch',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#f3e8ff',
            textAlign: 'center',
          },
        },
      ],
    },
    {
      id: 'services',
      name: 'Services',
      description: 'Display your services and pricing',
      category: 'services',
      colors: {
        primary: '#06b6d4',
        secondary: '#0891b2',
        accent: '#cffafe',
        background: '#ffffff',
        text: '#1f2937',
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      elements: [
        {
          id: 'services-hero',
          type: 'container',
          label: 'Services Hero',
          content: 'Our Services',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#06b6d4',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
          },
        },
        {
          id: 'service-cards',
          type: 'container',
          label: 'Service Cards',
          styles: {
            width: '100%',
            padding: '60px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          },
        },
        {
          id: 'pricing',
          type: 'container',
          label: 'Pricing Section',
          content: 'Pricing Plans',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#f0f9fa',
          },
        },
      ],
    },
    {
      id: 'about',
      name: 'About',
      description: 'Tell your story and build trust',
      category: 'about',
      colors: {
        primary: '#ec4899',
        secondary: '#db2777',
        accent: '#fbcfe8',
        background: '#ffffff',
        text: '#1f2937',
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      elements: [
        {
          id: 'about-hero',
          type: 'container',
          label: 'About Hero',
          content: 'About Us',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#ec4899',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
          },
        },
        {
          id: 'story',
          type: 'container',
          label: 'Our Story',
          content: 'Our Story and Mission',
          styles: {
            width: '100%',
            padding: '60px 24px',
            maxWidth: '800px',
            margin: '0 auto',
          },
        },
        {
          id: 'team',
          type: 'container',
          label: 'Team Section',
          content: 'Meet Our Team',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#fce7f3',
          },
        },
      ],
    },
    {
      id: 'contact',
      name: 'Contact',
      description: 'Collect inquiries and messages',
      category: 'contact',
      colors: {
        primary: '#14b8a6',
        secondary: '#0d9488',
        accent: '#ccfbf1',
        background: '#ffffff',
        text: '#1f2937',
      },
      fonts: {
        heading: 'Inter, system-ui, sans-serif',
        body: 'Inter, system-ui, sans-serif',
      },
      elements: [
        {
          id: 'contact-hero',
          type: 'container',
          label: 'Contact Hero',
          content: 'Get in Touch',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#14b8a6',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
          },
        },
        {
          id: 'contact-form',
          type: 'form',
          label: 'Contact Form',
          styles: {
            width: '100%',
            maxWidth: '500px',
            margin: '60px auto',
            padding: '40px',
            backgroundColor: '#f0fdfa',
            borderRadius: '8px',
          },
        },
        {
          id: 'contact-info',
          type: 'container',
          label: 'Contact Info',
          styles: {
            width: '100%',
            padding: '60px 24px',
            backgroundColor: '#f0fdfa',
            textAlign: 'center',
          },
        },
      ],
    },
  ];

  const selectedTemplate =
    templates.find((t) => t.id === selectedCategory) || null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8 max-h-[90vh] overflow-y-auto">
            {!selectedTemplate ? (
              <>
                {/* Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Choose a Template
                  </h1>
                  <p className="text-gray-600">
                    Start with a professionally designed template or create from
                    scratch
                  </p>
                </div>

                {/* Template Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {templates.map((template) => (
                    <motion.button
                      key={template.id}
                      onClick={() => setSelectedCategory(template.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition text-center"
                    >
                      <div
                        className="h-32 rounded mb-3 flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: template.colors.primary }}
                      >
                        {template.name}
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {template.name}
                      </p>
                    </motion.button>
                  ))}

                  {/* Blank Template */}
                  <motion.button
                    onClick={() => onClose()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 hover:shadow-lg transition text-center"
                  >
                    <div className="h-32 rounded mb-3 flex items-center justify-center bg-gray-100">
                      <span className="text-3xl">+</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Blank
                    </p>
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                {/* Template Details */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mb-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  ← Back to Templates
                </button>

                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedTemplate.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {selectedTemplate.description}
                  </p>

                  {/* Color Preview */}
                  <div className="flex gap-4 mb-6">
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{
                        backgroundColor: selectedTemplate.colors.primary,
                      }}
                      title="Primary"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{
                        backgroundColor: selectedTemplate.colors.secondary,
                      }}
                      title="Secondary"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{
                        backgroundColor: selectedTemplate.colors.accent,
                      }}
                      title="Accent"
                    />
                    <div
                      className="w-12 h-12 rounded border-2 border-gray-200"
                      style={{
                        backgroundColor: selectedTemplate.colors.background,
                      }}
                      title="Background"
                    />
                  </div>

                  <div className="bg-gray-100 rounded-lg p-6 mb-6">
                    <h3 className="font-medium text-gray-900 mb-3">
                      Included Sections:
                    </h3>
                    <ul className="space-y-2">
                      {selectedTemplate.elements.map((element) => (
                        <li
                          key={element.id}
                          className="flex items-center gap-2 text-gray-700"
                        >
                          <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          {element.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => onSelect(selectedTemplate)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      Use This Template
                    </motion.button>
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-6 py-3 border border-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
