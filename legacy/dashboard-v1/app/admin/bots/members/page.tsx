'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, CheckCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  email: string;
  tier: string;
  is_active: boolean;
  total_points?: number;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchMembers();
  }, [search, filter]);

  async function fetchMembers() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/bots/members?search=${search}&filter=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveMember(memberId: string) {
    try {
      const res = await fetch(`/api/admin/bots/members/${memberId}/approve`, { method: 'POST' });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error approving member:', error);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm('Remove this member from the platform?')) return;
    try {
      const res = await fetch(`/api/admin/bots/members/${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-heading mb-4">Member Management</h2>
        <p className="text-gray text-sm">Manage user accounts, tiers, and access</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-900 p-3 rounded-lg flex-1 min-w-64">
            <Search size={20} className="text-gray" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-white outline-none flex-1"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded transition-colors ${
                  filter === f
                    ? 'bg-neon-red text-white'
                    : 'bg-gray-900 text-gray hover:bg-gray-800'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray">Loading members...</p>
      ) : members.length === 0 ? (
        <p className="text-gray text-center py-8">No members found</p>
      ) : (
        <div className="overflow-x-auto bg-gray-900 rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left py-3 px-4 text-silver font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-silver font-semibold">Email</th>
                <th className="text-left py-3 px-4 text-silver font-semibold">Tier</th>
                <th className="text-right py-3 px-4 text-silver font-semibold">Points</th>
                <th className="text-center py-3 px-4 text-silver font-semibold">Status</th>
                <th className="text-center py-3 px-4 text-silver font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-gray-800 hover:bg-gray-800 transition-colors">
                  <td className="py-3 px-4 text-gray">{member.name}</td>
                  <td className="py-3 px-4 text-gray text-sm">{member.email}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-800 text-gray capitalize">
                      {member.tier || 'free'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-neon-red font-semibold">
                    {member.total_points || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        member.is_active
                          ? 'bg-green-900 text-green-200'
                          : 'bg-red-900 text-red-200'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center space-x-2 flex justify-center">
                    {!member.is_active && (
                      <button
                        onClick={() => approveMember(member.id)}
                        className="p-2 hover:bg-green-900 rounded transition-colors"
                        title="Approve member"
                      >
                        <CheckCircle size={18} className="text-green-400" />
                      </button>
                    )}
                    <button
                      onClick={() => removeMember(member.id)}
                      className="p-2 hover:bg-red-900 rounded transition-colors"
                      title="Remove member"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
