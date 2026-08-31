import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PHONE = '(555) 019-4477';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    close();
    navigate('/');
  }

  return (
    <>
      <div className="emergency-bar">
        Plumbing or electrical emergency? Call now: <a href={`tel:${PHONE}`}>{PHONE}</a> — answered 24 hours a day, 7 days a week.
      </div>

      <nav className="nav">
        <div className="nav-inner">
          <Link to="/" className="brand" onClick={close}>
            <svg className="brand-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#eaf2fe" stroke="#1e6fd9" strokeWidth="2" />
              <path d="M24 10c5 6 9 10.5 9 16a9 9 0 1 1-18 0c0-5.5 4-10 9-16z" fill="#1e6fd9" />
              <path d="M27 15 L19 27 H25 L21 35 L31 21 H25 L27 15 Z" fill="#f5a623" />
            </svg>
            <span className="brand-text">
              Robert Evan's
              <small>Plumbing &amp; Electrician</small>
            </span>
          </Link>

          <div className={`nav-links ${open ? 'open' : ''}`}>
            <Link to="/#services" onClick={close}>Services</Link>
            <Link to="/#reviews" onClick={close}>Reviews</Link>
            <Link to="/about" onClick={close}>About</Link>
            <Link to="/#faq" onClick={close}>FAQ</Link>

            <span className="nav-phone">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              {PHONE}
            </span>

            {user ? (
              <>
                {user.is_staff ? (
                  <Link to="/admin" className="badge-link" onClick={close}>Inbox</Link>
                ) : (
                  <Link to="/dashboard" className="badge-link" onClick={close}>My messages</Link>
                )}
                <button type="button" className="pill-btn ghost sm" onClick={handleLogout}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="pill-btn ghost sm" onClick={close}>Log in</Link>
                <Link to="/register" className="pill-btn solid sm" onClick={close}>Get a free quote</Link>
              </>
            )}
          </div>

          <a href={`tel:${PHONE}`} className="nav-call-icon" aria-label={`Call ${PHONE}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </a>

          <button
            type="button"
            className="nav-toggle"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      <div className={`nav-overlay ${open ? 'open' : ''}`} onClick={close}></div>
    </>
  );
}
