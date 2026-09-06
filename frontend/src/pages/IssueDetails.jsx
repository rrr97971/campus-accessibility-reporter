import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { STATUS_STEPS } from '../data/constants';
import { getIssueById, deleteIssue, getIssueUpdates } from '../api/issues';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function IssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getIssueById(id), getIssueUpdates(id)])
      .then(([issueData, updatesData]) => {
        setIssue(issueData);
        setUpdates(updatesData);
      })
      .catch(() => setError('Could not load this report.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteIssue(id);
      navigate('/my-reports');
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this report.');
    }
  }

  if (loading) return <div className="container mt-6"><p>Loading…</p></div>;
  if (error || !issue) return <div className="container mt-6"><p style={{ color: 'var(--color-danger)' }}>{error || 'Report not found.'}</p></div>;

  const currentStepIndex = STATUS_STEPS.indexOf(issue.status);
  const canEdit = issue.status === 'Reported';

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <Link to="/my-reports">← Back to my reports</Link>

      <div className="row mt-4" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{issue.title}</h1>
        <div className="row gap-2">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <div className="card mt-4">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {STATUS_STEPS.map((step, idx) => (
            <div key={step} className="stack" style={{ alignItems: 'center', flex: 1, textAlign: 'center' }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%',
                background: idx <= currentStepIndex ? 'var(--color-primary)' : 'var(--color-border)'
              }} aria-hidden="true" />
              <span style={{ fontSize: '0.72rem', marginTop: 6, color: idx <= currentStepIndex ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-4">
        <h3>Description</h3>
        <p>{issue.description}</p>
        <div className="row gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
          <div><p className="text-muted" style={{marginBottom:2}}>Category</p><p style={{color:'var(--color-text)'}}>{issue.category}</p></div>
          <div><p className="text-muted" style={{marginBottom:2}}>Location</p><p style={{color:'var(--color-text)'}}>{issue.location_building} · {issue.location_area}</p></div>
          <div><p className="text-muted" style={{marginBottom:2}}>Reported on</p><p style={{color:'var(--color-text)'}}>{new Date(issue.created_at).toLocaleDateString()}</p></div>
        </div>
        {issue.image_url && <img src={issue.image_url} alt="Evidence of the reported issue" style={{ marginTop: 12, maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />}
      </div>

      <div className="card mt-4">
        <h3>Update history</h3>
        {updates.length === 0 && <p>No updates yet — you'll see status changes and resolution notes here.</p>}
        <div className="stack gap-3">
          {updates.map(u => (
            <div key={u.id} style={{ borderLeft: '3px solid var(--color-primary)', paddingLeft: 12 }}>
              <p style={{ margin: 0, color: 'var(--color-text)', fontWeight: 600 }}>{u.previous_status} → {u.new_status}</p>
              {u.comment && <p style={{ margin: 0 }}>{u.comment}</p>}
              <p className="hint">{u.updated_by_name} · {new Date(u.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {canEdit && (
        <div className="row gap-3 mt-4">
          <Link to={`/issues/${issue.id}/edit`} className="btn btn-secondary">Edit report</Link>
          <button className="btn btn-danger" onClick={handleDelete}>Delete report</button>
        </div>
      )}
      {!canEdit && (
        <p className="hint mt-4">This report can no longer be edited or deleted since it's already {issue.status.toLowerCase()}.</p>
      )}
    </div>
  );
}
