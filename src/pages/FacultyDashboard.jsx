import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, ScanSearch, Download } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/Badge';
import { getFacultyDocuments, getFacultyStats } from '../api/documents';

function exportCsv(documents) {
  const header = ['Student', 'Document', 'AI %', 'Plagiarism %', 'Status'];
  const rows = documents.map((d) => [d.ownerName, d.filename, d.aiPercent ?? '', d.plagiarismPercent ?? '', d.status]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'submissions.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ totalDocuments: 0, avgAiPercent: 0, avgPlagiarismPercent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFacultyDocuments(), getFacultyStats()])
      .then(([docs, s]) => {
        setDocuments(docs);
        setStats(s);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Faculty Dashboard</h1>

      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'var(--accent-2)' },
          { label: 'Avg. AI Content', value: `${stats.avgAiPercent}%`, icon: Sparkles, color: 'var(--warning)' },
          { label: 'Avg. Plagiarism', value: `${stats.avgPlagiarismPercent}%`, icon: ScanSearch, color: 'var(--danger)' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl p-5 flex items-center gap-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--panel-2)' }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div className="text-sm text-[var(--text-dim)]">{label}</div>
              <div className="text-2xl font-semibold">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-medium text-base m-0">Recent Submissions</h2>
          <button
            onClick={() => exportCsv(documents)}
            disabled={documents.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No submissions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Student Name</th>
                <th className="font-normal px-5 py-3">Document</th>
                <th className="font-normal px-5 py-3">AI %</th>
                <th className="font-normal px-5 py-3">Plagiarism %</th>
                <th className="font-normal px-5 py-3">Status</th>
                <th className="font-normal px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr
                  key={d.id}
                  className="border-t cursor-pointer hover:bg-[var(--panel-2)]"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => navigate(`/app/document/${d.id}`)}
                >
                  <td className="px-5 py-3">{d.ownerName}</td>
                  <td className="px-5 py-3">{d.filename}</td>
                  <td className="px-5 py-3">{d.aiPercent != null ? `${d.aiPercent}%` : '—'}</td>
                  <td className="px-5 py-3">{d.plagiarismPercent != null ? `${d.plagiarismPercent}%` : '—'}</td>
                  <td className="px-5 py-3"><Badge status={d.status} /></td>
                  <td className="px-5 py-3 text-[var(--accent-2)]">View →</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
