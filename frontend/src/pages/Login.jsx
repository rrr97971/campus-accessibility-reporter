import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', totp_token: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [mfaPrompt, setMfaPrompt] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await login(form.email, form.password, form.totp_token);
      if (res?.mfa_required) {
        setMfaPrompt(true);
        setError(res.message || 'MFA is enabled. Enter your 6-digit Authenticator code.');
        return;
      }
      navigate(res.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        (err.request ? 'Unable to reach server. Please check your connection or backend status.' : err.message) ||
        'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 'var(--space-7)' }}>
      <h1 style={{ fontSize: '2rem' }}>Welcome back</h1>
      <p>Log in to report or track accessibility issues.</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && (
          <div className="field" style={{ background: mfaPrompt && !form.totp_token ? 'var(--color-info-tint, rgba(59, 130, 246, 0.1))' : 'var(--color-danger-tint)', color: mfaPrompt && !form.totp_token ? 'var(--color-primary, #3b82f6)' : 'var(--color-danger)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} disabled={mfaPrompt} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <div style={{ position: 'relative' }}>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={form.password}
              onChange={handleChange}
              disabled={mfaPrompt}
              style={{ paddingRight: 42 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        {mfaPrompt && (
          <div className="field">
            <label htmlFor="totp_token">6-Digit Authenticator Code</label>
            <input
              id="totp_token"
              name="totp_token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="e.g. 123456"
              required
              autoFocus
              value={form.totp_token}
              onChange={handleChange}
            />
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Verifying…' : (mfaPrompt ? 'Verify & Log in' : 'Log in')}
        </button>
      </form>

      <p className="mt-4">New here? <Link to="/register">Create an account</Link></p>
    </div>
  );
}
