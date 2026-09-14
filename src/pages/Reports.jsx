import AppLayout from '../layouts/AppLayout';
import { currentUser, documents } from '../mock/data';
import { Download } from 'lucide-react';

export default function Reports({ role = 'Student', user = currentUser }) {
  return (
    <AppLayout role={role} user={user}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          <Download size={16} /> Export All
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-dim)]">
              <th className="font-normal px-5 py-3">Document</th>
              <th className="font-normal px-5 py-3">AI %</th>
              <th className="font-normal px-5 py-3">Plagiarism %</th>
              <th className="font-normal px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-5 py-3">{d.name}</td>
                <td className="px-5 py-3">{d.aiPercent}%</td>
                <td className="px-5 py-3">{d.plagiarismPercent}%</td>
                <td className="px-5 py-3 text-[var(--accent-2)] cursor-pointer">Download PDF</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
