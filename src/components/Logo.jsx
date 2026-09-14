export default function Logo({ size = 'md' }) {
  const text = size === 'lg' ? 'text-2xl' : 'text-base';
  const mark = size === 'lg' ? 34 : 26;
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={mark} height={mark} viewBox="0 0 40 40" fill="none">
        <path d="M8 34 V8 L28 8 L14 20 L28 32 L8 34 Z" fill="url(#logo-grad)" />
        <defs>
          <linearGradient id="logo-grad" x1="8" y1="8" x2="28" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--accent)" />
            <stop offset="1" stopColor="var(--accent-2)" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`font-semibold tracking-tight ${text}`}>PlagPro</span>
    </div>
  );
}
