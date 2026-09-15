'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const GPTWidget = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [gptData, setGptData] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchGPTData = async () => {
      try {
        const response = await fetch('/api/command-center/gpt/link');
        if (response.ok) {
          const data = await response.json();
          setGptData(data);
        }
      } catch (error) {
        console.error('Failed to load GPT data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGPTData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-200/30 animate-pulse">
        <div className="h-12 bg-gradient-to-r from-blue-300 to-purple-300 rounded opacity-30" />
      </div>
    );
  }

  if (!gptData) return null;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-blue-100/50 dark:hover:bg-blue-900/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-blue-600 dark:text-blue-400" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {gptData.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              AI-powered operations assistant
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-blue-200/50 dark:border-blue-800/50 p-4 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {gptData.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {gptData.integrations?.map((integration: string) => (
              <span
                key={integration}
                className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
              >
                {integration.replace('_', ' ')}
              </span>
            ))}
          </div>

          <Link
            href={gptData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all transform hover:scale-105"
          >
            Open GPT →
          </Link>

          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-blue-200/30 dark:border-blue-800/30">
            <p className="font-medium mb-1">Quick Actions:</p>
            <ul className="space-y-1">
              <li>• Get today's revenue & KPIs</li>
              <li>• Analyze job performance</li>
              <li>• Review team utilization</li>
              <li>• Explore AI recommendations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default GPTWidget;
