import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const me = await login(username, password);
      navigate(me.is_staff ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.message || "Your username or password didn't match. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <span className="eyebrow">Account access</span>
        <h1 style={{ fontSize: '1.8rem' }}>Log in</h1>
        <div className="form-card">
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ marginTop: '22px' }}>
              <button type="submit" className="pill-btn solid" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Logging in…' : 'Log in'}
              </button>
            </div>
          </form>
          <p className="form-foot">
            No account yet? <Link to="/register" style={{ color: 'var(--blue)' }}>Create one</Link> — it takes a minute.
          </p>
        </div>
      </div>
    </div>
  );
}
