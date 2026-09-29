'use client';

export function LiveRoomHeader({ room, memberCount, isLive }: any) {
  return (
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {memberCount} members {isLive && <span className="ml-2">🔴 LIVE</span>}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">{room.slug}</p>
        </div>
      </div>
    </div>
  );
}
