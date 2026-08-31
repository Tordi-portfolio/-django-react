import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function AdminConversation() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const threadRef = useRef(null);

  async function load() {
    try {
      const data = await api.get(`/conversations/${id}/`);
      setConversation(data);
    } catch (err) {
      setError('Could not load this conversation.');
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [conversation]);

  async function handleReply(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setError('');
    setSending(true);
    try {
      const data = await api.post(`/conversations/${id}/`, { body: replyBody });
      setConversation(data);
      setReplyBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (!conversation) {
    return <div className="container dash-shell">{error ? <div className="alert error">{error}</div> : <p>Loading…</p>}</div>;
  }

  return (
    <div className="container dash-shell">
      <div className="dash-head">
        <div>
          <Link to="/admin" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: 'var(--blue)' }}>
            ← All conversations
          </Link>
          <h1 style={{ fontSize: '1.9rem', marginTop: '6px' }}>{conversation.customer_name}</h1>
        </div>
        <span className="topic-pill">{conversation.topic_display}</span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--ink-faint)', fontWeight: 500, marginTop: '-14px', marginBottom: '22px' }}>
        {conversation.customer_email}
        {conversation.customer_phone && ` · ${conversation.customer_phone}`}
      </p>

      {error && <div className="alert error">{error}</div>}

      <div className="thread" ref={threadRef}>
        {conversation.messages.map((m) => (
          <div className={`bubble ${m.sender_is_staff ? 'mine' : 'theirs'}`} key={m.id}>
            <span className="meta">
              {m.sender_is_staff ? 'You' : conversation.customer_name} · {new Date(m.created_at).toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
              })}
            </span>
            {m.body}
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="reply-box">
        <textarea
          rows={3}
          placeholder="Write a reply…"
          value={replyBody}
          onChange={(e) => setReplyBody(e.target.value)}
          required
        />
        <button type="submit" className="pill-btn solid" disabled={sending}>
          {sending ? 'Sending…' : 'Reply'}
        </button>
      </form>
    </div>
  );
}
