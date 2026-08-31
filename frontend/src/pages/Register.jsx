import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FIELDS = [
  { name: 'first_name', label: 'Full name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone (optional)', type: 'tel', required: false },
  { name: 'address', label: 'Address (optional)', type: 'text', required: false },
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'password', required: true },
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', email: '', phone: '', address: '', username: '', password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function update(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);
    try {
      const user = await register(form);
      navigate(user.is_staff ? '/admin' : '/dashboard');
    } catch (err) {
      if (err.data && typeof err.data === 'object') {
        setFieldErrors(err.data);
      } else {
        setFieldErrors({ non_field_errors: [err.message] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <span className="eyebrow">New here</span>
        <h1 style={{ fontSize: '1.8rem' }}>Create your account</h1>
        <div className="form-card">
          {fieldErrors.non_field_errors && (
            <div className="alert error">{[].concat(fieldErrors.non_field_errors).join(' ')}</div>
          )}
          <form onSubmit={handleSubmit}>
            {FIELDS.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name}>{field.label}</label>
                <input
                  type={field.type}
                  id={field.name}
                  value={form[field.name]}
                  onChange={(e) => update(field.name, e.target.value)}
                  required={field.required}
                />
                {fieldErrors[field.name] && (
                  <div className="field-errors">{[].concat(fieldErrors[field.name]).join(' ')}</div>
                )}
              </div>
            ))}
            <div style={{ marginTop: '22px' }}>
              <button type="submit" className="pill-btn solid" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>
                {submitting ? 'Creating account…' : 'Create account'}
              </button>
            </div>
          </form>
          <p className="form-foot">
            Already have one? <Link to="/login" style={{ color: 'var(--blue)' }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
