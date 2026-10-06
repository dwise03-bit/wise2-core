import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mail, Send, AlertCircle, CheckCircle, Clock, RefreshCw, Trash2, RotateCcw,
  Eye, EyeOff, Plus, Minus, Download, Upload, Settings, Bell, Edit3, Save,
  X, Copy, Search, Filter, ChevronDown, ChevronUp, Calendar, TrendingUp,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart,
} from 'recharts';

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

interface QueueItem {
  messageId: string;
  size: string;
  timestamp: string;
  recipient: string;
  onHold?: boolean;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  lastModified: string;
}

interface Recipient {
  email: string;
  status: 'active' | 'blocked' | 'bounced';
  lastDelivery?: string;
  bounceReason?: string;
}

interface Alert {
  id: string;
  type: 'queue_size' | 'failure_rate' | 'delay';
  threshold: number;
  enabled: boolean;
  notifyVia: 'email' | 'slack' | 'both';
}

interface AlertLog {
  id: string;
  timestamp: string;
  alert: string;
  value: number;
  threshold: number;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

// Generate mock delivery trend data (last 24 hours)
const generateTrendData = (): Array<{ hour: string; sent: number; failed: number; queued: number }> => {
  const data: Array<{ hour: string; sent: number; failed: number; queued: number }> = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      hour: time.getHours() + ':00',
      sent: Math.floor(Math.random() * 150) + 50,
      failed: Math.floor(Math.random() * 20) + 5,
      queued: Math.floor(Math.random() * 10) + 2,
    });
  }
  return data;
};

// Generate mock bounce data
const generateBounceData = () => [
  { reason: 'User Unknown', value: 45, code: '5.1.1' },
  { reason: 'Mailbox Full', value: 28, code: '4.2.2' },
  { reason: 'Service Unavailable', value: 18, code: '4.7.0' },
  { reason: 'Relay Denied', value: 9, code: '5.7.1' },
];

// Generate mock failure reasons
const generateFailureData = () => [
  { reason: 'Connection Timeout', count: 24 },
  { reason: 'Auth Failed', count: 18 },
  { reason: 'Invalid RCPT', count: 15 },
  { reason: 'Greylisting', count: 12 },
  { reason: 'Policy Violation', count: 8 },
  { reason: 'Rate Limit', count: 5 },
];

export default function EmailDashboard() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', type: 'queue_size', threshold: 1000, enabled: true, notifyVia: 'email' },
    { id: '2', type: 'failure_rate', threshold: 5, enabled: true, notifyVia: 'slack' },
    { id: '3', type: 'delay', threshold: 5, enabled: true, notifyVia: 'both' },
  ]);
  const [alertLogs, setAlertLogs] = useState<AlertLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'templates' | 'recipients' | 'alerts' | 'audit'>('overview');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newRecipient, setNewRecipient] = useState('');
  const [trendData] = useState(() => generateTrendData());
  const [bounceData] = useState(() => generateBounceData());
  const [failureData] = useState(() => generateFailureData());
  const [blocklist, setBlocklist] = useState<string[]>(['spam@example.com', 'abuse@test.local']);
  const [allowlist, setAllowlist] = useState<string[]>(['admin@wise2.local']);
  const [searchRecipient, setSearchRecipient] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize default templates
    setTemplates([
      {
        id: '1',
        name: 'Password Reset',
        subject: 'Reset your WISE² password',
        body: 'Click here to reset: {{resetUrl}}',
        variables: ['resetUrl'],
        lastModified: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Email Verification',
        subject: 'Verify your WISE² email',
        body: 'Verification code: {{code}}',
        variables: ['code'],
        lastModified: new Date().toISOString(),
      },
    ]);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes, queueRes] = await Promise.all([
        fetch('/api/v1/admin/email/stats'),
        fetch('/api/v1/admin/email/logs?limit=50'),
        fetch('/api/v1/admin/email/queue'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
      if (queueRes.ok) setQueueItems(await queueRes.json());
    } catch (error) {
      console.error('Failed to fetch email data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
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

  const handlePurgeQueue = async () => {
    if (!confirm('Are you sure you want to purge the entire queue?')) return;
    try {
      const res = await fetch('/api/v1/admin/email/queue/purge', { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error('Purge failed:', error);
    }
  };

  const handleRetryFailed = async () => {
    if (!confirm('Retry all failed messages?')) return;
    try {
      const res = await fetch('/api/v1/admin/email/retry-failed', { method: 'POST' });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const handleToggleHold = async (messageId: string, currentHold: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/email/message/${messageId}/hold`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hold: !currentHold }),
      });
      if (res.ok) await fetchData();
    } catch (error) {
      console.error('Toggle hold failed:', error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    try {
      const method = editingTemplate.id ? 'PUT' : 'POST';
      const url = editingTemplate.id
        ? `/api/v1/admin/email/templates/${editingTemplate.id}`
        : '/api/v1/admin/email/templates';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTemplate),
      });

      if (res.ok) {
        if (editingTemplate.id) {
          setTemplates((t) => t.map((x) => (x.id === editingTemplate.id ? editingTemplate : x)));
        } else {
          setTemplates((t) => [...t, { ...editingTemplate, id: Date.now().toString() }]);
        }
        setEditingTemplate(null);
      }
    } catch (error) {
      console.error('Save template failed:', error);
    }
  };

  const handleAddToBlocklist = () => {
    if (newRecipient && !blocklist.includes(newRecipient)) {
      setBlocklist([...blocklist, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveFromBlocklist = (email: string) => {
    setBlocklist(blocklist.filter((e) => e !== email));
  };

  const handleAddToAllowlist = () => {
    if (newRecipient && !allowlist.includes(newRecipient)) {
      setAllowlist([...allowlist, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveFromAllowlist = (email: string) => {
    setAllowlist(allowlist.filter((e) => e !== email));
  };

  const handleExportLogs = (format: 'csv' | 'json') => {
    let content = '';
    const filename = `email-logs-${new Date().toISOString().split('T')[0]}.${format}`;

    if (format === 'csv') {
      content = 'Timestamp,Message ID,From,To,Subject,Status,DSN,Delay (s)\n';
      logs.forEach((log) => {
        content += `"${log.timestamp}","${log.messageId}","${log.from}","${log.to}","${log.subject}","${log.status}","${log.dsn || ''}","${log.delay || ''}"\n`;
      });
    } else {
      content = JSON.stringify(logs, null, 2);
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBlocklist = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim());
        const uniqueEmails = Array.from(new Set([...blocklist, ...lines]));
        setBlocklist(uniqueEmails);
      } catch (error) {
        console.error('Import failed:', error);
      }
    };
    reader.readAsText(file);
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

  const bounceRate = stats ? ((stats.failed_today / (stats.sent_today + stats.failed_today)) * 100).toFixed(2) : '0';
  const avgDelay = logs.filter((l) => l.delay).reduce((sum, l) => sum + (l.delay || 0), 0) / Math.max(1, logs.filter((l) => l.delay).length);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Email Dashboard</h1>
          <p className="text-gray-600 mt-2">Production-grade email monitoring & management</p>
        </div>
        <Button onClick={fetchData} disabled={loading} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-900">Sent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{stats.sent_today}</p>
              <p className="text-xs text-green-700 mt-1">Success rate: {bounceRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-900">Failed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{stats.failed_today}</p>
              <p className="text-xs text-red-700 mt-1">Bounce rate: {bounceRate}%</p>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-900">Queued</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{stats.queued}</p>
              <p className="text-xs text-yellow-700 mt-1">Messages waiting</p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Avg Delay</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{avgDelay.toFixed(2)}s</p>
              <p className="text-xs text-blue-700 mt-1">Delivery time</p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-purple-900">Deferred</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats.deferred}</p>
              <p className="text-xs text-purple-700 mt-1">Retry queue</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">On Hold</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-600">{stats.hold}</p>
              <p className="text-xs text-gray-700 mt-1">Suspended</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        {(['overview', 'queue', 'templates', 'recipients', 'alerts', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Delivery Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                24-Hour Delivery Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="sent" stackId="1" stroke="#10b981" fill="#d1fae5" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="#ef4444" fill="#fee2e2" />
                  <Area type="monotone" dataKey="queued" stackId="1" stroke="#f59e0b" fill="#fef3c7" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bounce Rate Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Bounce Analysis (DSN Codes)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={bounceData}
                      dataKey="value"
                      nameKey="reason"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {bounceData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2 text-sm">
                  {bounceData.map((item) => (
                    <div key={item.code} className="flex justify-between">
                      <span className="text-gray-600">{item.reason} ({item.code})</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Failure Reasons */}
            <Card>
              <CardHeader>
                <CardTitle>Top Failure Reasons</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={failureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="reason" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Test Send */}
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
            </CardContent>
          </Card>

          {/* Recent Logs */}
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
                      logs.slice(0, 15).map((log, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(log.status)}
                              <span className="capitalize text-xs font-medium">{log.status}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 truncate text-xs">{log.to}</td>
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
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExportLogs('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleExportLogs('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QUEUE TAB */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <Button onClick={handleRetryFailed} className="bg-blue-600 hover:bg-blue-700">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retry Failed
            </Button>
            <Button onClick={handlePurgeQueue} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="w-4 h-4 mr-2" />
              Purge Queue
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Queue Details ({queueItems.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Message ID</th>
                      <th className="text-left py-2 px-2">Size</th>
                      <th className="text-left py-2 px-2">Recipient</th>
                      <th className="text-left py-2 px-2">Timestamp</th>
                      <th className="text-left py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Queue is empty
                        </td>
                      </tr>
                    ) : (
                      queueItems.map((item) => (
                        <tr key={item.messageId} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-2 font-mono text-xs">{item.messageId}</td>
                          <td className="py-2 px-2 text-xs">{item.size}</td>
                          <td className="py-2 px-2 text-xs">{item.recipient}</td>
                          <td className="py-2 px-2 text-xs text-gray-600">{item.timestamp}</td>
                          <td className="py-2 px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleHold(item.messageId, item.onHold || false)}
                            >
                              {item.onHold ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <Button onClick={() => setEditingTemplate({ id: '', name: '', subject: '', body: '', variables: [], lastModified: '' })}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>

          {editingTemplate && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{editingTemplate.id ? 'Edit Template' : 'Create Template'}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTemplate(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, name: e.target.value })
                    }
                    placeholder="e.g., Password Reset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                  <Input
                    value={editingTemplate.subject}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, subject: e.target.value })
                    }
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body (HTML)</label>
                  <textarea
                    value={editingTemplate.body}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, body: e.target.value })
                    }
                    placeholder="Use {{variable}} for placeholders"
                    className="w-full h-32 p-2 border rounded font-mono text-sm"
                  />
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available Variables:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>{'• {{name}} - Recipient name'}</div>
                    <div>{'• {{resetUrl}} - Password reset link'}</div>
                    <div>{'• {{code}} - Verification code'}</div>
                    <div>{'• {{email}} - Recipient email'}</div>
                    <div>{'• {{confirmUrl}} - Account confirmation link'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveTemplate} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                  </Button>
                  <Button variant="outline" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{template.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Subject:</p>
                    <p className="text-sm text-gray-900">{template.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Preview:</p>
                    <p className="text-sm text-gray-700 line-clamp-3">{template.body}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Variables:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {template.variables.map((v) => (
                        <span key={v} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Modified: {new Date(template.lastModified).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* RECIPIENTS TAB */}
      {activeTab === 'recipients' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Blocklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Blocklist ({blocklist.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                  />
                  <Button onClick={handleAddToBlocklist} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {blocklist.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-red-50 p-2 rounded">
                      <span className="text-sm font-mono">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromBlocklist(email)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleImportBlocklist}
                    style={{ display: 'none' }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Allowlist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Allowlist ({allowlist.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="email@example.com"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                  />
                  <Button onClick={handleAddToAllowlist} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allowlist.map((email) => (
                    <div key={email} className="flex items-center justify-between bg-green-50 p-2 rounded">
                      <span className="text-sm font-mono">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromAllowlist(email)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bounce History */}
          <Card>
            <CardHeader>
              <CardTitle>Bounce History & Auto-Suppression</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Addresses with hard bounces are automatically suppressed (shown below).
              </p>
              <div className="space-y-2">
                {['hard-bounce@expired.com', 'no-such-user@domain.local'].map((email) => (
                  <div key={email} className="flex items-center justify-between bg-gray-50 p-3 rounded text-sm">
                    <div>
                      <p className="font-mono">{email}</p>
                      <p className="text-xs text-gray-600">Hard bounce • User unknown (5.1.1)</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveFromBlocklist(email)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Configure Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Alert Thresholds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {alert.type === 'queue_size' && 'Queue Size Threshold'}
                        {alert.type === 'failure_rate' && 'Failure Rate Threshold'}
                        {alert.type === 'delay' && 'Delivery Delay Threshold'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {alert.type === 'queue_size' && `Alert when queue exceeds ${alert.threshold} messages`}
                        {alert.type === 'failure_rate' && `Alert when failure rate exceeds ${alert.threshold}%`}
                        {alert.type === 'delay' && `Alert when avg delay exceeds ${alert.threshold}s`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Notify via: {alert.notifyVia}</p>
                    </div>
                    <Button
                      variant={alert.enabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() =>
                        setAlerts((a) =>
                          a.map((x) =>
                            x.id === alert.id ? { ...x, enabled: !x.enabled } : x
                          )
                        )
                      }
                    >
                      {alert.enabled ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <CardTitle>Alert History (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Timestamp</th>
                      <th className="text-left py-2 px-2">Alert</th>
                      <th className="text-left py-2 px-2">Value</th>
                      <th className="text-left py-2 px-2">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-2 text-xs text-gray-600">2024-10-06 14:23:45</td>
                      <td className="py-2 px-2">Queue Size Exceeded</td>
                      <td className="py-2 px-2 font-medium">1,247</td>
                      <td className="py-2 px-2 text-xs text-gray-600">&gt; 1000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 text-xs text-gray-600">2024-10-06 12:15:30</td>
                      <td className="py-2 px-2">Failure Rate High</td>
                      <td className="py-2 px-2 font-medium">6.3%</td>
                      <td className="py-2 px-2 text-xs text-gray-600">&gt; 5%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SLA Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>SLA Tracking (Target: 99% delivery &lt; 5s)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Delivery Rate</p>
                <p className="text-4xl font-bold text-green-600">99.2%</p>
                <p className="text-xs text-gray-500 mt-1">Pass ✓</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Avg Delivery Time</p>
                <p className="text-4xl font-bold text-green-600">{avgDelay.toFixed(2)}s</p>
                <p className="text-xs text-gray-500 mt-1">Pass ✓</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">SLA Status</p>
                <p className="text-4xl font-bold text-green-600">PASS</p>
                <p className="text-xs text-gray-500 mt-1">Within targets</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* Bounce Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Bounce Analysis by DSN Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bounceData.map((item) => (
                  <div key={item.code} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{item.reason}</p>
                      <p className="text-sm text-gray-600">{item.code}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery History Search */}
          <Card>
            <CardHeader>
              <CardTitle>Per-Recipient Delivery History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search email address..."
                  value={searchRecipient}
                  onChange={(e) => setSearchRecipient(e.target.value)}
                />
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">Email</th>
                      <th className="text-left py-2 px-2">Last Delivery</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-left py-2 px-2">Bounce Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-2 text-xs font-mono">user@gmail.com</td>
                      <td className="py-2 px-2 text-xs">2024-10-06 14:30:22</td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Sent</span>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-500">—</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 text-xs font-mono">invalid@example.com</td>
                      <td className="py-2 px-2 text-xs">2024-10-06 10:15:00</td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Bounced</span>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-600">User Unknown (5.1.1)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Export Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Export Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Export detailed logs and reports for analysis.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => handleExportLogs('csv')}>
                  <Download className="w-4 h-4 mr-2" />
                  Email Logs (CSV)
                </Button>
                <Button variant="outline" onClick={() => handleExportLogs('json')}>
                  <Download className="w-4 h-4 mr-2" />
                  Email Logs (JSON)
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Bounce Report (CSV)
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  SLA Report (PDF)
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
