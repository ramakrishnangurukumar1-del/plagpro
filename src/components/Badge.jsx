const styles = {
  completed: { bg: 'rgba(52,211,153,0.15)', color: 'var(--success)' },
  processing: { bg: 'rgba(251,191,36,0.15)', color: 'var(--warning)' },
  queued: { bg: 'rgba(154,157,179,0.15)', color: 'var(--text-dim)' },
  failed: { bg: 'rgba(248,113,113,0.15)', color: 'var(--danger)' },
};

export default function Badge({ status }) {
  const key = (status || '').toLowerCase();
  const s = styles[key] || styles.completed;
  const label = status ? status[0] + status.slice(1).toLowerCase() : 'Completed';
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {label}
    </span>
  );
}
