import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Clock } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { getMyDocuments } from '../api/documents';

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  const completed = documents.filter((d) => d.aiPercent != null);
  const avgAi = completed.length
    ? Math.round(completed.reduce((s, d) => s + d.aiPercent, 0) / completed.length)
    : 0;
  const avgPlagiarism = completed.length
    ? Math.round(completed.reduce((s, d) => s + d.plagiarismPercent, 0) / completed.length)
    : 0;

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back, {user?.fullName?.split(' ')[0]}</h1>
          <p className="text-[var(--text-dim)] text-sm mt-1">Here's what's happening with your documents.</p>
        </div>
        <button
          onClick={() => navigate('/app/upload')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          <UploadCloud size={18} />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Documents Analyzed', value: String(documents.length), icon: FileText },
          { label: 'Avg. AI Content', value: `${avgAi}%`, icon: Clock },
          { label: 'Avg. Plagiarism', value: `${avgPlagiarism}%`, icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl p-5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-dim)]">{label}</span>
              <Icon size={18} className="text-[var(--accent-2)]" />
            </div>
            <div className="text-3xl font-semibold mt-2">{value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-medium text-base m-0">Recent Documents</h2>
          <button onClick={() => navigate('/app/documents')} className="text-xs" style={{ color: 'var(--accent-2)' }}>View All</button>
        </div>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No documents yet — upload one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Document</th>
                <th className="font-normal px-5 py-3">AI %</th>
                <th className="font-normal px-5 py-3">Plagiarism %</th>
                <th className="font-normal px-5 py-3">Status</th>
                <th className="font-normal px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documents.slice(0, 5).map((d) => (
                <tr key={d.id} className="border-t cursor-pointer hover:bg-[var(--panel-2)]" style={{ borderColor: 'var(--border)' }} onClick={() => navigate(`/app/document/${d.id}`)}>
                  <td className="px-5 py-3 flex items-center gap-2">
                    <FileText size={16} className="text-[var(--text-dim)]" />
                    {d.filename}
                  </td>
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
