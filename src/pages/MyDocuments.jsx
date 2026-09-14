import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/Badge';
import { getMyDocuments } from '../api/documents';

export default function MyDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">My Documents</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No documents yet — upload one to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Document</th>
                <th className="font-normal px-5 py-3">Uploaded</th>
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
                  <td className="px-5 py-3 flex items-center gap-2">
                    <FileText size={16} className="text-[var(--text-dim)]" />
                    {d.filename}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-dim)]">
                    {new Date(d.uploadedAt).toLocaleDateString()}
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
