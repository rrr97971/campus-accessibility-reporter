import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>Profile</h1>

      <div className="card">
        <div className="field">
          <label>Name</label>
          <p style={{ color: 'var(--color-text)' }}>{user.name}</p>
        </div>
        <div className="field">
          <label>Email</label>
          <p style={{ color: 'var(--color-text)' }}>{user.email}</p>
        </div>
        <div className="field">
          <label>Role</label>
          <p style={{ color: 'var(--color-text)', textTransform: 'capitalize' }}>{user.role}</p>
        </div>
      </div>
    </div>
  );
}
