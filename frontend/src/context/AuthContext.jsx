// AuthContext.jsx — holds the logged-in user (or null) and exposes
// login/register/logout. On first load it checks localStorage for a
// stored token and, if present, calls /auth/me/ to confirm it's still
// valid and find out whether this user is staff ("Robert") or a customer.

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getTokens, setTokens, API_URL } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const tokens = getTokens();
    if (!tokens || !tokens.access) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await api.get('/auth/me/');
      setUser(me);
    } catch (e) {
      setUser(null);
      setTokens(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(username, password) {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Incorrect username or password.');
    }
    setTokens({ access: data.access, refresh: data.refresh });
    const me = await api.get('/auth/me/');
    setUser(me);
    return me;
  }

  async function register(payload) {
    const data = await api.post('/auth/register/', payload);
    setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setTokens(null);
    setUser(null);
  }

  const value = { user, loading, login, register, logout, refresh: loadMe };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
