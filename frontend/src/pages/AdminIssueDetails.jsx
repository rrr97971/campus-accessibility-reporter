import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { STATUS_STEPS, PRIORITIES } from '../data/constants';
import { getIssueById, getIssueUpdates } from '../api/issues';
import { updateIssueStatus, updateIssuePriority, assignIssue, deleteIssueAdmin } from '../api/admin';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AdminIssueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [comment, setComment] = useState('');

  function loadAll() {
    setLoading(true);
    Promise.all([getIssueById(id), getIssueUpdates(id)])
      .then(([issueData, updatesData]) => {
        setIssue(issueData);
        setUpdates(updatesData);
        setStatus(issueData.status);
        setPriority(issueData.priority);
        setAssignee(issueData.assigned_to || '');
      })
      .catch(() => setError('Could not load this issue.'))
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');
    try {
      if (status !== issue.status) {
        await updateIssueStatus(id, status, comment || undefined);
      }
      if (priority !== issue.priority) {
        await updateIssuePriority(id, priority);
      }
      if (assignee && assignee !== issue.assigned_to) {
        await assignIssue(id, assignee);
      }
      setComment('');
      setSaveMessage('Saved.');
      loadAll();
    } catch (err) {
      setSaveMessage(err.response?.data?.error || 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteIssueAdmin(id);
      navigate('/admin/issues');
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this report.');
    }
  }

  if (loading) return <div className="container mt-6"><p>Loading…</p></div>;
  if (error || !issue) return <div className="container mt-6"><p style={{ color: 'var(--color-danger)' }}>{error || 'Issue not found.'}</p></div>;

  return (
    <div className="container" style={{ maxWidth: 780, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <Link to="/admin/issues">← Back to all issues</Link>

      <div className="row mt-4" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: '1.75rem' }}>{issue.title}</h1>
        <div className="row gap-2">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>

      <div className="card mt-4">
        <h3>Description</h3>
        <p>{issue.description}</p>
        <div className="row gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
          <div><p className="text-muted" style={{marginBottom:2}}>Category</p><p style={{color:'var(--color-text)'}}>{issue.category}</p></div>
          <div><p className="text-muted" style={{marginBottom:2}}>Location</p><p style={{color:'var(--color-text)'}}>{issue.location_building} · {issue.location_area}</p></div>
          <div><p className="text-muted" style={{marginBottom:2}}>Reporter</p><p style={{color:'var(--color-text)'}}>{issue.reporter_name || issue.user_id}</p></div>
          <div><p className="text-muted" style={{marginBottom:2}}>Reported on</p><p style={{color:'var(--color-text)'}}>{new Date(issue.created_at).toLocaleDateString()}</p></div>
        </div>
        {issue.image_url && <img src={issue.image_url} alt="Evidence of the reported issue" style={{ marginTop: 12, maxWidth: '100%', borderRadius: 'var(--radius-sm)' }} />}
      </div>

      <form className="card mt-4" onSubmit={handleSave}>
        <h3>Manage this issue</h3>
        {saveMessage && <p className="hint">{saveMessage}</p>}
        <div className="row gap-4" style={{ flexWrap: 'wrap' }}>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="priority">Priority</label>
            <select id="priority" value={priority} onChange={e => setPriority(e.target.value)}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="field" style={{ flex: 1, minWidth: 180 }}>
            <label htmlFor="assignee">Assign to</label>
            <input id="assignee" placeholder="e.g. Maintenance Team B" value={assignee} onChange={e => setAssignee(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="comment">Resolution note / comment</label>
          <textarea id="comment" placeholder="Explain what was found or done… (attached to a status change)" value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <div className="row gap-3">
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save update'}</button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>Delete report</button>
        </div>
      </form>

      <div className="card mt-4">
        <h3>Update history</h3>
        {updates.length === 0 && <p>No updates yet.</p>}
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
    </div>
  );
}
