import AppLayout from '../layouts/AppLayout';
import { currentUser } from '../mock/data';

export default function Profile({ role = 'Student', user = currentUser }) {
  return (
    <AppLayout role={role} user={user}>
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <div className="rounded-xl p-6 max-w-lg" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {user.name[0]}
          </div>
          <div>
            <div className="font-medium text-lg">{user.name}</div>
            <div className="text-sm text-[var(--text-dim)]">{role}</div>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <div className="text-[var(--text-dim)] mb-1">Email</div>
            <div>{user.email}</div>
          </div>
          <div>
            <div className="text-[var(--text-dim)] mb-1">Role</div>
            <div>{role}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
