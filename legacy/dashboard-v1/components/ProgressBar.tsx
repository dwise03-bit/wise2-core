'use client';

interface ProgressData {
  total_drills: number;
  completed_drills: number;
  quiz_score: number | null;
}

interface ProgressBarProps {
  progress: ProgressData;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const drillPercentage = progress.total_drills > 0
    ? Math.round((progress.completed_drills / progress.total_drills) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-6">Your Progress</h3>

      <div className="space-y-6">
        {/* Drills section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Drills Completed
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {progress.completed_drills}/{progress.total_drills}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${drillPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{drillPercentage}% complete</p>
        </div>

        {/* Quiz score section */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Average Quiz Score
            </label>
            <span className="text-sm font-semibold text-gray-900">
              {progress.quiz_score !== null ? `${progress.quiz_score}%` : 'No score yet'}
            </span>
          </div>
          {progress.quiz_score !== null && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.quiz_score}%` }}
              />
            </div>
          )}
          {progress.quiz_score === null && (
            <div className="w-full bg-gray-200 rounded-full h-2.5" />
          )}
        </div>
      </div>
    </div>
  );
}
