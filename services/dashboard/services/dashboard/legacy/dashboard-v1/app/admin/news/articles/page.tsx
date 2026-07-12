/**
 * Admin Articles Management
 * View, filter, and manage scraped news articles
 */

'use client';

import { useEffect, useState } from 'react';

interface Article {
  id: number;
  title: string;
  source_name: string;
  source_url: string;
  is_processed: boolean;
  created_at: string;
}

interface Review {
  article_id: number;
  relevance_score: number;
  sentiment: string;
  priority_level: string;
  recommended_for_social: boolean;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<(Article & Review)[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'high' | 'unreviewed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Fetch recent articles with their reviews
        const response = await fetch('/api/admin/news/articles');
        const data = await response.json();
        setArticles(data);
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const filtered = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'high') {
      return matchesSearch && article.priority_level === 'high';
    }
    if (filter === 'unreviewed') {
      return matchesSearch && !article.is_processed;
    }
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">📰 News Articles</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-900 border border-red-600 border-opacity-30 rounded"
        />
        
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-red-600' : 'bg-gray-800'}`}
        >
          All ({articles.length})
        </button>
        
        <button
          onClick={() => setFilter('high')}
          className={`px-4 py-2 rounded ${filter === 'high' ? 'bg-red-600' : 'bg-gray-800'}`}
        >
          High Priority
        </button>
        
        <button
          onClick={() => setFilter('unreviewed')}
          className={`px-4 py-2 rounded ${filter === 'unreviewed' ? 'bg-red-600' : 'bg-gray-800'}`}
        >
          Unreviewed
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading articles...</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="bg-gray-900 p-6 rounded-lg border border-red-600 border-opacity-30 hover:border-opacity-60 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold flex-1">{article.title}</h3>
                <span
                  className={`px-3 py-1 rounded text-sm font-semibold ${
                    article.priority_level === 'high'
                      ? 'bg-red-600'
                      : article.priority_level === 'medium'
                      ? 'bg-yellow-600'
                      : 'bg-gray-700'
                  }`}
                >
                  {article.priority_level?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              <div className="flex gap-4 text-sm text-gray-400 mb-3">
                <span>📰 {article.source_name}</span>
                <span>💭 {article.sentiment}</span>
                {article.relevance_score && (
                  <span>🎯 {(article.relevance_score * 100).toFixed(0)}% relevant</span>
                )}
                {article.recommended_for_social && <span className="text-green-500">📱 Social ready</span>}
              </div>

              <p className="text-gray-300 text-sm mb-4">
                {article.source_url}
              </p>

              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(article.created_at).toLocaleString()}
                </span>
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-red-600 rounded text-sm hover:bg-red-700 transition"
                >
                  Read Full Article →
                </a>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No articles found matching your filters
            </div>
          )}
        </div>
      )}
    </div>
  );
}
