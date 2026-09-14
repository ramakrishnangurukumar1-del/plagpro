import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await register(fullName, email, password, role);
      navigate(user.role === 'FACULTY' ? '/faculty/dashboard' : '/app/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-[var(--text-dim)] text-sm mt-3">Create your account</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--danger)' }}>
              {error}
            </div>
          )}

          <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--panel-2)' }}>
            {[
              ['STUDENT', 'Student'],
              ['FACULTY', 'Faculty'],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                onClick={() => setRole(value)}
                className="flex-1 py-1.5 rounded-md text-sm font-medium transition-colors"
                style={
                  role === value
                    ? { background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', color: 'white' }
                    : { color: 'var(--text-dim)' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative">
            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              placeholder="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>
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
              type="password"
              placeholder="Password (min 6 characters)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
          <div className="text-center text-sm text-[var(--text-dim)]">
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-2)' }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
