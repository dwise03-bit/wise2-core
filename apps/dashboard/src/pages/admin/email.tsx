import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Send, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface EmailStats {
  queued: number;
  active: number;
  deferred: number;
  hold: number;
  sent_today: number;
  failed_today: number;
}

interface EmailLog {
  timestamp: string;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced' | 'queued';
  dsn?: string;
  delay?: number;
}

export default function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        fetch('/api/v1/admin/email/stats'),
        fetch('/api/v1/admin/email/logs?limit=50'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (error) {
      console.error('Failed to fetch email data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleTestSend = async () => {
    if (!testEmail) return;
    setSending(true);
    try {
      const res = await fetch('/api/v1/admin/email/test-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail, subject: 'WISE² Test Email' }),
      });
      if (res.ok) {
        setTestEmail('');
        await fetchData();
      }
    } catch (error) {
      console.error('Test send failed:', error);
    } finally {
      setSending(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'bounced':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'queued':
      case 'deferred':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Email Dashboard</h1>
          <p className="text-gray-600 mt-2">WISE² postfix relay monitoring & management</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Sent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.sent_today}</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Failed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.failed_today}</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Queued</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.queued}</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Deferred</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.deferred}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">On Hold</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-600">{stats.hold}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Send Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Test Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="recipient@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleTestSend} disabled={sending || !testEmail}>
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Sends a test email through the postfix relay to verify delivery.
          </p>
        </CardContent>
      </Card>

      {/* Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Recent Email Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">To</th>
                  <th className="text-left py-2 px-2">Message ID</th>
                  <th className="text-left py-2 px-2">Timestamp</th>
                  <th className="text-left py-2 px-2">Delay (s)</th>
                  <th className="text-left py-2 px-2">DSN</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No email logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="capitalize text-xs font-medium">{log.status}</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 truncate">{log.to}</td>
                      <td className="py-2 px-2 font-mono text-xs">{log.messageId}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">{log.timestamp}</td>
                      <td className="py-2 px-2 text-xs text-gray-600">
                        {log.delay ? log.delay.toFixed(2) : '—'}
                      </td>
                      <td className="py-2 px-2 font-mono text-xs">{log.dsn || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              Templates are hardcoded in the EmailService. Currently available:
            </p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Password Reset</li>
              <li>Email Verification</li>
              <li>Account Confirmation</li>
            </ul>
            <p className="text-gray-600 mt-4 pt-4 border-t">
              <strong>Provider:</strong> Self-hosted postfix relay (172.22.0.1:25) →{' '}
              <strong>Relay:</strong> Gmail SMTP (gmail-smtp-in.l.google.com)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Postfix Health */}
      <Card>
        <CardHeader>
          <CardTitle>Postfix Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>SMTP_HOST:</strong> 172.22.0.1 (docker bridge gateway)
            </p>
            <p>
              <strong>SMTP_PORT:</strong> 25 (plaintext + STARTTLS)
            </p>
            <p>
              <strong>TLS_REJECT_UNAUTHORIZED:</strong> false (internal relay only)
            </p>
            <p>
              <strong>Mynetworks:</strong> 172.17–26.0.0/16 (docker subnets)
            </p>
            <p className="pt-2 border-t">
              Setup script: <code className="bg-gray-100 px-2 py-1 rounded">sudo bash scripts/wise2-postfix-setup.sh</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
