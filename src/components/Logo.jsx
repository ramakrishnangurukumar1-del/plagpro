import { ShieldCheck } from 'lucide-react';

export default function Logo({ size = 'md' }) {
  const text = size === 'lg' ? 'text-2xl' : 'text-base';
  const icon = size === 'lg' ? 32 : 20;
  return (
    <div className="flex items-center gap-2 select-none">
      <div
        className="flex items-center justify-center rounded-lg"
        style={{
          width: icon + 12,
          height: icon + 12,
          background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
        }}
      >
        <ShieldCheck size={icon} color="white" />
      </div>
      <span className={`font-semibold tracking-tight ${text}`}>
        AI Plagiarism Detector
      </span>
    </div>
  );
}
