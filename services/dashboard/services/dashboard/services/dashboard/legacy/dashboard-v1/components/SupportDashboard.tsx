'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface SupportStats {
  openTickets: number;
  totalConversations: number;
  avgResponseTime: number;
  escalationRate: number;
  averageRating: number;
}

interface Ticket {
  id: number;
  user_id: number;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: number;
  user_id: number;
  channel: string;
  status: string;
  created_at: string;
  message_count: number;
}

export default function SupportDashboard() {
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      setToken(storedToken);
      fetchData(storedToken);
    }
  }, []);

  const fetchData = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/support/stats', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setTickets(data.tickets);
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch support data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'text-red-500 bg-red-900 bg-opacity-20';
      case 'in_progress':
        return 'text-yellow-500 bg-yellow-900 bg-opacity-20';
      case 'resolved':
        return 'text-green-500 bg-green-900 bg-opacity-20';
      case 'closed':
        return 'text-gray-500 bg-gray-900 bg-opacity-20';
      default:
        return 'text-gray-400 bg-gray-900 bg-opacity-20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-900 bg-opacity-30';
      case 'high':
        return 'text-orange-600 bg-orange-900 bg-opacity-30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-900 bg-opacity-30';
      case 'low':
        return 'text-green-600 bg-green-900 bg-opacity-30';
      default:
        return 'text-gray-600 bg-gray-900 bg-opacity-30';
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading support data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Open Tickets</span>
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <div className="text-3xl font-bold text-neon-red">{stats.openTickets}</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Conversations</span>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <div className="text-3xl font-bold text-silver">{stats.totalConversations}</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Response Time</span>
              <Clock size={18} className="text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-silver">{Math.round(stats.avgResponseTime / 60)}m</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Escalation Rate</span>
              <TrendingUp size={18} className="text-orange-500" />
            </div>
            <div className="text-3xl font-bold text-silver">{stats.escalationRate.toFixed(1)}%</div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Avg Rating</span>
              <CheckCircle size={18} className="text-green-500" />
            </div>
            <div className="text-3xl font-bold text-silver">{stats.averageRating.toFixed(1)}/5 ⭐</div>
          </div>
        </div>
      )}

      {/* Open Tickets */}
      <div className="card">
        <h2 className="heading-silver text-2xl mb-6">Open Support Tickets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400">ID</th>
                <th className="text-left px-4 py-3 text-gray-400">Subject</th>
                <th className="text-left px-4 py-3 text-gray-400">Priority</th>
                <th className="text-left px-4 py-3 text-gray-400">Status</th>
                <th className="text-left px-4 py-3 text-gray-400">Created</th>
                <th className="text-left px-4 py-3 text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-4 text-center text-gray-400">
                    No open tickets
                  </td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket.id} className="border-b border-gray-900 hover:bg-gray-900 hover:bg-opacity-30 transition-colors">
                    <td className="px-4 py-3 text-silver font-mono">#{ticket.id}</td>
                    <td className="px-4 py-3 text-gray-300">{ticket.subject || 'No subject'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-neon-red hover:underline text-xs font-semibold">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="card">
        <h2 className="heading-silver text-2xl mb-6">Recent Conversations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conversations.length === 0 ? (
            <div className="text-gray-400 col-span-2">No conversations yet</div>
          ) : (
            conversations.map(conv => (
              <div key={conv.id} className="border border-gray-800 rounded p-4 hover:border-neon-red transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-silver font-semibold">Conversation #{conv.id}</p>
                    <p className="text-xs text-gray-400">Channel: {conv.channel}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded capitalize ${getStatusColor(conv.status)}`}>
                    {conv.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{conv.message_count} messages</span>
                  <span>{new Date(conv.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Knowledge Base */}
      <div className="card">
        <h2 className="heading-silver text-2xl mb-6">Knowledge Base</h2>
        <p className="text-gray-400 text-sm mb-4">
          The AI assistant uses this knowledge base to provide accurate answers. Keep it updated with common questions and answers.
        </p>
        <button className="btn-primary">
          Manage Knowledge Base
        </button>
      </div>
    </div>
  );
}
