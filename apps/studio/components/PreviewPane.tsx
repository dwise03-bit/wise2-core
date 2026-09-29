'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useWebDesignBuilder } from '../hooks/useWebDesignBuilder';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

/**
 * Live Preview Pane
 * Shows responsive preview of the design
 */
export default function PreviewPane() {
  const store = useWebDesignBuilder();
  const [viewport, setViewport] = useState<ViewportSize>('desktop');

  const viewportSizes = {
    desktop: { width: 1024, height: 768, label: '💻 Desktop' },
    tablet: { width: 768, height: 1024, label: '📱 Tablet' },
    mobile: { width: 375, height: 667, label: '📲 Mobile' },
  };

  const currentViewport = viewportSizes[viewport];

  const generatePreviewHTML = useMemo(() => {
    const renderElement = (element: any, depth: number = 0): string => {
      const styles = Object.entries(element.styles)
        .map(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          return `${cssKey}: ${value}`;
        })
        .join('; ');

      let html = `<div id="${element.id}" style="${styles}">`;

      if (element.content) {
        html += element.content;
      }

      if (element.children && element.children.length > 0) {
        element.children.forEach((child: any) => {
          html += renderElement(child, depth + 1);
        });
      }

      html += '</div>';

      return html;
    };

    const css = `
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: ${store.project.fonts.body};
        color: ${store.project.colors.text};
        background-color: ${store.project.colors.background};
        line-height: 1.6;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: ${store.project.fonts.heading};
      }
    `;

    const bodyContent = store.project.elements
      .map((el) => renderElement(el))
      .join('');

    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${css}</style>
      </head>
      <body>${bodyContent}</body>
    </html>`;
  }, [store.project]);

  return (
    <div className="h-full flex flex-col bg-gray-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-gray-750">
        <h3 className="font-semibold text-white text-sm mb-3">
          Live Preview
        </h3>

        {/* Viewport Selector */}
        <div className="flex gap-2">
          {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => (
            <motion.button
              key={size}
              onClick={() => setViewport(size)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1 text-xs font-medium rounded transition ${
                viewport === size
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {viewportSizes[size].label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto flex items-start justify-center py-8 px-4 bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          className="bg-white rounded-lg shadow-2xl flex-shrink-0"
          style={{
            width: currentViewport.width,
            height: currentViewport.height,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Device Frame */}
          <div className="w-full h-full overflow-hidden rounded-lg flex flex-col">
            {/* Status Bar (for mobile) */}
            {viewport === 'mobile' && (
              <div className="h-6 bg-black flex items-center px-4 text-white text-xs">
                <span className="flex-1">9:41</span>
                <span>📶 📡 🔋</span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <iframe
                srcDoc={generatePreviewHTML}
                className="w-full h-full border-none bg-white"
                title="Preview"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 border-t border-gray-700 bg-gray-750 text-xs text-gray-400">
        <p>
          {currentViewport.width}x{currentViewport.height}px •{' '}
          {store.project.elements.length} elements
        </p>
      </div>
    </div>
  );
}
