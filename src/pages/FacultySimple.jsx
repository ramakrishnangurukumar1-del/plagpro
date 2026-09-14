import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import Badge from '../components/Badge';
import { getFacultyDocuments } from '../api/documents';

export function Submissions() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyDocuments()
      .then(setDocuments)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Submissions</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No submissions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Student</th>
                <th className="font-normal px-5 py-3">Document</th>
                <th className="font-normal px-5 py-3">AI %</th>
                <th className="font-normal px-5 py-3">Plagiarism %</th>
                <th className="font-normal px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((d) => (
                <tr key={d.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">{d.ownerName}</td>
                  <td className="px-5 py-3">{d.filename}</td>
                  <td className="px-5 py-3">{d.aiPercent != null ? `${d.aiPercent}%` : '—'}</td>
                  <td className="px-5 py-3">{d.plagiarismPercent != null ? `${d.plagiarismPercent}%` : '—'}</td>
                  <td className="px-5 py-3"><Badge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}

export function ManageUsers() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacultyDocuments()
      .then((docs) => {
        const byStudent = new Map();
        docs.forEach((d) => {
          byStudent.set(d.ownerName, (byStudent.get(d.ownerName) || 0) + 1);
        });
        setStudents([...byStudent.entries()].map(([name, docCount]) => ({ name, docCount })));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>
      <p className="text-sm text-[var(--text-dim)] mb-4">Students derived from document submissions.</p>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {loading ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">Loading...</div>
        ) : students.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-[var(--text-dim)]">No students with submissions yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--text-dim)]">
                <th className="font-normal px-5 py-3">Name</th>
                <th className="font-normal px-5 py-3">Documents Submitted</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.name} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-5 py-3">{s.name}</td>
                  <td className="px-5 py-3">{s.docCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}

export function FacultySettings() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="rounded-xl p-6 max-w-lg space-y-4" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        {['AI detection threshold (%)', 'Plagiarism threshold (%)'].map((label) => (
          <div key={label}>
            <label className="text-sm text-[var(--text-dim)] block mb-1.5">{label}</label>
            <input
              type="number"
              defaultValue={50}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
        ))}
        <button className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}>
          Save Settings
        </button>
      </div>
    </AppLayout>
  );
}
