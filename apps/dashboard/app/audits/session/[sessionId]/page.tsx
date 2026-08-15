'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AuditRecorder from '../../../components/audits/AuditRecorder';
import RecordingsList from '../../../components/audits/RecordingsList';
import RecordingPlayer from '../../../components/audits/RecordingPlayer';

interface AuditSession {
  id: string;
  clientName: string;
  auditTopic: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export default function AuditSessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<AuditSession | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Fetch session details from booking
        // This is stubbed - will fetch from API
        setSession({
          id: sessionId,
          clientName: 'Acme Corp',
          auditTopic: 'SOC 2 Type II Compliance Audit',
          status: 'SCHEDULED',
          notes: 'Initial scope assessment',
        });
      } catch (err) {
        setError('Failed to load audit session');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">{error || 'Session not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{session.clientName}</h1>
              <p className="text-slate-400">{session.auditTopic}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              session.status === 'IN_PROGRESS' ? 'bg-red-600' :
              session.status === 'COMPLETED' ? 'bg-green-600' :
              'bg-slate-700'
            }`}>
              {session.status.replace(/_/g, ' ')}
            </div>
          </div>

          {/* Timing info */}
          <div className="text-slate-400 text-sm">
            {session.startedAt && (
              <p>Started: {new Date(session.startedAt).toLocaleString()}</p>
            )}
            {session.status === 'IN_PROGRESS' && (
              <p className="mt-2 text-green-400 font-semibold">Audit in progress...</p>
            )}
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recorder (left/top) */}
          <div className="lg:col-span-2">
            <AuditRecorder sessionId={sessionId} />
          </div>

          {/* Recordings list (right/bottom) */}
          <div className="lg:col-span-1">
            <RecordingsList
              sessionId={sessionId}
              selectedId={selectedRecording}
              onSelect={setSelectedRecording}
            />
          </div>
        </div>

        {/* Recording player (if selected) */}
        {selectedRecording && (
          <div className="mt-8">
            <RecordingPlayer
              sessionId={sessionId}
              recordingId={selectedRecording}
            />
          </div>
        )}
      </div>
    </div>
  );
}
