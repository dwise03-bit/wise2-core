'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function GoogleLoginButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/auth/google/login-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: '/dashboard' }),
      });

      if (!response.ok) {
        throw new Error('Failed to start Google login');
      }

      const data = await response.json();
      if (data.success && data.data.authorization_url) {
        window.location.href = data.data.authorization_url;
      } else {
        setError('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      

cat > wise2-command-center/src/components/GoogleDriveCard.tsx << 'EOF'
'use client';

import { useEffect, useState } from 'react';

interface DriveConnection {
  connected: boolean;
  status: string;
  lastSyncAt?: string;
  errorMessage?: string;
}

export function GoogleDriveCard() {
  const [connection, setConnection] = useState<DriveConnection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/api/v1/integrations/google-drive/status', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setConnection(data.data);
        }
      } catch (err) {
        console.error('Failed to check Drive status', err);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleConnect = async () => {
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/v1/integrations/google-drive/connect-start', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    if (data.success) {
      window.location.href = data.data.authorization_url;
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Drive?')) return;
    const token = localStorage.getItem('access_token');
    await fetch('/api/v1/integrations/google-drive/disconnect', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    setConnection({ connected: false, status: 'not_connected' });
  };

  return (
    <div className="border rounded p-4 bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Google Drive</h3>
      
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : connection?.connected ? (
        <>
          <p className="text-green-600">✓ Connected</p>
          {connection.lastSyncAt && (
            <p className="text-sm text-gray-600">Last sync: {new Date(connection.lastSyncAt).toLocaleString()}</p>
          )}
          <button onClick={handleDisconnect} className="text-red-600 text-sm mt-2 hover:underline">
            Disconnect
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 mb-3">Connect Google Drive to import files</p>
          <button onClick={handleConnect} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Connect Google Drive
          </button>
        </>
      )}
    </div>
  );
}
