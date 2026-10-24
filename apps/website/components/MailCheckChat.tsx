'use client';

import { FormEvent, useState } from 'react';
import { MailCheck, Search, ShieldCheck } from 'lucide-react';
import styles from './MailCheckChat.module.css';

type MailMessage = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  unread: boolean;
};

type MailResult = {
  connected: boolean;
  query?: string;
  total?: number;
  messages?: MailMessage[];
  error?: string;
};

function labelFor(action: string) {
  if (action === 'unread') return 'Latest unread inbox mail';
  if (action === 'important') return 'Important inbox mail';
  if (action === 'search') return 'Inbox search';
  return 'Recent inbox mail';
}

export function MailCheckChat() {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [status, setStatus] = useState('Connect Gmail, then ask the chat to check mail.');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  async function checkMail(action = 'recent', requestedQuery?: string) {
    setLoading(true);
    try {
      const response = await fetch('/api/mail-check/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, query: requestedQuery, limit: 5 }),
      });
      const result = await response.json() as MailResult;
      setConnected(result.connected);
      if (!response.ok) {
        setStatus(result.error || 'Unable to check Gmail.');
        return;
      }

      setMessages(result.messages || []);
      setStatus(`${labelFor(action)}: ${result.total || 0} matching message${result.total === 1 ? '' : 's'}.`);
    } catch {
      setStatus('Unable to reach Mail Check right now.');
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    void checkMail('search', trimmed);
  }

  return (
    <section id="mail-check" className={styles.panel} aria-labelledby="mail-check-title">
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Private inbox assistant</p>
          <h2 id="mail-check-title">Mail Check Chat</h2>
          <p className={styles.description}>
            Search and summarize Gmail headers and snippets. Read-only—this chat cannot send, delete, archive, label, or mark mail as read.
          </p>
        </div>
        <ShieldCheck aria-hidden="true" />
      </div>

      <div className={styles.actions}>
        <a className={styles.connect} href="/api/mail-check/connect">
          <MailCheck size={17} aria-hidden="true" />
          {connected ? 'Reconnect Gmail' : 'Connect Gmail'}
        </a>
        <button type="button" onClick={() => void checkMail('unread')} disabled={loading}>
          Check unread
        </button>
        <button type="button" onClick={() => void checkMail('recent')} disabled={loading}>
          Check recent
        </button>
        <button type="button" onClick={() => void checkMail('important')} disabled={loading}>
          Check important
        </button>
      </div>

      <form className={styles.form} onSubmit={submit}>
        <label htmlFor="mail-check-query">Ask Mail Check</label>
        <div>
          <input
            id="mail-check-query"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try: from:stripe.com newer_than:30d"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()}>
            <Search size={16} aria-hidden="true" />
            Search
          </button>
        </div>
      </form>

      <p className={styles.status} role="status">{loading ? 'Checking Gmail…' : status}</p>

      {messages.length > 0 && (
        <ul className={styles.results} aria-label="Mail check results">
          {messages.map((message) => (
            <li key={message.id}>
              <div className={styles.messageTop}>
                <strong>{message.subject}</strong>
                {message.unread && <span>Unread</span>}
              </div>
              <p>{message.from}</p>
              <small>{message.date}</small>
              {message.snippet && <p className={styles.snippet}>{message.snippet}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
