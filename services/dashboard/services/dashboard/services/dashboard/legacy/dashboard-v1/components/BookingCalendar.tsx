'use client';

import { useState, useEffect } from 'react';

interface AvailableSession {
  id: number;
  date: string;
  time: string;
  type: string;
  title: string;
  student_ids: number[];
  status: string;
}

interface BookingCalendarProps {
  onSessionBooked?: (session: AvailableSession) => void;
}

export default function BookingCalendar({ onSessionBooked }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [sessions, setSessions] = useState<AvailableSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [bookingInProgress, setBookingInProgress] = useState<number | null>(null);

  // Fetch available sessions when date or type changes
  useEffect(() => {
    if (!selectedDate) {
      setSessions([]);
      return;
    }

    const fetchSessions = async () => {
      setLoading(true);
      setError('');

      try {
        let url = `/api/sessions/available?date=${selectedDate}`;
        if (sessionType) {
          url += `&type=${sessionType}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to fetch sessions');
          setSessions([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('An error occurred while fetching sessions');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [selectedDate, sessionType]);

  const handleBookSession = async (sessionId: number) => {
    setBookingError('');
    setSuccessMessage('');
    setBookingInProgress(sessionId);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setBookingError('Authentication required. Please log in.');
        setBookingInProgress(null);
        return;
      }

      const response = await fetch('/api/sessions/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setBookingError(data.error || 'Failed to book session');
        setBookingInProgress(null);
        return;
      }

      // Success
      setSuccessMessage(`${data.message}`);

      // Find and update the booked session
      const bookedSession = sessions.find((s) => s.id === sessionId);
      if (bookedSession && onSessionBooked) {
        onSessionBooked(bookedSession);
      }

      // Refresh the session list
      if (selectedDate) {
        let url = `/api/sessions/available?date=${selectedDate}`;
        if (sessionType) {
          url += `&type=${sessionType}`;
        }

        const refreshResponse = await fetch(url);
        if (refreshResponse.ok) {
          const refreshedSessions = await refreshResponse.json();
          setSessions(refreshedSessions);
        }
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error booking session:', err);
      setBookingError('An error occurred while booking the session');
    } finally {
      setBookingInProgress(null);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Date and Type Selection */}
      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Session Type (Optional)
          </label>
          <select
            id="type"
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="group">Group</option>
            <option value="private">Private</option>
            <option value="workshop">Workshop</option>
          </select>
        </div>
      </div>

      {/* Error Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {bookingError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {bookingError}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* Loading State */}
      {loading && selectedDate && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading sessions...</p>
        </div>
      )}

      {/* Sessions List */}
      {!loading && selectedDate && sessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Available Sessions - {selectedDate}
          </h3>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-gray-900">{session.time}</p>
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-white bg-blue-600 rounded">
                      {session.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{session.title}</p>
                </div>
                <button
                  onClick={() => handleBookSession(session.id)}
                  disabled={bookingInProgress === session.id}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {bookingInProgress === session.id ? 'Booking...' : 'Book'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Sessions Found */}
      {!loading && selectedDate && sessions.length === 0 && !error && (
        <div className="text-center py-8 text-gray-600">
          <p>No available sessions for the selected date.</p>
        </div>
      )}

      {/* Initial State */}
      {!selectedDate && (
        <div className="text-center py-8 text-gray-600">
          <p>Select a date to view available sessions.</p>
        </div>
      )}
    </div>
  );
}
