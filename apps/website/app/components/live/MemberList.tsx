'use client';

export function MemberList({ members }: any) {
  return (
    <div className="space-y-2">
      {members.length === 0 ? (
        <p className="text-sm text-gray-500">No members yet</p>
      ) : (
        members.map((member: any) => (
          <div
            key={member.userId}
            className="flex items-center gap-2 p-2 rounded bg-gray-800 hover:bg-gray-700"
          >
            <div
              className={`w-3 h-3 rounded-full ${
                member.isSpeaking ? 'bg-green-500' : 'bg-gray-600'
              }`}
            />
            <span className="text-sm flex-1 truncate">{member.userName}</span>
            {member.isMuted && <span className="text-xs text-gray-500">🔇</span>}
          </div>
        ))
      )}
    </div>
  );
}
