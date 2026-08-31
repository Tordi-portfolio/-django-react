// api.js — thin fetch wrapper: attaches the JWT access token, and
// transparently retries once with a refreshed token on a 401.

const API_URL = import.meta.env.VITE_API_URL || '/api';

function getTokens() {
  const raw = localStorage.getItem('auth_tokens');
  return raw ? JSON.parse(raw) : null;
}

function setTokens(tokens) {
  if (tokens) localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  else localStorage.removeItem('auth_tokens');
}

async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens || !tokens.refresh) return null;

  const res = await fetch(`${API_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });

  if (!res.ok) {
    setTokens(null);
    return null;
  }

  const data = await res.json();
  const updated = { ...tokens, access: data.access };
  if (data.refresh) updated.refresh = data.refresh; // ROTATE_REFRESH_TOKENS issues a new one
  setTokens(updated);
  return updated.access;
}

async function apiFetch(path, options = {}) {
  const tokens = getTokens();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (tokens && tokens.access) headers.Authorization = `Bearer ${tokens.access}`;

  let res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && tokens && tokens.refresh) {
    const newAccess = await refreshAccessToken();
    if (newAccess) {
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newAccess}` },
      });
    }
  }

  return res;
}

async function apiJSON(path, options = {}) {
  const res = await apiFetch(path, options);
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json() : null;

  if (!res.ok) {
    let message = 'Something went wrong. Please try again.';
    if (data && typeof data === 'object') {
      message = data.detail || Object.values(data).flat().join(' ') || message;
    }
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => apiJSON(path, { method: 'GET' }),
  post: (path, body) => apiJSON(path, { method: 'POST', body: JSON.stringify(body) }),
};

export { getTokens, setTokens, API_URL };
