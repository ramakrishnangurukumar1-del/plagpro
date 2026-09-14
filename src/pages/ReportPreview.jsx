import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { modelScores, matchedSources } from '../mock/data';

export default function ReportPreview() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header
        className="h-14 shrink-0 flex items-center justify-between px-5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-sm text-[var(--text-dim)]">analysis_report.pdf</span>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          <Download size={14} /> Download
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-2xl bg-white text-gray-900 rounded-lg shadow-2xl p-10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }} />
            <span className="text-xs font-semibold text-gray-500">AI PLAGIARISM DETECTOR</span>
          </div>
          <h1 className="text-xl font-bold mt-4 mb-1">Document Analysis Report</h1>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-6 pb-4 border-b">
            <div><div className="font-medium text-gray-700">File Name</div>Assignment1.pdf</div>
            <div><div className="font-medium text-gray-700">Student</div>Arun Kumar</div>
            <div><div className="font-medium text-gray-700">Date</div>12 Apr 2025, 10:42 AM</div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">AI Content Detection</div>
              <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>72%</div>
              <div className="text-xs text-gray-500">Likely AI-generated</div>
            </div>
            <div className="border rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">Plagiarism Detection</div>
              <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>18%</div>
              <div className="text-xs text-gray-500">Matched with sources</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Model Scores</div>
              {modelScores.slice(0, 4).map((m) => (
                <div key={m.name} className="flex justify-between text-xs py-1 text-gray-600">
                  <span>{m.name}</span>
                  <span>{m.score}%</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs font-medium text-gray-700 mb-2">Top Matched Sources</div>
              {matchedSources.map((s, i) => (
                <div key={s.id} className="flex justify-between text-xs py-1 text-gray-600">
                  <span>{i + 1}. {s.name}</span>
                  <span>{s.similarity}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
