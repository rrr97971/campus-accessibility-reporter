import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import { getIssueById, updateIssue } from '../api/issues';

export default function EditIssue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getIssueById(id)
      .then(issue => setForm({
        title: issue.title, description: issue.description, category: issue.category,
        location_building: issue.location_building || '', location_area: issue.location_area || ''
      }))
      .catch(() => setError('Could not load this report.'));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await updateIssue(id, form);
      navigate(`/issues/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not save your changes.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) return <div className="container mt-6"><p>{error || 'Loading…'}</p></div>;

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>Edit report</h1>
      <p>You can only edit a report while it's still marked "Reported".</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && (
          <div className="field" style={{ background: 'var(--color-danger-tint)', color: 'var(--color-danger)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required value={form.title} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" required value={form.description} onChange={handleChange} />
        </div>
        <div className="row gap-3">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="location_building">Building / block</label>
            <input id="location_building" name="location_building" value={form.location_building} onChange={handleChange} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="location_area">Floor / area</label>
            <input id="location_area" name="location_area" value={form.location_area} onChange={handleChange} />
          </div>
        </div>
        <div className="row gap-3 mt-4">
          <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving…' : 'Save changes'}</button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
