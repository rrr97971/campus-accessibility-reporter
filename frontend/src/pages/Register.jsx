import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard'); // new accounts are always students
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 440, paddingTop: 'var(--space-7)' }}>
      <h1 style={{ fontSize: '2rem' }}>Create your account</h1>
      <p>Register with your campus email to start reporting issues.</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && (
          <div className="field" style={{ background: 'var(--color-danger-tint)', color: 'var(--color-danger)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" required value={form.name} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="email">Campus email</label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} required value={form.password} onChange={handleChange} />
          <p className="hint">At least 6 characters.</p>
        </div>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-4">Already have an account? <Link to="/login">Log in</Link></p>
    </div>
  );
}
