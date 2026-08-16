'use client';

interface Session {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
  title?: string;
  description?: string;
}

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <p className="font-semibold text-gray-900">
        {session.date} at {session.time}
      </p>
      <p className="text-sm text-gray-600 capitalize mt-1">{session.type} session</p>
      {session.title && (
        <p className="text-sm text-gray-700 mt-2">{session.title}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full capitalize">
          {session.status}
        </span>
      </div>
    </div>
  );
}
