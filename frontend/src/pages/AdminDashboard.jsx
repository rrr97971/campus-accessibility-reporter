import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllIssuesAdmin, getDashboardStats } from '../api/admin';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllIssuesAdmin()])
      .then(([statsData, issues]) => {
        setStats(statsData);
        setRecentIssues(issues.slice(0, 5));
      })
      .catch(() => setError('Could not load the dashboard right now.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container mt-6"><p>Loading dashboard…</p></div>;
  if (error) return <div className="container mt-6"><p style={{ color: 'var(--color-danger)' }}>{error}</p></div>;

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>

      <div className="grid-stats mt-4">
        <div className="card"><p className="text-muted" style={{marginBottom:4}}>Total issues</p><h2>{stats.total}</h2></div>
        <div className="card"><p className="text-muted" style={{marginBottom:4}}>Reported</p><h2>{stats.reported}</h2></div>
        <div className="card"><p className="text-muted" style={{marginBottom:4}}>Under review</p><h2>{stats.under_review}</h2></div>
        <div className="card"><p className="text-muted" style={{marginBottom:4}}>In progress</p><h2>{stats.in_progress}</h2></div>
        <div className="card"><p className="text-muted" style={{marginBottom:4}}>Resolved</p><h2>{stats.resolved}</h2></div>
        <div className="card" style={{ borderColor: 'var(--color-danger)' }}>
          <p className="text-muted" style={{marginBottom:4}}>Critical issues</p><h2 style={{ color: 'var(--color-danger)' }}>{stats.critical}</h2>
        </div>
      </div>

      <div className="row mt-6" style={{ justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '1.3rem' }}>Recent issues</h2>
        <Link to="/admin/issues">View all →</Link>
      </div>

      <div className="card mt-4" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th>Reporter</th></tr>
          </thead>
          <tbody>
            {recentIssues.map(issue => (
              <tr key={issue.id}>
                <td><Link to={`/admin/issues/${issue.id}`}>{issue.title}</Link></td>
                <td>{issue.category}</td>
                <td><PriorityBadge priority={issue.priority} /></td>
                <td><StatusBadge status={issue.status} /></td>
                <td>{issue.reporter_name}</td>
              </tr>
            ))}
            {recentIssues.length === 0 && (
              <tr><td colSpan={5} className="text-muted">No issues reported yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
