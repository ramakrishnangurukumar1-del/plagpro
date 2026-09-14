import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { getMyDocuments, getFacultyDocuments } from '../api/documents';

export default function Reports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFaculty = user?.role === 'FACULTY';

  useEffect(() => {
    const fetcher = isFaculty ? getFacultyDocuments : getMyDocuments;
    fetcher()
      .then((docs) => setDocuments(docs.filter((d) => d.status === 'COMPLETED')))
      .finally(() => setLoading(false));
  }, [isFaculty]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No completed reports yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Document</th>
                {isFaculty && <th className="font-normal px-5 py-3">Student</th>}
                <th className="font-normal px-5 py-3">AI %</th>
                <th className="font-normal px-5 py-3">Plagiarism %</th>
                <th className="font-normal px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">{d.filename}</td>
                  {isFaculty && <td className="px-5 py-3 text-[var(--text-dim)]">{d.ownerName}</td>}
                  <td className="px-5 py-3">{d.aiPercent}%</td>
                  <td className="px-5 py-3">{d.plagiarismPercent}%</td>
                  <td
                    className="px-5 py-3 text-[var(--accent-2)] cursor-pointer flex items-center gap-1"
                    onClick={() => navigate(`/app/report/${d.id}`)}
                  >
                    <Download size={14} /> View Report
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
