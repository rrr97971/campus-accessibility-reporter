import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../data/constants';
import { createIssue } from '../api/issues';
import { uploadImage } from '../api/uploads';

export default function ReportIssue() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: CATEGORIES[0],
    location_building: '', location_area: '', location_description: ''
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploadError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImageUrl(url);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Could not upload the image. You can still submit without it.');
      setImageUrl(null);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createIssue({ ...form, image_url: imageUrl });
      navigate('/my-reports');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not submit your report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
      <h1 style={{ fontSize: '2rem' }}>Report an accessibility issue</h1>
      <p>The more detail you give, the faster maintenance staff can act.</p>

      <form className="card" onSubmit={handleSubmit}>
        {error && (
          <div className="field" style={{ background: 'var(--color-danger-tint)', color: 'var(--color-danger)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
            {error}
          </div>
        )}
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" required placeholder="e.g. Broken ramp near Block A entrance"
                 value={form.title} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="field">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" required
                    placeholder="Describe what's wrong and why it's a problem"
                    value={form.description} onChange={handleChange} />
        </div>

        <h3 style={{ fontSize: '1rem', marginTop: 'var(--space-2)' }}>Location</h3>
        <div className="row gap-3">
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="location_building">Building / block</label>
            <input id="location_building" name="location_building" placeholder="e.g. Block A"
                   value={form.location_building} onChange={handleChange} />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="location_area">Floor / area</label>
            <input id="location_area" name="location_area" placeholder="e.g. Ground floor"
                   value={form.location_area} onChange={handleChange} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="location_description">Specific location description</label>
          <input id="location_description" name="location_description" placeholder="e.g. Near the main entrance, left side"
                 value={form.location_description} onChange={handleChange} />
        </div>

        <div className="field">
          <label htmlFor="image">Photo evidence (optional)</label>
          <input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} />
          {uploading && <p className="hint">Uploading image…</p>}
          {uploadError && <p className="hint" style={{ color: 'var(--color-danger)' }}>{uploadError}</p>}
          {imageUrl && !uploading && <p className="hint" style={{ color: 'var(--color-success)' }}>Image uploaded successfully.</p>}
          {imagePreview && (
            <img src={imagePreview} alt="Preview of uploaded evidence" style={{ marginTop: 8, maxHeight: 160, borderRadius: 'var(--radius-sm)' }} />
          )}
        </div>

        <button type="submit" className="btn btn-primary btn-block mt-4" disabled={submitting || uploading}>
          {submitting ? 'Submitting…' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}
