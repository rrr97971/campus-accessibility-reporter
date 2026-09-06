import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-8)' }}>
      <div style={{ maxWidth: 640 }}>
        <span className="badge" style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-4)' }}>
          Built for our campus community
        </span>
        <h1>Report what stands in the way.</h1>
        <p style={{ fontSize: '1.1rem' }}>
          A broken ramp, a jammed elevator, a missing sign — small things that make a
          real difference to someone who depends on them. Report accessibility issues
          around campus in under a minute, and track exactly what happens next.
        </p>
        <div className="row gap-3 mt-6">
          <Link to="/register" className="btn btn-primary">Report an issue</Link>
          <Link to="/login" className="btn btn-secondary">I already have an account</Link>
        </div>
      </div>

      <div className="grid-stats mt-8">
        <div className="card">
          <h3>1. Report</h3>
          <p>Describe the problem, pin the location, attach a photo if you have one.</p>
        </div>
        <div className="card">
          <h3>2. Track</h3>
          <p>Follow the status from Reported through to Resolved, with a full update history.</p>
        </div>
        <div className="card">
          <h3>3. Resolve</h3>
          <p>Campus maintenance staff triage, prioritize, and close the loop with you.</p>
        </div>
      </div>
    </div>
  );
}
