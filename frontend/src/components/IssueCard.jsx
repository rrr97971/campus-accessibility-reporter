import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

export default function IssueCard({ issue, detailsPath }) {
  return (
    <Link to={detailsPath} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginBottom: 'var(--space-4)' }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ marginBottom: 4 }}>{issue.title}</h3>
          <p className="text-muted" style={{ marginBottom: 8 }}>
            {issue.location_building}{issue.location_area ? ` · ${issue.location_area}` : ''}
          </p>
        </div>
        <div className="row gap-2">
          <PriorityBadge priority={issue.priority} />
          <StatusBadge status={issue.status} />
        </div>
      </div>
      <p style={{ margin: 0 }}>{issue.category} · Reported {issue.created_at}</p>
    </Link>
  );
}
