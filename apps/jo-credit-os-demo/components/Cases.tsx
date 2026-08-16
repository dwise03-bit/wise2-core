'use client';

import { CheckCircle2, Clock, Send, FileText } from 'lucide-react';

export default function Cases() {
  const caseStages = [
    { id: 1, label: 'Draft', step: 1 },
    { id: 2, label: 'Review', step: 2 },
    { id: 3, label: 'Submitted', step: 3 },
    { id: 4, label: 'Awaiting Response', step: 4 },
    { id: 5, label: 'Resolved', step: 5 },
  ];

  const cases = [
    {
      id: 1,
      account: 'Capital One - Balance Discrepancy',
      recipient: 'Equifax (CRA)',
      issue: 'Balance reported as $2,450 on Equifax, $1,800 on Experian',
      stage: 'Awaiting Response',
      stageIndex: 3,
      sent: 'Aug 16',
      responseWindow: 'Aug 30 (14 days)',
      result: null,
    },
    {
      id: 2,
      account: 'Chase - Payment Status',
      recipient: 'TransUnion (CRA)',
      issue: 'Showing as 30 days late when payment was made',
      stage: 'Submitted',
      stageIndex: 2,
      sent: 'Aug 14',
      responseWindow: 'Aug 28 (14 days)',
      result: null,
    },
    {
      id: 3,
      account: 'Medical - Potential Duplicate',
      recipient: 'Equifax (CRA)',
      issue: 'Same collection account appearing twice on report',
      stage: 'Draft',
      stageIndex: 0,
      sent: null,
      responseWindow: null,
      result: null,
    },
    {
      id: 4,
      account: 'Citibank - Incorrect Status',
      recipient: 'Experian (CRA)',
      issue: 'Account showing as open when it was closed 6 months ago',
      stage: 'Resolved',
      stageIndex: 4,
      sent: 'Aug 1',
      responseWindow: 'Resolved Aug 15',
      result: 'Corrected',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispute Cases</h1>
        <p className="text-gray-600">Track your disputes with credit reporting agencies and furnishers.</p>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {cases.map((caseItem) => (
          <div key={caseItem.id} className="bg-white rounded-lg p-6 shadow-sm overflow-hidden">
            {/* Case Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{caseItem.account}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Send size={16} />
                  <span>{caseItem.recipient}</span>
                </div>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">{caseItem.issue}</p>
              </div>
              <div className="ml-4 text-right">
                <span
                  className={`px-4 py-2 rounded-lg font-medium text-sm ${
                    caseItem.stage === 'Draft'
                      ? 'bg-gray-100 text-gray-700'
                      : caseItem.stage === 'Submitted'
                      ? 'bg-blue-100 text-blue-700'
                      : caseItem.stage === 'Awaiting Response'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {caseItem.stage}
                </span>
              </div>
            </div>

            {/* Workflow Stage Indicator */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                {caseStages.map((stage, idx) => (
                  <div key={stage.id} className="flex-1 flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                        idx <= caseItem.stageIndex
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    {idx < caseStages.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-1 ${
                          idx < caseItem.stageIndex ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                {caseStages.map((stage) => (
                  <span key={stage.id}>{stage.label}</span>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {caseItem.sent && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Sent</p>
                  <p className="font-medium text-gray-900">{caseItem.sent}</p>
                </div>
              )}
              {caseItem.responseWindow && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Expected Response</p>
                  <p className="font-medium text-gray-900">{caseItem.responseWindow}</p>
                </div>
              )}
              {caseItem.result && (
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Result</p>
                  <p className="font-medium text-green-600">{caseItem.result}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2 pt-4 border-t border-gray-200">
              {caseItem.stage === 'Draft' && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                  Review & Submit
                </button>
              )}
              {caseItem.stage === 'Awaiting Response' && (
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">
                  <FileText size={16} className="inline mr-2" />
                  Upload Response
                </button>
              )}
              {caseItem.stage === 'Resolved' && (
                <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  <CheckCircle2 size={16} className="inline mr-2" />
                  Case Closed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
