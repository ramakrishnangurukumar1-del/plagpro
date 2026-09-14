import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import Logo from '../components/Logo';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm p-8 rounded-2xl" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" />
          <p className="text-[var(--text-dim)] text-sm mt-3">Create your account</p>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/login');
          }}
        >
          {[{ icon: User, ph: 'Full Name' }, { icon: Mail, ph: 'Email' }, { icon: Lock, ph: 'Password' }].map(({ icon: Icon, ph }) => (
            <div className="relative" key={ph}>
              <Icon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
              <input
                type={ph === 'Password' ? 'password' : 'text'}
                placeholder={ph}
                required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            Create Account
          </button>
          <div className="text-center text-sm text-[var(--text-dim)]">
            Already have an account? <Link to="/login" style={{ color: 'var(--accent-2)' }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
