const styles = {
  Completed: { bg: 'rgba(52,211,153,0.15)', color: 'var(--success)' },
  Processing: { bg: 'rgba(251,191,36,0.15)', color: 'var(--warning)' },
  Failed: { bg: 'rgba(248,113,113,0.15)', color: 'var(--danger)' },
};

export default function Badge({ status }) {
  const s = styles[status] || styles.Completed;
  return (
    <span
      className="px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}
