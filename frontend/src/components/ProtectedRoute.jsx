import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, staffOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--ink-faint)' }}>Loading…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (staffOnly && !user.is_staff) return <Navigate to="/dashboard" replace />;
  if (!staffOnly && user.is_staff) return <Navigate to="/admin" replace />;
  return children;
}
