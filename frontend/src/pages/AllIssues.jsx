import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { STATUS_STEPS, PRIORITIES, CATEGORIES } from '../data/constants';
import { getAllIssuesAdmin } from '../api/admin';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';

export default function AllIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      getAllIssuesAdmin({
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined
      })
        .then(setIssues)
        .catch(() => setError('Could not load issues right now.'))
        .finally(() => setLoading(false));
    }, 300); // light debounce so typing in search doesn't fire a request per keystroke

    return () => clearTimeout(timeout);
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>All Issues</h1>

      <div className="card row gap-3" style={{ flexWrap: 'wrap' }}>
        <input placeholder="Search by title…" value={search} onChange={e => setSearch(e.target.value)}
               style={{ flex: 2, minWidth: 200 }} aria-label="Search issues" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} aria-label="Filter by status" style={{ flex: 1, minWidth: 150 }}>
          <option value="">All statuses</option>
          {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} aria-label="Filter by priority" style={{ flex: 1, minWidth: 150 }}>
          <option value="">All priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} aria-label="Filter by category" style={{ flex: 1, minWidth: 150 }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      <div className="card mt-4" style={{ padding: 0, overflow: 'hidden' }}>
        <table>
          <thead>
            <tr><th>Issue</th><th>Category</th><th>Location</th><th>Priority</th><th>Status</th><th>Reporter</th><th>Date</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="text-muted">Loading…</td></tr>}
            {!loading && issues.map(issue => (
              <tr key={issue.id}>
                <td><Link to={`/admin/issues/${issue.id}`}>{issue.title}</Link></td>
                <td>{issue.category}</td>
                <td>{issue.location_building}</td>
                <td><PriorityBadge priority={issue.priority} /></td>
                <td><StatusBadge status={issue.status} /></td>
                <td>{issue.reporter_name}</td>
                <td>{new Date(issue.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && issues.length === 0 && (
              <tr><td colSpan={7} className="text-muted">No issues match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
