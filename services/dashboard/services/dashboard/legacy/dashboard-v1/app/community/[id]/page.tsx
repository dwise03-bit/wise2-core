'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: number;
  thread_id: number;
  user_id: number;
  content: string;
  created_at: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Thread {
  id: number;
  user_id: number;
  title: string;
  description: string;
  created_at: string;
}

export default function ThreadPage() {
  const router = useRouter();
  const params = useParams();
  const threadId = params.id;

  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) {
      router.push('/auth/login');
      return;
    }
    setToken(t);
    fetchThread();
    fetchPosts();
  }, [threadId, router]);

  const fetchThread = async () => {
    try {
      const response = await fetch(`/api/community/threads?limit=1`);
      const threads = await response.json();
      const foundThread = threads.find((t: any) => t.id === parseInt(threadId as string));
      setThread(foundThread);
    } catch (error) {
      console.error('Error fetching thread:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/community/posts?thread_id=${threadId}`);
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPost) return;

    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          threadId: parseInt(threadId as string),
          content: newPost,
        }),
      });

      if (response.ok) {
        setNewPost('');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  return (
    <main className="bg-black min-h-screen">
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 py-4 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/logo-w2.png" alt="Wise Defense" width={160} height={50} className="h-12 w-auto" />
          </Link>
          <nav className="flex gap-6">
            <Link href="/community" className="text-gray hover:text-neon-red transition-glow">
              Forum
            </Link>
            <Link href="/dashboard" className="text-gray hover:text-neon-red transition-glow">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      <section className="bg-black py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {thread && (
            <div className="card mb-8">
              <h1 className="heading-silver text-3xl mb-4">{thread.title}</h1>
              <p className="text-gray mb-4">{thread.description}</p>
              <p className="text-gray-muted text-sm">
                Started {new Date(thread.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4 mb-8">
            {loading ? (
              <div className="text-gray text-center py-12">Loading replies...</div>
            ) : posts.length === 0 ? (
              <div className="text-gray text-center py-8">
                No replies yet. Be the first to respond!
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="heading-silver">
                      {post.first_name} {post.last_name || ''}
                    </h3>
                    <span className="text-gray-muted text-sm">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray">{post.content}</p>
                </div>
              ))
            )}
          </div>

          <div className="card">
            <h2 className="heading-silver text-lg mb-4">Reply to Thread</h2>
            <form onSubmit={handlePostReply} className="space-y-4">
              <textarea
                placeholder="Share your thoughts..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="w-full"
                rows={4}
                required
              />
              <button type="submit" className="btn-primary">
                Post Reply
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
