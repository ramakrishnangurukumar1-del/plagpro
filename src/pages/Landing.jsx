import { useNavigate } from 'react-router-dom';
import { UploadCloud, Sparkles, ScanSearch, FileStack, FileBarChart2 } from 'lucide-react';
import Logo from '../components/Logo';

const features = [
  { icon: Sparkles, title: 'AI Content Detection', desc: 'Find AI-generated patterns' },
  { icon: ScanSearch, title: 'Source Matching', desc: 'Compare with academic and web sources' },
  { icon: FileStack, title: 'PDF / Image / DOCX', desc: 'Multiple file formats supported' },
  { icon: FileBarChart2, title: 'Detailed Reports', desc: 'Get comprehensive analysis' },
];

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-screen">
      <header className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--text-dim)]">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
        </nav>
        <button
          onClick={() => navigate('/login')}
          className="px-5 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          Login
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-8 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Detect. Verify.{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Understand.
            </span>
          </h1>
          <p className="text-[var(--text-dim)] text-lg mb-8 leading-relaxed">
            AI-powered academic integrity analysis. Check your documents for both
            copied content and AI-generated writing, across PDF, image, and document formats.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <UploadCloud size={20} />
            Upload Your Document
          </button>

          <div className="grid grid-cols-2 gap-6 mt-14">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-soft)' }}
                >
                  <Icon size={20} color="var(--accent-2)" />
                </div>
                <div>
                  <div className="font-medium text-sm">{title}</div>
                  <div className="text-xs text-[var(--text-dim)] mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="w-full aspect-square max-w-md rounded-3xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--panel), var(--panel-2))', border: '1px solid var(--border)' }}
          >
            <ScanSearch size={140} color="var(--accent-2)" strokeWidth={1} />
          </div>
        </div>
      </section>
    </div>
  );
}
