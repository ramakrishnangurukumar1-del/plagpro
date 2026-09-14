import { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanEye, Sparkles, FileStack, Network, ShieldCheck } from 'lucide-react';
import HeroScene from '../components/HeroScene';
import Marquee from '../components/Marquee';

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

const navLinks = [
  { href: '#how', label: 'How it works' },
  { href: '#detection', label: 'Detection' },
  { href: '#tech', label: 'Tech' },
  { href: '#faq', label: 'FAQ' },
];

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
            {navLinks.map((l) => (
              <button key={l.href} onClick={() => scrollTo(l.href.slice(1))} className="hover:opacity-80 transition-opacity" style={{ color: 'var(--pp-text-dim)' }}>
                {l.label}
              </button>
            ))}
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
          style={{ background: 'radial-gradient(ellipse at center, rgba(7,8,13,0.55) 0%, rgba(7,8,13,0.15) 35%, transparent 55%, var(--pp-bg) 100%)' }}
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
            <button
              onClick={() => scrollTo('how')}
              className="px-7 py-3 rounded-full font-medium"
              style={{ border: '1px solid var(--pp-border)', color: 'var(--pp-text)' }}
            >
              See how it works
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

      {/* How it works */}
      <section id="how" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">How it works</h2>
        <p className="text-center mb-14" style={{ color: 'var(--pp-text-dim)' }}>
          One upload, two independent checks, one report.
        </p>
        <div className="grid md:grid-cols-4 gap-5">
          {[
            { icon: FileStack, title: 'Upload', desc: 'Drop a PDF, scan, or DOCX — up to 10 files at once.' },
            { icon: ScanEye, title: 'Extract', desc: 'Text is pulled out via OCR or direct parsing.' },
            { icon: Network, title: 'Dual analysis', desc: 'Source-matching and AI-pattern detection run in parallel.' },
            { icon: ShieldCheck, title: 'Report', desc: 'Get a combined score with full source-level detail.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={title} className="rounded-2xl p-5 backdrop-blur-md" style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, var(--pp-purple), var(--pp-teal))' }}>
                <Icon size={20} color="white" />
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--pp-teal)' }}>Step {i + 1}</div>
              <div className="font-medium mb-1.5">{title}</div>
              <div className="text-sm" style={{ color: 'var(--pp-text-dim)' }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Detection */}
      <section id="detection" className="relative z-10 px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-3">Two very different problems</h2>
        <p className="text-center mb-14" style={{ color: 'var(--pp-text-dim)' }}>
          Copied text and AI-written text don't look the same to a detector — so we don't check them the same way.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-7 backdrop-blur-md" style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)' }}>
            <Sparkles size={24} color="var(--pp-purple)" className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI-writing detection</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--pp-text-dim)' }}>
              Six model signals — RoBERTa, BERT, GPT-2 perplexity, burstiness, zero-shot tone, and a lightweight fallback — combined into one confidence score.
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--pp-text-dim)' }}>
              <li>• No source needed — flags the writing pattern itself</li>
              <li>• Sentence-level breakdown, not just a single score</li>
            </ul>
          </div>
          <div className="rounded-2xl p-7 backdrop-blur-md" style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)' }}>
            <Network size={24} color="var(--pp-teal)" className="mb-4" />
            <h3 className="text-xl font-semibold mb-2">Plagiarism / source matching</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--pp-text-dim)' }}>
              Cross-checked against Wikipedia, CrossRef, OpenAlex, arXiv, Semantic Scholar, and web search.
            </p>
            <ul className="text-sm space-y-1.5" style={{ color: 'var(--pp-text-dim)' }}>
              <li>• Matches real, existing sources</li>
              <li>• Similarity scored per source, not just overall</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech marquee */}
      <section id="tech" className="relative z-10 py-16 border-y" style={{ borderColor: 'var(--pp-border)' }}>
        <p className="text-center text-xs uppercase tracking-widest mb-4" style={{ color: 'var(--pp-text-dim)' }}>
          Models &amp; sources we check against
        </p>
        <Marquee />
      </section>

      {/* FAQ */}
      <section id="faq" className="relative z-10 px-6 py-24 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently asked</h2>
        <div className="space-y-3">
          {[
            ['Does it search the internet for every check?', 'Only for plagiarism matching. AI-writing detection analyzes the text itself and needs no external source.'],
            ['What file types are supported?', 'PDF, JPG/PNG scans (via OCR), and DOCX — up to 10 files per batch.'],
            ['Is an AI-detection score a guarantee?', 'No — it\'s a confidence signal from an ensemble of models, not a verdict. Always paired with human judgment.'],
          ].map(([q, a]) => (
            <details key={q} className="rounded-xl p-4 backdrop-blur-md" style={{ background: 'var(--pp-panel)', border: '1px solid var(--pp-border)' }}>
              <summary className="cursor-pointer font-medium">{q}</summary>
              <p className="text-sm mt-2" style={{ color: 'var(--pp-text-dim)' }}>{a}</p>
            </details>
          ))}
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
