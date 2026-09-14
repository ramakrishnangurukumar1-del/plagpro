import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'FACULTY' ? '/faculty/dashboard' : '/app/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
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
          {error && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            disabled={submitting}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {submitting ? 'Signing in...' : 'Login'}
          </button>

          <div className="text-center text-sm text-[var(--text-dim)]">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-2)' }}>Register</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
