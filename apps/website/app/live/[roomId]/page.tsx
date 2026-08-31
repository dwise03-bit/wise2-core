'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { LiveRoomHeader } from '@/app/components/live/LiveRoomHeader';
import { StreamView } from '@/app/components/live/StreamView';
import { MemberList } from '@/app/components/live/MemberList';
import { LiveChat } from '@/app/components/live/LiveChat';
import { PollsWidget } from '@/app/components/live/PollsWidget';
import { SuggestionsWidget } from '@/app/components/live/SuggestionsWidget';
import { CrowdMode } from '@/app/components/live/CrowdMode';

/**
 * Live Room Page (Task 7.1)
 * Main page for live streaming experience
 * Responsive: Desktop 2-column, Tablet stacked, Mobile single
 */

export default function LiveRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [room, setRoom] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket on mount
  useEffect(() => {
    const getToken = () => {
      // Get JWT from localStorage or cookie
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    };

    const token = getToken();
    if (!token) {
      router.push('/auth/signin');
      return;
    }

    // Connect to WebSocket
    const newSocket = io('/api/live/socket.io', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('[Live] Connected to WebSocket');
      setIsConnected(true);

      // Join room
      newSocket.emit('presence.join', {
        roomId,
        name: localStorage.getItem('userName') || 'Anonymous',
      });
    });

    newSocket.on('disconnect', () => {
      console.log('[Live] Disconnected from WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[Live] Connection error:', error);
      setError('Connection failed. Please refresh.');
    });

    // Presence events
    newSocket.on('presence.sync', (presence) => {
      setMembers(presence);
    });

    newSocket.on('presence.joined', (user) => {
      setMembers((prev) => [...prev, user]);
    });

    newSocket.on('presence.left', ({ userId }) => {
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    });

    newSocket.on('presence.updated', ({ userId, isSpeaking, isMuted }) => {
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === userId ? { ...m, isSpeaking, isMuted } : m
        )
      );
    });

    // Chat events
    newSocket.on('chat.message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Poll events
    newSocket.on('poll.voted', ({ optionId, votes }) => {
      setPolls((prev) =>
        prev.map((p) => ({
          ...p,
          options: p.options.map((opt: any) =>
            opt.id === optionId ? { ...opt, votes } : opt
          ),
        }))
      );
    });

    // Suggestion events
    newSocket.on('suggestion.voted', ({ suggestionId, votes }) => {
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, votes } : s))
      );
    });

    // Crowd reactions
    newSocket.on('crowd.reactions', (reactionCounts) => {
      setReactions(reactionCounts);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, router]);

  // Fetch room details
  useEffect(() => {
    if (!isConnected) return;

    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/v1/sound-labs/live/rooms/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        console.error('Failed to fetch room:', err);
      }
    };

    fetchRoom();
  }, [roomId, isConnected]);

  // Fetch initial chat history
  useEffect(() => {
    if (!isConnected) return;

    const fetchChat = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(
          `/api/v1/sound-labs/live/rooms/${roomId}/chat?limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setMessages(data.reverse());
      } catch (err) {
        console.error('Failed to fetch chat:', err);
      }
    };

    fetchChat();
  }, [roomId, isConnected]);

  // Fetch initial polls and suggestions
  useEffect(() => {
    if (!isConnected) return;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const pollRes = await fetch(
          `/api/v1/sound-labs/live/rooms/${roomId}/polls`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const pollData = await pollRes.json();
        setPolls(pollData);

        const sugRes = await fetch(
          `/api/v1/sound-labs/live/rooms/${roomId}/suggestions?orderBy=votes`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const sugData = await sugRes.json();
        setSuggestions(sugData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [roomId, isConnected]);

  if (!room) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white">Loading room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <LiveRoomHeader
        room={room}
        memberCount={members.length}
        isLive={room.status === 'live'}
      />

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-7xl mx-auto">
        {/* Left: Stream + Crowd Mode */}
        <div className="flex-1 flex flex-col gap-4">
          <StreamView room={room} />
          {reactions && Object.keys(reactions).length > 0 && (
            <CrowdMode reactions={reactions} />
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4">
          {/* Member List */}
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h3 className="font-bold mb-3 text-sm text-gray-300">
              Members ({members.length})
            </h3>
            <MemberList members={members} />
          </div>

          {/* Active Polls */}
          {polls.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="font-bold mb-3 text-sm text-gray-300">Polls</h3>
              <PollsWidget
                polls={polls}
                socket={socket}
                roomId={roomId}
              />
            </div>
          )}

          {/* Top Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
              <h3 className="font-bold mb-3 text-sm text-gray-300">
                Suggestions
              </h3>
              <SuggestionsWidget
                suggestions={suggestions}
                socket={socket}
                roomId={roomId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat (Full Width Below) */}
      <div className="border-t border-gray-800 mt-4">
        <LiveChat
          roomId={roomId}
          messages={messages}
          socket={socket}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}
