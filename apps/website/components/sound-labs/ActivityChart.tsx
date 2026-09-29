'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';

interface ActivityDataPoint {
  date: string;
  projects: number;
  recordings: number;
}

interface ActivityChartProps {
  data: ActivityDataPoint[];
  height?: number;
}

export function ActivityChart({ data, height = 200 }: ActivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="text-center text-wise-text-muted">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activity data yet</p>
        </div>
      </div>
    );
  }

  const maxProjects = Math.max(...data.map((d) => d.projects), 1);
  const maxRecordings = Math.max(...data.map((d) => d.recordings), 1);

  return (
    <div className="space-y-4">
      <div
        className="flex items-end gap-2 justify-between px-2"
        style={{ height: `${height}px` }}
      >
        {data.map((point, idx) => {
          const projectHeight = (point.projects / maxProjects) * 100;
          const recordingHeight = (point.recordings / maxRecordings) * 100;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center gap-1 group"
              title={`${point.date}: ${point.projects} projects, ${point.recordings} recordings`}
            >
              {/* Recordings bar (purple) */}
              {recordingHeight > 0 && (
                <div
                  className="w-full bg-purple-500/60 rounded-t transition-all duration-200 group-hover:bg-purple-400"
                  style={{ height: `${recordingHeight}%`, minHeight: '2px' }}
                />
              )}
              {/* Projects bar (blue) */}
              {projectHeight > 0 && (
                <div
                  className="w-full bg-blue-500/60 rounded transition-all duration-200 group-hover:bg-blue-400"
                  style={{ height: `${projectHeight}%`, minHeight: '2px' }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-4 text-xs text-wise-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span>Projects</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full" />
          <span>Recordings</span>
        </div>
      </div>
    </div>
  );
}
