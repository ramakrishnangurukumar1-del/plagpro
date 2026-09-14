import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle, FileText, AlertTriangle } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { getDocumentResult } from '../api/documents';
import { processingSteps } from '../mock/data';

export default function Processing() {
  const [progress, setProgress] = useState(8);
  const [status, setStatus] = useState('QUEUED');
  const [filename, setFilename] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const result = await getDocumentResult(id);
        if (cancelled) return;
        setFilename(result.filename);
        setStatus(result.status);

        if (result.status === 'COMPLETED') {
          setProgress(100);
          setTimeout(() => navigate(`/app/results/${id}`), 500);
          return;
        }
        if (result.status === 'FAILED') {
          return;
        }
        setProgress((p) => Math.min(p + 12, 92));
        pollRef.current = setTimeout(poll, 1200);
      } catch {
        pollRef.current = setTimeout(poll, 1500);
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(pollRef.current);
    };
  }, [id, navigate]);

  const stepIndex = Math.min(Math.floor((progress / 100) * processingSteps.length), processingSteps.length - 1);

  if (status === 'FAILED') {
    return (
      <AppLayout>
        <div className="rounded-2xl p-10 flex flex-col items-center text-center" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <AlertTriangle size={40} color="var(--danger)" className="mb-4" />
          <h1 className="text-xl font-semibold mb-2">Analysis failed</h1>
          <p className="text-sm text-[var(--text-dim)] mb-6">Something went wrong while processing this document. Try uploading it again.</p>
          <button
            onClick={() => navigate('/app/upload')}
            className="px-5 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Back to Upload
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-1">Analyzing Your Document</h1>
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
              <span>{filename || 'Uploading...'}</span>
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
