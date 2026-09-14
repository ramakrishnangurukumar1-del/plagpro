const items = [
  'PDF', 'DOCX', 'RoBERTa', 'BERT', 'GPT-2 Perplexity', 'Wikipedia',
  'arXiv', 'Semantic Scholar', 'OpenAlex', 'CrossRef',
];

export default function Marquee() {
  const track = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-6" style={{ maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)' }}>
      <div className="flex gap-10 whitespace-nowrap animate-marquee w-max">
        {track.map((item, i) => (
          <span key={i} className="text-sm tracking-wide font-medium" style={{ color: 'var(--pp-text-dim)' }}>
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee-scroll 28s linear infinite;
        }
      `}</style>
    </div>
  );
}
