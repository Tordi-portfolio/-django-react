import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import PushBanner from '../components/PushBanner.jsx';

const TOPICS = [
  { value: 'leak', label: 'Leak / burst pipe' },
  { value: 'clog', label: 'Drain or sewer clog' },
  { value: 'install', label: 'New installation' },
  { value: 'electrical', label: 'Electrical issue' },
  { value: 'quote', label: 'Quote request' },
  { value: 'other', label: 'Something else' },
];

export default function CustomerDashboard() {
  const [conversation, setConversation] = useState(undefined); // undefined = loading, null = none yet
  const [topic, setTopic] = useState('other');
  const [body, setBody] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const threadRef = useRef(null);

  async function load() {
    try {
      const data = await api.get('/conversations/me/');
      setConversation(data);
    } catch (err) {
      setError('Could not load your messages. Try refreshing the page.');
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [conversation]);

  async function handleStart(e) {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const data = await api.post('/conversations/me/', { topic, body });
      setConversation(data);
      setBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setError('');
    setSending(true);
    try {
      const data = await api.post('/conversations/me/messages/', { body: replyBody });
      setConversation(data);
      setReplyBody('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  if (conversation === undefined) {
    return <div className="container dash-shell"><p>Loading your messages…</p></div>;
  }

  return (
    <div className="container dash-shell">
      <div className="dash-head">
        <div>
          <span className="eyebrow">Your line to Robert</span>
          <h1 style={{ fontSize: '1.9rem' }}>My messages</h1>
        </div>
        {conversation && (
          <span className="topic-pill">{conversation.topic_display}</span>
        )}
      </div>

      <PushBanner />

      {error && <div className="alert error">{error}</div>}

      {conversation ? (
        <>
          <div className="thread" ref={threadRef}>
            {conversation.messages.map((m) => (
              <div className={`bubble ${m.sender_is_staff ? 'theirs' : 'mine'}`} key={m.id}>
                <span className="meta">
                  {m.sender_is_staff ? 'Robert' : 'You'} · {new Date(m.created_at).toLocaleString(undefined, {
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
            <button type="submit" className="pill-btn blue-solid" disabled={sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--ink-dim)', maxWidth: '56ch' }}>
            Start a conversation below and it'll land straight in Robert's inbox. Replies show up
            right here — no email or phone tag needed.
          </p>
          <div className="card" style={{ maxWidth: '560px' }}>
            <span className="eyebrow" style={{ marginBottom: '6px' }}>New message</span>
            <form onSubmit={handleStart}>
              <label htmlFor="topic">What do you need help with?</label>
              <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)}>
                {TOPICS.map((t) => (
                  <option value={t.value} key={t.value}>{t.label}</option>
                ))}
              </select>
              <label htmlFor="body">Message</label>
              <textarea
                id="body"
                rows={4}
                placeholder="Describe the issue — location in the house, how urgent it is, anything you've already tried."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <div style={{ marginTop: '18px' }}>
                <button type="submit" className="pill-btn solid" disabled={sending}>
                  {sending ? 'Sending…' : 'Send to Robert'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
