/**
 * Discord Approval Workflow Dashboard
 * Approve/reject articles for social media posting
 */

'use client';

import { useEffect, useState } from 'react';

interface PendingArticle {
  id: number;
  title: string;
  content: string;
  source_name: string;
  source_url: string;
  created_at: string;
}

export default function ApprovalWorkflowPage() {
  const [articles, setArticles] = useState<PendingArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<number | null>(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/admin/approval');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch pending articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId: number) => {
    setApproving(articleId);
    try {
      const response = await fetch('/api/admin/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action: 'approve' }),
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== articleId));
        // Show success toast
        alert('✅ Article approved for social media!');
      }
    } catch (error) {
      console.error('Failed to approve:', error);
      alert('❌ Error approving article');
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (articleId: number) => {
    setApproving(articleId);
    try {
      const response = await fetch('/api/admin/approval', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId, action: 'reject' }),
      });

      if (response.ok) {
        setArticles(articles.filter((a) => a.id !== articleId));
        alert('❌ Article rejected');
      }
    } catch (error) {
      console.error('Failed to reject:', error);
      alert('❌ Error rejecting article');
    } finally {
      setApproving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">📋 Article Approval Workflow</h1>
        <p className="text-gray-400 mb-8">Review and approve articles for social media posting</p>

        {loading ? (
          <div className="text-center text-gray-400">Loading pending articles...</div>
        ) : articles.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl">✨ No pending articles</p>
            <p className="text-sm">All articles have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-900 border border-red-600 border-opacity-30 rounded p-4">
              <p className="text-sm">
                <span className="font-bold text-red-500">{articles.length}</span> articles waiting for approval
              </p>
              <p className="text-xs text-gray-400 mt-1">Click ✅ to approve or ❌ to reject</p>
            </div>

            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-red-600 hover:border-opacity-30 transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2 hover:text-red-500">
                      <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                        {article.title}
                      </a>
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                      {article.content.substring(0, 200)}...
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>📰 {article.source_name}</span>
                      <span>
                        📅{' '}
                        {new Date(article.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-gray-600">ID: {article.id}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(article.id)}
                      disabled={approving === article.id}
                      className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded font-bold transition"
                    >
                      {approving === article.id ? '...' : '✅ Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(article.id)}
                      disabled={approving === article.id}
                      className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 rounded font-bold transition"
                    >
                      {approving === article.id ? '...' : '❌ Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
