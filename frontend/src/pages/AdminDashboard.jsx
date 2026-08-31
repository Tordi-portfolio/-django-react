import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function AdminDashboard() {
  const [conversations, setConversations] = useState(null);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');

  async function load(query) {
    try {
      const path = query ? `/conversations/?q=${encodeURIComponent(query)}` : '/conversations/';
      const data = await api.get(path);
      setConversations(data);
    } catch (err) {
      setError('Could not load conversations.');
    }
  }

  useEffect(() => {
    load('');
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load(q);
  }

  const totalUnread = conversations
    ? conversations.reduce((sum, c) => sum + c.unread_count, 0)
    : 0;

  return (
    <div className="container dash-shell">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Robert's inbox</span>
          <h1 style={{ fontSize: '1.9rem' }}>
            Conversations{' '}
            {totalUnread > 0 && <span className="notify-dot" style={{ verticalAlign: 'middle' }}>{totalUnread} new</span>}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search customer name or email…"
        />
        <button type="submit" className="pill-btn ghost">Search</button>
      </form>

      {error && <div className="alert error">{error}</div>}

      {conversations === null ? (
        <p>Loading…</p>
      ) : conversations.length > 0 ? (
        <div className="conv-list">
          {conversations.map((c) => (
            <Link className="conv-row" to={`/admin/conversations/${c.id}`} key={c.id}>
              <div>
                <div className="who">
                  {c.customer_name}
                  <span className="topic-pill" style={{ marginLeft: '8px' }}>{c.topic_display}</span>
                </div>
                {c.last_message && <div className="preview">{c.last_message.body}</div>}
              </div>
              <div className="right">
                {c.unread_count > 0 && <span className="notify-dot">{c.unread_count}</span>}
                <span className="time">
                  {new Date(c.updated_at).toLocaleString(undefined, {
                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="empty-state">No conversations yet. Once a customer sends a message, it'll show up here.</div>
      )}
    </div>
  );
}
