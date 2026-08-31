'use client';

import type { Socket } from 'socket.io-client';

export function SuggestionsWidget({
  suggestions,
  socket,
  roomId,
}: {
  suggestions: any[];
  socket: Socket | null;
  roomId: string;
}) {
  const handleVote = (id: string) => {
    if (!socket) return;
    socket.emit('suggestion.vote', { roomId, suggestionId: id });
  };

  return (
    <div className="space-y-2">
      {suggestions.slice(0, 5).map((sug: any) => (
        <div
          key={sug.id}
          className="p-2 rounded bg-gray-800 hover:bg-gray-700 transition"
        >
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm flex-1">{sug.suggestion}</span>
            <button
              onClick={() => handleVote(sug.id)}
              className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 whitespace-nowrap"
            >
              👍 {sug.votes}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
