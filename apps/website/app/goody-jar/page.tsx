'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PasskeyUser {
  id: string;
  displayName: string;
  email: string;
}

interface GoodyJarItem {
  id: string;
  title: string;
  category: 'artifact' | 'decision' | 'achievement' | 'treasure';
  content: string;
  createdAt: string;
  updatedAt: string;
  owner: string;
}

export default function GoodyJarPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<PasskeyUser | null>(null);
  const [items, setItems] = useState<GoodyJarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'treasure' as const,
    content: '',
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/goody-jar/auth/check');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAuthenticated(true);
        loadItems();
      } else {
        setAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const response = await fetch('/api/goody-jar/items');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to load items:', error);
    }
  };

  const handlePasskeyAuth = async () => {
    try {
      const response = await fetch('/api/goody-jar/auth/passkey-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const { challenge } = await response.json();
        // WebAuthn credential creation would happen here
        setAuthenticated(true);
        checkAuth();
      }
    } catch (error) {
      console.error('Passkey registration failed:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/goody-jar/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        const createdItem = await response.json();
        setItems([...items, createdItem]);
        setNewItem({ title: '', category: 'treasure', content: '' });
        setShowNewItemForm(false);
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-black">
        <div className="text-white text-2xl">Loading Goody Jar...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-black to-black">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-white">🏺 The Goody Jar</h1>
          <p className="text-xl text-gray-300">Apple Passkey Protected Treasure Chest</p>

          <div className="space-y-4">
            <button
              onClick={handlePasskeyAuth}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition"
            >
              🔐 Authenticate with Passkey
            </button>

            <p className="text-gray-400 text-sm">Only authenticated users can access the treasure.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-black text-white">
      {/* Header */}
      <div className="border-b border-purple-900 bg-black/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">🏺 The Goody Jar</h1>
            <div className="text-right">
              <p className="text-purple-400">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Add New Item Button */}
        <button
          onClick={() => setShowNewItemForm(!showNewItemForm)}
          className="mb-8 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          {showNewItemForm ? '✕ Cancel' : '✨ Add to Goody Jar'}
        </button>

        {/* New Item Form */}
        {showNewItemForm && (
          <div className="mb-8 p-6 bg-gray-900 border border-purple-900 rounded-lg space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={newItem.title}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
            />

            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
            >
              <option value="treasure">🎁 Treasure</option>
              <option value="achievement">🏆 Achievement</option>
              <option value="decision">⚖️ Decision</option>
              <option value="artifact">📦 Artifact</option>
            </select>

            <textarea
              placeholder="Content"
              value={newItem.content}
              onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-500"
            />

            <button
              onClick={handleAddItem}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 transition"
            >
              Save to Goody Jar
            </button>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-6 bg-gradient-to-br from-gray-900 to-gray-950 border border-purple-900 rounded-lg hover:border-purple-600 transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold text-purple-400">{item.title}</h3>
                <span className="text-2xl">
                  {item.category === 'treasure' && '🎁'}
                  {item.category === 'achievement' && '🏆'}
                  {item.category === 'decision' && '⚖️'}
                  {item.category === 'artifact' && '📦'}
                </span>
              </div>

              <p className="text-gray-300 line-clamp-3">{item.content}</p>

              <div className="text-xs text-gray-500 space-y-1">
                <p>Owner: {item.owner}</p>
                <p>Added: {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>

        {items.length === 0 && !showNewItemForm && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-2xl mb-4">✨ The Goody Jar is empty</p>
            <p className="text-lg">Add your first treasure, achievement, or decision!</p>
          </div>
        )}
      </div>
    </div>
  );
}
