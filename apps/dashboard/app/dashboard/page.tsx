'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchProjects();
  }, [user, loading, router]);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://localhost:3001/v1/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setProjects(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setProjectsLoading(false);
    }
  };

  if (loading || projectsLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>;
  }

  const statusColors: Record<string, string> = {
    IDEA: 'bg-gray-700',
    DECIPHER: 'bg-blue-700',
    EXECUTE: 'bg-cyan-700',
    HUMAN_REVIEW: 'bg-yellow-700',
    APPROVED: 'bg-green-700',
    DELIVERED: 'bg-emerald-700',
    REJECTED: 'bg-red-700',
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black">Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome, {user?.name || user?.email}</p>
          </div>
          <Link
            href="/dashboard/new"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition"
          >
            + New Project
          </Link>
        </div>
      </div>

      {/* Projects */}
      <div className="max-w-7xl mx-auto p-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">No projects yet. Create one to get started!</p>
            <Link
              href="/dashboard/new"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition"
            >
              Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="p-6 bg-gray-900 border border-gray-800 hover:border-cyan-500 rounded-lg transition cursor-pointer group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold group-hover:text-cyan-400 transition">
                      {project.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm font-semibold ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-700'}`}>
                    {project.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
