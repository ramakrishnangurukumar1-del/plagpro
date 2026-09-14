import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, UploadCloud, FileText, BarChart2, User, LogOut,
  LayoutDashboard, Users, Settings, ChevronDown,
} from 'lucide-react';
import Logo from '../components/Logo';

const studentNav = [
  { to: '/app/home', label: 'Home', icon: Home },
  { to: '/app/upload', label: 'Upload Documents', icon: UploadCloud },
  { to: '/app/documents', label: 'My Documents', icon: FileText },
  { to: '/app/reports', label: 'Reports', icon: BarChart2 },
  { to: '/app/profile', label: 'Profile', icon: User },
];

const facultyNav = [
  { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/faculty/submissions', label: 'Submissions', icon: FileText },
  { to: '/faculty/reports', label: 'Reports', icon: BarChart2 },
  { to: '/faculty/users', label: 'Manage Users', icon: Users },
  { to: '/faculty/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout({ children, role = 'Student', user }) {
  const nav = role === 'Faculty' ? facultyNav : studentNav;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <aside
        className="w-60 shrink-0 flex flex-col border-r"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-white font-medium'
                    : 'text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-white'
                }`
              }
              style={({ isActive }) =>
                isActive ? { color: 'var(--accent-2)' } : undefined
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-dim)] hover:bg-[var(--panel-2)] hover:text-white w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 shrink-0 flex items-center justify-end px-6 border-b gap-3"
          style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {user?.name?.[0] ?? 'U'}
          </div>
          <div className="text-sm">
            <div className="font-medium leading-tight">{user?.name}</div>
            <div className="text-xs text-[var(--text-dim)] leading-tight">{role}</div>
          </div>
          <ChevronDown size={16} className="text-[var(--text-dim)]" />
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
