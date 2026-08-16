'use client';

import { CheckCircle2, Circle, AlertCircle, TrendingUp } from 'lucide-react';

export default function ActionPlan() {
  const actionPlan = [
    {
      category: 'Payment Consistency',
      icon: '💳',
      progress: 75,
      tasks: [
        { id: 1, title: 'Set up autopay for all open accounts', priority: 'high', status: 'in-progress' },
        { id: 2, title: 'Make on-time payment to Capital One', priority: 'high', status: 'completed' },
        { id: 3, title: 'Review payment history for missed dates', priority: 'medium', status: 'completed' },
      ],
    },
    {
      category: 'Revolving Utilization',
      icon: '📊',
      progress: 50,
      tasks: [
        { id: 4, title: 'Pay down Chase card to below 30% utilization', priority: 'high', status: 'in-progress' },
        { id: 5, title: 'Request credit limit increase on Capital One', priority: 'medium', status: 'pending' },
        { id: 6, title: 'Monitor monthly utilization', priority: 'low', status: 'pending' },
      ],
    },
    {
      category: 'Account Maintenance',
      icon: '🏦',
      progress: 60,
      tasks: [
        { id: 7, title: 'Keep oldest accounts open', priority: 'high', status: 'completed' },
        { id: 8, title: 'Review accounts for fraud/errors', priority: 'medium', status: 'in-progress' },
      ],
    },
    {
      category: 'New Credit Restraint',
      icon: '🚫',
      progress: 100,
      tasks: [
        { id: 9, title: 'Avoid opening new credit accounts', priority: 'high', status: 'completed' },
        { id: 10, title: 'Minimize hard inquiries', priority: 'medium', status: 'completed' },
      ],
    },
    {
      category: 'Report Accuracy',
      icon: '✓',
      progress: 40,
      tasks: [
        { id: 11, title: 'Resolve identified discrepancies', priority: 'high', status: 'in-progress' },
        { id: 12, title: 'Monitor credit reports monthly', priority: 'medium', status: 'pending' },
      ],
    },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <CheckCircle2 size={18} className="text-green-600" />;
    } else if (status === 'in-progress') {
      return <Circle size={18} className="text-blue-600 fill-blue-100" />;
    } else {
      return <Circle size={18} className="text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'text-green-600 bg-green-50';
    if (status === 'in-progress') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Action Plan</h1>
        <p className="text-gray-600">Your personalized credit improvement plan. Complete these tasks to improve your score.</p>
      </div>

      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Overall Progress</h2>
          <TrendingUp className="text-green-600" size={24} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-700">65% Complete</span>
            <span className="text-gray-600">13 of 20 tasks</span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 h-full w-2/3" />
          </div>
        </div>
      </div>

      {/* Action Categories */}
      <div className="space-y-4">
        {actionPlan.map((category, catIdx) => (
          <div key={catIdx} className="bg-white rounded-lg p-6 shadow-sm">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{category.category}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">{category.progress}% Complete</p>
                <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-teal-600 h-full transition-all"
                    style={{ width: `${category.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              {category.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${getStatusColor(task.status)}`}
                >
                  <div className="mt-1 flex-shrink-0">{getStatusIcon(task.status)}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    {task.priority && (
                      <span
                        className={`text-xs font-semibold mt-1 inline-block px-2 py-1 rounded ${
                          task.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {task.priority} priority
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap capitalize">
                    {task.status === 'in-progress' ? 'In Progress' : task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">💡 Pro Tips</h4>
            <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
              <li>Paying down revolving balances can have an immediate positive impact on your score</li>
              <li>Consistent on-time payments are the most important factor for credit improvement</li>
              <li>Avoid opening new accounts while disputes are being resolved</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
