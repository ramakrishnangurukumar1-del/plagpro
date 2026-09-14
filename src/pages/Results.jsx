import { useNavigate, useParams } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Donut from '../components/Donut';
import Bar from '../components/Bar';
import { currentUser, modelScores, plagiarismSources } from '../mock/data';

export default function Results() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <AppLayout role="Student" user={currentUser}>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold">Analysis Results</h1>
        <button
          onClick={() => navigate(`/app/report/${id}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          <Download size={16} />
          Download PDF
        </button>
      </div>
      <p className="text-[var(--text-dim)] text-sm mb-6 flex items-center gap-2">
        <FileText size={14} /> Assignment1.pdf &nbsp;•&nbsp; 2.4 MB &nbsp;•&nbsp; Completed: 12 Apr 2025, 10:42 AM
      </p>

      <div className="grid grid-cols-2 gap-5 mb-6">
        <div className="rounded-xl p-6 flex flex-col items-center" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <span className="text-sm text-[var(--text-dim)] mb-4 self-start">AI CONTENT</span>
          <Donut value={72} color="var(--accent-2)" label="Likely AI-generated" />
        </div>
        <div className="rounded-xl p-6 flex flex-col items-center" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <span className="text-sm text-[var(--text-dim)] mb-4 self-start">PLAGIARISM</span>
          <Donut value={18} color="var(--warning)" label="Matched with sources" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-xl p-5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-medium mb-3">AI Analysis (Model Scores)</h2>
          {modelScores.map((m) => (
            <Bar key={m.name} label={m.name} value={m.score} color="var(--accent-2)" />
          ))}
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Bar label="Overall AI Score" value={72} color="var(--accent)" />
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
          <h2 className="text-base font-medium mb-3">Plagiarism Sources</h2>
          {plagiarismSources.map((s) => (
            <div key={s.name} className="flex items-center justify-between py-2 text-sm border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
              <span>{s.name}</span>
              <span className="text-[var(--text-dim)]">{s.similarity}%</span>
            </div>
          ))}
          <button
            onClick={() => navigate(`/app/document/${id}`)}
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: 'var(--panel-2)', color: 'var(--accent-2)' }}
          >
            View Detailed Report
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
