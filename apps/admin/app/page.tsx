'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Project {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3001/v1/admin/projects');
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    IDEA: 'bg-gray-700',
    DECIPHER: 'bg-blue-700',
    EXECUTE: 'bg-cyan-700',
    HUMAN_REVIEW: 'bg-yellow-700',
    APPROVED: 'bg-green-700',
    DELIVERED: 'bg-emerald-700',
    REJECTED: 'bg-red-700',
  };

  const pendingProjects = projects.filter(p => p.status === 'HUMAN_REVIEW');

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Review and approve customer projects</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto p-6 border-b border-gray-800">
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg">
            <p className="text-gray-400 text-sm">Total Projects</p>
            <p className="text-3xl font-black">{projects.length}</p>
          </div>
          <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <p className="text-yellow-400 text-sm">Pending Review</p>
            <p className="text-3xl font-black">{pendingProjects.length}</p>
          </div>
          <div className="p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-400 text-sm">Approved</p>
            <p className="text-3xl font-black">{projects.filter(p => p.status === 'APPROVED').length}</p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-black mb-6">Pending Review</h2>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : pendingProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No projects pending review</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingProjects.map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="p-6 bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold group-hover:text-cyan-400 transition">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded text-sm font-semibold transition">
                    Review
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* All Projects */}
        <h2 className="text-2xl font-black mt-12 mb-6">All Projects</h2>
        <div className="grid gap-4">
          {projects.map((project) => (
            <div key={project.id} className="p-4 bg-gray-900 border border-gray-800 rounded-lg flex justify-between items-center">
              <div className="flex-1">
                <h4 className="font-semibold">{project.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{project.userId}</p>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-semibold ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-700'}`}>
                {project.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
