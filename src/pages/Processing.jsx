import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle, FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { currentUser, processingSteps } from '../mock/data';

export default function Processing() {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(p + 4, 100);
        if (next === 100) clearInterval(interval);
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setStepIndex(Math.min(Math.floor((progress / 100) * processingSteps.length), processingSteps.length - 1));
    if (progress >= 100) {
      const t = setTimeout(() => navigate(`/app/results/${id}`), 500);
      return () => clearTimeout(t);
    }
  }, [progress, id, navigate]);

  return (
    <AppLayout role="Student" user={currentUser}>
      <h1 className="text-2xl font-semibold mb-1">Analyzing Your Documents</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">This may take a few minutes. Please keep this page open.</p>

      <div className="rounded-2xl p-6" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-8">
          {processingSteps.map((s, i) => (
            <div key={s.key} className="flex-1 flex flex-col items-center relative">
              {i > 0 && (
                <div
                  className="absolute top-4 right-1/2 h-0.5 w-full -z-0"
                  style={{ background: i <= stepIndex ? 'var(--accent-2)' : 'var(--border)' }}
                />
              )}
              <div className="z-10 mb-2" style={{ background: 'var(--panel)' }}>
                {i < stepIndex ? (
                  <CheckCircle2 size={28} color="var(--success)" />
                ) : i === stepIndex ? (
                  <Loader2 size={28} className="animate-spin" color="var(--accent-2)" />
                ) : (
                  <Circle size={28} color="var(--border)" />
                )}
              </div>
              <span className="text-xs text-center text-[var(--text-dim)]">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--panel-2)' }}>
          <FileText size={28} className="text-[var(--accent-2)] shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm mb-1.5">
              <span>Assignment1.pdf (2.4 MB)</span>
              <span className="text-[var(--text-dim)]">{progress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          {processingSteps.map((s, i) => (
            <div key={s.key} className="flex items-center justify-between px-2 py-2 text-sm">
              <span className={i <= stepIndex ? '' : 'text-[var(--text-dim)]'}>{s.label}</span>
              <span
                style={{
                  color: i < stepIndex ? 'var(--success)' : i === stepIndex ? 'var(--accent-2)' : 'var(--text-dim)',
                }}
              >
                {i < stepIndex ? 'Completed' : i === stepIndex ? 'In Progress' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
