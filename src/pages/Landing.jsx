import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroScene from '../components/HeroScene';

function Logo({ size = 30 }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <path d="M8 34 V8 L28 8 L14 20 L28 32 L8 34 Z" fill="url(#pgrad)" />
        <defs>
          <linearGradient id="pgrad" x1="8" y1="8" x2="28" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--pp-purple)" />
            <stop offset="1" stopColor="var(--pp-teal)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-semibold text-lg tracking-tight" style={{ color: 'var(--pp-text)' }}>
        PlagPro
      </span>
    </div>
  );
}

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="pp-landing"
      style={{
        '--pp-bg': '#07080d',
        '--pp-panel': 'rgba(255,255,255,0.05)',
        '--pp-border': 'rgba(255,255,255,0.1)',
        '--pp-text': '#eef0f9',
        '--pp-text-dim': '#9a9db3',
        '--pp-purple': '#7c5cff',
        '--pp-teal': '#33e0c9',
        '--pp-amber': '#f5a524',
        background: 'var(--pp-bg)',
        color: 'var(--pp-text)',
        minHeight: '100vh',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Floating pill nav */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-4xl">
        <div
          className="flex items-center justify-between px-5 py-2.5 rounded-full backdrop-blur-xl"
          style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.35)' }}
        >
          <Logo />
          <nav className="hidden md:flex items-center gap-7 text-sm">
            <button onClick={() => scrollTo('home')} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--pp-text-dim)' }}>Home</button>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--pp-amber)', color: '#1a1204' }}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ background: 'linear-gradient(90deg, var(--pp-purple), var(--pp-teal))' }}
            >
              Get started
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 45% at center, rgba(7,8,13,0.65) 0%, rgba(7,8,13,0.3) 45%, transparent 80%)' }}
        />

        <div className="relative z-10 text-center max-w-3xl mx-auto pt-16">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Catch what's{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--pp-purple), var(--pp-teal))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              copied.
            </span>{' '}
            Catch what's{' '}
            <span style={{ background: 'linear-gradient(90deg, var(--pp-purple), var(--pp-teal))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              AI-written.
            </span>{' '}
            Catch it all.
          </h1>
          <p className="text-base md:text-lg mb-9 leading-relaxed" style={{ color: 'var(--pp-text-dim)' }}>
            PlagPro checks documents for both copied content and AI-generated writing —
            across PDFs, scanned images, and Word docs — in one pass.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3 rounded-full font-medium text-white"
              style={{ background: 'linear-gradient(90deg, var(--pp-purple), var(--pp-teal))', boxShadow: '0 0 30px rgba(124,92,255,0.35)' }}
            >
              Try a document
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto">
            {[
              ['10', 'APIs & sources cross-checked'],
              ['6', 'ML signals in the ensemble'],
              ['3', 'file formats supported'],
            ].map(([n, label]) => (
              <div key={label} className="rounded-2xl px-3 py-4 backdrop-blur-md" style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)' }}>
                <div className="text-2xl font-bold" style={{ color: 'var(--pp-teal)' }}>{n}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--pp-text-dim)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 py-28 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-8">Ready to see it flag something?</h2>
        <button
          onClick={() => navigate('/register')}
          className="px-10 py-4 rounded-full font-medium text-white text-lg"
          style={{ background: 'linear-gradient(90deg, var(--pp-purple), var(--pp-teal))', boxShadow: '0 0 40px rgba(124,92,255,0.4)' }}
        >
          Upload a document
        </button>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center border-t" style={{ borderColor: 'var(--pp-border)' }}>
        <p className="text-xs" style={{ color: 'var(--pp-text-dim)' }}>
          © {new Date().getFullYear()} PlagPro. All rights reserved.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="text-xs mt-2 hover:opacity-80"
          style={{ color: 'var(--pp-text-dim)', opacity: 0.6 }}
        >
          Administrator sign-in
        </button>
      </footer>
    </div>
  );
}
