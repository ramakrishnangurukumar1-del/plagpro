export default function Bar({ label, value, color = 'var(--accent)' }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-sm text-[var(--text-dim)] w-40 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--border)] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-sm font-medium w-10 text-right">{value}%</span>
    </div>
  );
}
