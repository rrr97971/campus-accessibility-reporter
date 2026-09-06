const PRIORITY_STYLE = {
  'Low':      { bg: '#EFEDE4', fg: '#5B5B56', glyph: '▾' },
  'Medium':   { bg: '#E4EEEE', fg: '#0A3A3D', glyph: '▸' },
  'High':     { bg: '#FBEBDD', fg: '#8A4A16', glyph: '▲' },
  'Critical': { bg: '#FBE9E7', fg: '#B3261E', glyph: '!' },
};

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLE[priority] || PRIORITY_STYLE['Medium'];
  return (
    <span className="badge" style={{ background: style.bg, color: style.fg }}>
      <span aria-hidden="true">{style.glyph}</span>
      {priority}
    </span>
  );
}
