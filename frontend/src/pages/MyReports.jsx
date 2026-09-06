import { useEffect, useState } from 'react';
import { STATUS_STEPS, CATEGORIES } from '../data/constants';
import { getMyIssues } from '../api/issues';
import IssueCard from '../components/IssueCard';

export default function MyReports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    // status/category filtering happens server-side; search is client-side
    getMyIssues({ status: statusFilter || undefined, category: categoryFilter || undefined })
      .then(setIssues)
      .catch(() => setError('Could not load your reports right now.'))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter]);

  const filtered = issues.filter(issue => issue.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container" style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>My Reports</h1>

      <div className="card row gap-3" style={{ flexWrap: 'wrap' }}>
        <input
          placeholder="Search your reports…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 2, minWidth: 200 }}
          aria-label="Search reports"
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, minWidth: 160 }} aria-label="Filter by status">
          <option value="">All statuses</option>
          {STATUS_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ flex: 1, minWidth: 160 }} aria-label="Filter by category">
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}
      {loading && <p className="mt-4">Loading…</p>}

      {!loading && !error && (
        <div className="mt-4">
          {filtered.length === 0 && <p>No reports match your filters.</p>}
          {filtered.map(issue => (
            <IssueCard key={issue.id} issue={issue} detailsPath={`/issues/${issue.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
