'use client';

import type { Socket } from 'socket.io-client';

export function PollsWidget({
  polls,
  socket,
  roomId,
}: {
  polls: any[];
  socket: Socket | null;
  roomId: string;
}) {
  const handleVote = (optionId: string) => {
    if (!socket) return;
    socket.emit('poll.vote', { roomId, optionId });
  };

  if (polls.length === 0) return null;

  const poll = polls[0];
  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{poll.question}</p>
      {poll.options.map((option: any) => (
        <button
          key={option.id}
          onClick={() => handleVote(option.id)}
          className="w-full text-left p-2 rounded bg-gray-800 hover:bg-gray-700 transition"
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">{option.text}</span>
            <span className="text-xs text-gray-400">{option.votes}</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-1 mt-1">
            <div
              className="bg-blue-500 h-1 rounded-full"
              style={{
                width: totalVotes > 0 ? `${(option.votes / totalVotes) * 100}%` : '0%',
              }}
            />
          </div>
        </button>
      ))}
    </div>
  );
}
