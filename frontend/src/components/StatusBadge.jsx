const STATUS_STYLE = {
  'Reported':      { bg: '#EFEDE4', fg: '#5B5B56', glyph: '●' },
  'Under Review':  { bg: '#FBEBDD', fg: '#8A4A16', glyph: '◐' },
  'Assigned':      { bg: '#E4EEEE', fg: '#0A3A3D', glyph: '➜' },
  'In Progress':   { bg: '#E4EEEE', fg: '#0F5257', glyph: '⚙' },
  'Resolved':      { bg: '#E6F4EB', fg: '#2E7D4F', glyph: '✓' },
  'Closed':        { bg: '#EFEDE4', fg: '#5B5B56', glyph: '■' },
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE['Reported'];
  return (
    <span className="badge" style={{ background: style.bg, color: style.fg }}>
      <span aria-hidden="true">{style.glyph}</span>
      {status}
    </span>
  );
}
