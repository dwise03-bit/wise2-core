'use client';

export function StreamView({ room }: any) {
  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden aspect-video flex items-center justify-center border border-gray-800">
      <div className="text-center">
        <div className="text-6xl mb-4">🎬</div>
        <p className="text-gray-400">
          {room.status === 'live'
            ? 'Stream will appear here'
            : 'Stream not started yet'}
        </p>
      </div>
    </div>
  );
}
