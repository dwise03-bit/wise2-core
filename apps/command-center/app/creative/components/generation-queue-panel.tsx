import React from 'react';

interface QueueItem {
  id: string;
  name: string;
  status: 'generating' | 'quality_check' | 'complete';
  progress: number;
  provider: string;
}

export function GenerationQueuePanel() {
  const [queue] = React.useState<QueueItem[]>([
    {
      id: '1',
      name: 'HVAC Pocket Node Commercial',
      status: 'generating',
      progress: 65,
      provider: 'Kling',
    },
    {
      id: '2',
      name: 'WISE Defense Training Video',
      status: 'quality_check',
      progress: 85,
      provider: 'Hailuo',
    },
  ]);

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
        <span className="text-2xl">⏳</span>
        Generation Queue ({queue.length})
      </h2>

      <div className="space-y-4">
        {queue.length > 0 ? (
          queue.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-slate-100">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.provider}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded font-medium ${
                    item.status === 'complete'
                      ? 'bg-green-500/20 text-green-400'
                      : item.status === 'quality_check'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                  }`}
                >
                  {item.status === 'complete' && '✓ Complete'}
                  {item.status === 'quality_check' && '🔍 QA'}
                  {item.status === 'generating' && '▶ Generating'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all"
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-right">{item.progress}%</p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <p>Queue is empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
