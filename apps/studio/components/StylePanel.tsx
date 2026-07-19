'use client';

import React, { useState } from 'react';
import { useWebDesignBuilder } from '../hooks/useWebDesignBuilder';
import { AnimationConfig, ElementStyle } from '../types/web-design';

interface StylePanelProps {
  elementId: string;
}

/**
 * Style Editor Panel
 * Colors, fonts, spacing, shadows, borders, animations
 */
export default function StylePanel({ elementId }: StylePanelProps) {
  const store = useWebDesignBuilder();
  const element = store.getElementById(elementId);
  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    typography: true,
    colors: true,
    effects: true,
    animations: false,
    responsive: false,
  });

  if (!element) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Element not found</p>
      </div>
    );
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateStyle = (updates: Partial<ElementStyle>) => {
    store.updateElementStyle(elementId, updates);
  };

  const StyleInput = ({
    label,
    value,
    onChange,
    type = 'text',
    options,
  }: {
    label: string;
    value: any;
    onChange: (value: any) => void;
    type?: string;
    options?: Array<{ label: string; value: string }>;
  }) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-300 mb-2">
        {label}
      </label>
      {options ? (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
        >
          <option value="">Default</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'color' ? (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded cursor-pointer"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1 px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value || undefined)}
          placeholder="auto"
          className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
        />
      )}
    </div>
  );

  const Section = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: keyof typeof expandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-700">
      <button
        onClick={() => toggleSection(id)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-700 transition text-left"
      >
        <span className="font-medium text-gray-300">{title}</span>
        <span className="text-gray-400">
          {expandedSections[id] ? '▼' : '▶'}
        </span>
      </button>
      {expandedSections[id] && (
        <div className="px-4 py-3 bg-gray-850 space-y-4 border-t border-gray-700">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-750">
        <h3 className="font-semibold text-white text-sm">
          {element.label}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{element.type}</p>
      </div>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Layout Section */}
        <Section title="Layout" id="layout">
          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Width"
              value={element.styles.width}
              onChange={(v) => updateStyle({ width: v })}
              placeholder="100%"
            />
            <StyleInput
              label="Height"
              value={element.styles.height}
              onChange={(v) => updateStyle({ height: v })}
              placeholder="auto"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <StyleInput
              label="Padding"
              value={element.styles.padding}
              onChange={(v) => updateStyle({ padding: v })}
              placeholder="16px"
            />
            <StyleInput
              label="Margin"
              value={element.styles.margin}
              onChange={(v) => updateStyle({ margin: v })}
              placeholder="0"
            />
          </div>

          <StyleInput
            label="Display"
            value={element.styles.display}
            onChange={(v) => updateStyle({ display: v as any })}
            options={[
              { label: 'Block', value: 'block' },
              { label: 'Flex', value: 'flex' },
              { label: 'Grid', value: 'grid' },
              { label: 'Inline Block', value: 'inline-block' },
            ]}
          />

          {element.styles.display === 'flex' && (
            <>
              <StyleInput
                label="Direction"
                value={element.styles.flexDirection}
                onChange={(v) => updateStyle({ flexDirection: v as any })}
                options={[
                  { label: 'Row', value: 'row' },
                  { label: 'Column', value: 'column' },
                ]}
              />
              <StyleInput
                label="Gap"
                value={element.styles.gap}
                onChange={(v) => updateStyle({ gap: v })}
                placeholder="16px"
              />
            </>
          )}
        </Section>

        {/* Typography Section */}
        <Section title="Typography" id="typography">
          <StyleInput
            label="Font Size"
            value={element.styles.fontSize}
            onChange={(v) => updateStyle({ fontSize: v })}
            placeholder="16px"
          />

          <StyleInput
            label="Font Weight"
            value={element.styles.fontWeight}
            onChange={(v) => updateStyle({ fontWeight: v as any })}
            options={[
              { label: 'Normal (400)', value: '400' },
              { label: 'Medium (500)', value: '500' },
              { label: 'Semibold (600)', value: '600' },
              { label: 'Bold (700)', value: '700' },
            ]}
          />

          <StyleInput
            label="Line Height"
            value={element.styles.lineHeight}
            onChange={(v) => updateStyle({ lineHeight: v })}
            placeholder="1.6"
          />

          <StyleInput
            label="Text Align"
            value={element.styles.textAlign}
            onChange={(v) => updateStyle({ textAlign: v as any })}
            options={[
              { label: 'Left', value: 'left' },
              { label: 'Center', value: 'center' },
              { label: 'Right', value: 'right' },
              { label: 'Justify', value: 'justify' },
            ]}
          />
        </Section>

        {/* Colors Section */}
        <Section title="Colors" id="colors">
          <StyleInput
            label="Text Color"
            value={element.styles.color}
            onChange={(v) => updateStyle({ color: v })}
            type="color"
          />

          <StyleInput
            label="Background"
            value={element.styles.backgroundColor}
            onChange={(v) => updateStyle({ backgroundColor: v })}
            type="color"
          />

          <StyleInput
            label="Opacity"
            value={element.styles.opacity}
            onChange={(v) => updateStyle({ opacity: parseFloat(v) })}
            type="number"
            placeholder="1"
          />
        </Section>

        {/* Effects Section */}
        <Section title="Effects" id="effects">
          <StyleInput
            label="Border Radius"
            value={element.styles.borderRadius}
            onChange={(v) => updateStyle({ borderRadius: v })}
            placeholder="0"
          />

          <StyleInput
            label="Box Shadow"
            value={element.styles.boxShadow}
            onChange={(v) => updateStyle({ boxShadow: v })}
            placeholder="0 2px 8px rgba(0,0,0,0.1)"
          />

          <StyleInput
            label="Transform"
            value={element.styles.transform}
            onChange={(v) => updateStyle({ transform: v })}
            placeholder="scale(1) rotate(0deg)"
          />
        </Section>

        {/* Animations Section */}
        <Section title="Animations" id="animations">
          <StyleInput
            label="Animation Type"
            value={element.animation?.type}
            onChange={(v) => {
              if (v) {
                store.updateElementAnimation(elementId, {
                  type: v as any,
                  duration: element.animation?.duration || 300,
                  delay: element.animation?.delay || 0,
                  easing: element.animation?.easing || 'ease',
                });
              } else {
                store.updateElementAnimation(elementId, undefined);
              }
            }}
            options={[
              { label: 'Fade', value: 'fade' },
              { label: 'Slide In', value: 'slideIn' },
              { label: 'Scale In', value: 'scaleIn' },
              { label: 'Rotate In', value: 'rotateIn' },
              { label: 'Bounce In', value: 'bounceIn' },
              { label: 'Pulse', value: 'pulse' },
              { label: 'Wiggle', value: 'wiggle' },
              { label: 'Flip', value: 'flip' },
              { label: 'Zoom', value: 'zoom' },
            ]}
          />

          {element.animation && (
            <>
              <StyleInput
                label="Duration (ms)"
                value={element.animation.duration}
                onChange={(v) =>
                  store.updateElementAnimation(elementId, {
                    ...element.animation!,
                    duration: parseInt(v) || 300,
                  })
                }
                type="number"
              />

              <StyleInput
                label="Delay (ms)"
                value={element.animation.delay}
                onChange={(v) =>
                  store.updateElementAnimation(elementId, {
                    ...element.animation!,
                    delay: parseInt(v) || 0,
                  })
                }
                type="number"
              />

              <StyleInput
                label="Easing"
                value={element.animation.easing}
                onChange={(v) =>
                  store.updateElementAnimation(elementId, {
                    ...element.animation!,
                    easing: v as any,
                  })
                }
                options={[
                  { label: 'Ease', value: 'ease' },
                  { label: 'Ease In', value: 'easeIn' },
                  { label: 'Ease Out', value: 'easeOut' },
                  { label: 'Ease In Out', value: 'easeInOut' },
                  { label: 'Linear', value: 'linear' },
                ]}
              />
            </>
          )}
        </Section>

        {/* Responsive Section */}
        <Section title="Responsive" id="responsive">
          <p className="text-xs text-gray-400 mb-4">
            Customize styles for mobile and tablet views
          </p>

          <div className="border-b border-gray-700 pb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Mobile (max-width: 640px)
            </h4>
            <StyleInput
              label="Font Size"
              value={element.responsive?.mobile?.fontSize}
              onChange={(v) =>
                store.updateResponsiveStyle(elementId, 'mobile', {
                  fontSize: v,
                })
              }
              placeholder="inherit"
            />
            <StyleInput
              label="Padding"
              value={element.responsive?.mobile?.padding}
              onChange={(v) =>
                store.updateResponsiveStyle(elementId, 'mobile', {
                  padding: v,
                })
              }
              placeholder="inherit"
            />
          </div>

          <div className="pt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-3">
              Tablet (max-width: 1024px)
            </h4>
            <StyleInput
              label="Font Size"
              value={element.responsive?.tablet?.fontSize}
              onChange={(v) =>
                store.updateResponsiveStyle(elementId, 'tablet', {
                  fontSize: v,
                })
              }
              placeholder="inherit"
            />
            <StyleInput
              label="Padding"
              value={element.responsive?.tablet?.padding}
              onChange={(v) =>
                store.updateResponsiveStyle(elementId, 'tablet', {
                  padding: v,
                })
              }
              placeholder="inherit"
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
