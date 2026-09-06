import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyIssues } from '../api/issues';
import IssueCard from '../components/IssueCard';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyIssues()
      .then(setIssues)
      .catch(() => setError('Could not load your reports right now.'))
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: issues.length,
    underReview: issues.filter(i => i.status === 'Under Review').length,
    inProgress: issues.filter(i => i.status === 'In Progress' || i.status === 'Assigned').length,
    resolved: issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length,
  };

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p>Here's where your reports stand.</p>
        </div>
        <Link to="/report" className="btn btn-primary">+ Report an Issue</Link>
      </div>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {loading && <p>Loading your dashboard…</p>}

      {!loading && !error && (
        <>
          <div className="grid-stats mt-4">
            <div className="card"><p className="text-muted" style={{marginBottom:4}}>Total reports</p><h2>{counts.total}</h2></div>
            <div className="card"><p className="text-muted" style={{marginBottom:4}}>Under review</p><h2>{counts.underReview}</h2></div>
            <div className="card"><p className="text-muted" style={{marginBottom:4}}>In progress</p><h2>{counts.inProgress}</h2></div>
            <div className="card"><p className="text-muted" style={{marginBottom:4}}>Resolved</p><h2>{counts.resolved}</h2></div>
          </div>

          <div className="row mt-6" style={{ justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.3rem' }}>Recent reports</h2>
            <Link to="/my-reports">View all →</Link>
          </div>
          <div className="mt-4">
            {issues.length === 0 && <p>You haven't reported anything yet.</p>}
            {issues.slice(0, 3).map(issue => (
              <IssueCard key={issue.id} issue={issue} detailsPath={`/issues/${issue.id}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
