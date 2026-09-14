import AppLayout from '../layouts/AppLayout';
import { facultyUser, documents } from '../mock/data';
import Badge from '../components/Badge';

export function Submissions() {
  return (
    <AppLayout role="Faculty" user={facultyUser}>
      <h1 className="text-2xl font-semibold mb-6">Submissions</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
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
                <td className="px-5 py-3">{d.student}</td>
                <td className="px-5 py-3">{d.name}</td>
                <td className="px-5 py-3">{d.aiPercent}%</td>
                <td className="px-5 py-3">{d.plagiarismPercent}%</td>
                <td className="px-5 py-3"><Badge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

const students = [
  { name: 'Arun Kumar', email: 'arun.kumar@college.edu', docs: 5 },
  { name: 'Rahul S', email: 'rahul.s@college.edu', docs: 3 },
  { name: 'Priya V', email: 'priya.v@college.edu', docs: 8 },
  { name: 'Karthik R', email: 'karthik.r@college.edu', docs: 2 },
];

export function ManageUsers() {
  return (
    <AppLayout role="Faculty" user={facultyUser}>
      <h1 className="text-2xl font-semibold mb-6">Manage Users</h1>
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--text-dim)]">
              <th className="font-normal px-5 py-3">Name</th>
              <th className="font-normal px-5 py-3">Email</th>
              <th className="font-normal px-5 py-3">Documents</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.email} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-5 py-3">{s.name}</td>
                <td className="px-5 py-3 text-[var(--text-dim)]">{s.email}</td>
                <td className="px-5 py-3">{s.docs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

export function FacultySettings() {
  return (
    <AppLayout role="Faculty" user={facultyUser}>
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
