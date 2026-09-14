import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/Badge';
import { currentUser, documents } from '../mock/data';

export default function MyDocuments() {
  const navigate = useNavigate();
  return (
    <AppLayout role="Student" user={currentUser}>
      <h1 className="text-2xl font-semibold mb-6">My Documents</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
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
                  {d.name}
                </td>
                <td className="px-5 py-3 text-[var(--text-dim)]">
                  {new Date(d.uploadedAt).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">{d.aiPercent}%</td>
                <td className="px-5 py-3">{d.plagiarismPercent}%</td>
                <td className="px-5 py-3"><Badge status={d.status} /></td>
                <td className="px-5 py-3 text-[var(--accent-2)]">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
