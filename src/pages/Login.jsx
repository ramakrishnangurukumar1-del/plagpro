import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login({ onLogin }) {
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState('Student');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    onLogin(role);
    navigate(role === 'Faculty' ? '/faculty/dashboard' : '/app/home');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-sm p-8 rounded-2xl"
        style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
      >
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-[var(--text-dim)] text-sm mt-3">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--panel-2)' }}>
            {['Student', 'Faculty'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={
                  role === r
                    ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white' }
                    : { color: 'var(--text-dim)' }
                }
              >
                {r}
              </button>
            ))}
          </div>

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Email / Username"
              required
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Password"
              required
              className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Login
          </button>

          <div className="text-center">
            <a href="#" className="text-xs" style={{ color: 'var(--accent-2)' }}>Forgot Password?</a>
          </div>

          <div className="flex items-center gap-3 text-xs text-[var(--text-dim)]">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            OR
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="text-center text-sm text-[var(--text-dim)]">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-2)' }}>Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
