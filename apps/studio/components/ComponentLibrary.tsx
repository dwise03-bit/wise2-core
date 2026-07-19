'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWebDesignBuilder } from '../hooks/useWebDesignBuilder';
import { DesignElement, ElementType } from '../types/web-design';

/**
 * Component Library
 * Drag-from library of pre-made elements
 */
export default function ComponentLibrary() {
  const store = useWebDesignBuilder();
  const [expandedCategories, setExpandedCategories] = useState({
    text: true,
    layout: true,
    media: true,
    forms: true,
    advanced: false,
  });

  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Component templates
  const components: Record<string, { type: ElementType; templates: DesignElement[] }> = {
    text: {
      type: 'heading',
      templates: [
        {
          id: 'heading-1',
          type: 'heading',
          label: 'Heading 1',
          content: 'Your Heading Here',
          styles: {
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            color: '#1f2937',
          },
        },
        {
          id: 'heading-2',
          type: 'heading',
          label: 'Heading 2',
          content: 'Section Heading',
          styles: {
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1f2937',
          },
        },
        {
          id: 'paragraph',
          type: 'paragraph',
          label: 'Paragraph',
          content:
            'This is a paragraph of text. Add your content here. You can style the text using the style panel.',
          styles: {
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#374151',
            marginBottom: '16px',
          },
        },
      ],
    },
    layout: {
      type: 'container',
      templates: [
        {
          id: 'container',
          type: 'container',
          label: 'Container',
          content: 'Container Content',
          styles: {
            width: '100%',
            padding: '24px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            marginBottom: '16px',
          },
        },
        {
          id: 'divider',
          type: 'divider',
          label: 'Divider',
          styles: {
            borderTop: '1px solid #e5e7eb',
            margin: '24px 0',
          },
        },
        {
          id: 'card',
          type: 'card',
          label: 'Card',
          content: 'Card Title',
          styles: {
            width: '100%',
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '16px',
          },
        },
      ],
    },
    media: {
      type: 'image',
      templates: [
        {
          id: 'image',
          type: 'image',
          label: 'Image',
          src: 'https://via.placeholder.com/400x300',
          styles: {
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            marginBottom: '16px',
          },
        },
        {
          id: 'icon',
          type: 'icon',
          label: 'Icon',
          content: '⭐',
          styles: {
            fontSize: '48px',
            display: 'inline-block',
            marginRight: '8px',
          },
        },
      ],
    },
    forms: {
      type: 'form',
      templates: [
        {
          id: 'form',
          type: 'form',
          label: 'Form',
          styles: {
            width: '100%',
            maxWidth: '400px',
            padding: '24px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
          },
        },
        {
          id: 'form-label',
          type: 'form-label',
          label: 'Form Label',
          content: 'Label Text',
          styles: {
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
          },
        },
        {
          id: 'form-input',
          type: 'form-input',
          label: 'Text Input',
          styles: {
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            marginBottom: '12px',
          },
        },
        {
          id: 'button',
          type: 'button',
          label: 'Button',
          content: 'Click Me',
          styles: {
            padding: '10px 24px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '12px',
          },
        },
      ],
    },
    advanced: {
      type: 'container',
      templates: [
        {
          id: 'hero-section',
          type: 'container',
          label: 'Hero Section',
          content: 'Hero Content',
          styles: {
            width: '100%',
            padding: '80px 24px',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            textAlign: 'center',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          },
        },
        {
          id: 'two-column',
          type: 'container',
          label: 'Two Column Layout',
          styles: {
            width: '100%',
            display: 'grid',
            gap: '24px',
            gridTemplateColumns: '1fr 1fr',
            marginBottom: '24px',
          },
        },
        {
          id: 'testimonial',
          type: 'card',
          label: 'Testimonial Card',
          content: '"Great product!" - Customer Name',
          styles: {
            padding: '24px',
            backgroundColor: '#f0fdf4',
            borderLeft: '4px solid #16a34a',
            borderRadius: '0 6px 6px 0',
            fontStyle: 'italic',
            color: '#15803d',
          },
        },
      ],
    },
  };

  const LibraryCategory = ({
    title,
    categoryKey,
    items,
  }: {
    title: string;
    categoryKey: keyof typeof expandedCategories;
    items: DesignElement[];
  }) => (
    <div className="border-b border-gray-700">
      <button
        onClick={() => toggleCategory(categoryKey)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition text-left"
      >
        <span className="font-medium text-gray-300">{title}</span>
        <span className="text-gray-400">
          {expandedCategories[categoryKey] ? '▼' : '▶'}
        </span>
      </button>

      {expandedCategories[categoryKey] && (
        <div className="px-3 py-3 space-y-2 bg-gray-850 border-t border-gray-700">
          {items.map((component) => (
            <motion.div
              key={component.id}
              draggable
              onDragStart={(e) => {
                const newElement: DesignElement = {
                  ...component,
                  id: Math.random().toString(36).substr(2, 9),
                };
                e.dataTransfer?.setData('component', JSON.stringify(newElement));
              }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-700 hover:bg-gray-600 rounded cursor-move transition text-sm text-gray-200"
            >
              <p className="font-medium mb-1">{component.label}</p>
              <p className="text-xs text-gray-400">
                Drag to canvas
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-750">
        <h2 className="font-semibold text-white text-sm">
          Component Library
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Drag elements to canvas
        </p>
      </div>

      {/* Categories Scroll */}
      <div className="flex-1 overflow-y-auto">
        <LibraryCategory
          title="Text"
          categoryKey="text"
          items={components.text.templates}
        />
        <LibraryCategory
          title="Layout"
          categoryKey="layout"
          items={components.layout.templates}
        />
        <LibraryCategory
          title="Media"
          categoryKey="media"
          items={components.media.templates}
        />
        <LibraryCategory
          title="Forms"
          categoryKey="forms"
          items={components.forms.templates}
        />
        <LibraryCategory
          title="Advanced"
          categoryKey="advanced"
          items={components.advanced.templates}
        />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-gray-700 bg-gray-750 text-xs text-gray-400">
        <p>Tip: Drag components onto the canvas to add them to your design.</p>
      </div>
    </div>
  );
}
