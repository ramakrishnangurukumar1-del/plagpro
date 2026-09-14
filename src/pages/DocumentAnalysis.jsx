import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, FileText } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { getDocumentResult, getDocumentFileUrl, downloadReportPdf } from '../api/documents';

const tabs = ['Original Document', 'Sentence Analysis', 'Sources'];

function aiColor(score) {
  if (score >= 70) return 'var(--danger)';
  if (score >= 45) return 'var(--warning)';
  return 'var(--success)';
}

export default function DocumentAnalysis() {
  const [tab, setTab] = useState('Original Document');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    getDocumentResult(id)
      .then(setResult)
      .finally(() => setLoading(false));
    getDocumentFileUrl(id)
      .then(setFile)
      .finally(() => setFileLoading(false));
  }, [id]);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        {result && (
          <button
            onClick={() => downloadReportPdf(id, `${result.filename.replace(/\.[^.]+$/, '')}_report.pdf`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
          >
            <Download size={16} /> Download Report PDF
          </button>
        )}
      </div>
      <h1 className="text-2xl font-semibold mb-4">
        Document Analysis{result ? ` - ${result.filename}` : ''}
      </h1>

      {loading ? (
        <div className="text-sm text-[var(--text-dim)]">Loading...</div>
      ) : !result ? (
        <div className="text-sm text-[var(--text-dim)]">Could not load this document.</div>
      ) : (
        <>
          <div className="flex gap-1 mb-5 border-b" style={{ borderColor: 'var(--border)' }}>
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-4 py-2.5 text-sm -mb-px border-b-2 transition-colors"
                style={{
                  borderColor: tab === t ? 'var(--accent-2)' : 'transparent',
                  color: tab === t ? 'var(--accent-2)' : 'var(--text-dim)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Original Document' && (
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
              {fileLoading ? (
                <div className="p-10 text-center text-sm text-[var(--text-dim)]">Loading document...</div>
              ) : !file ? (
                <div className="p-10 text-center text-sm text-[var(--text-dim)]">Could not load the original file.</div>
              ) : file.contentType === 'application/pdf' ? (
                <iframe src={file.url} title="Original document" className="w-full" style={{ height: '75vh', border: 'none' }} />
              ) : file.contentType?.startsWith('image/') ? (
                <div className="p-6 flex justify-center">
                  <img src={file.url} alt={result.filename} className="max-w-full rounded-lg" />
                </div>
              ) : (
                <div className="p-10 flex flex-col items-center gap-3 text-center">
                  <FileText size={32} className="text-[var(--text-dim)]" />
                  <p className="text-sm text-[var(--text-dim)]">
                    Preview isn't available for this file type. Open it directly instead.
                  </p>
                  <a
                    href={file.url}
                    download={result.filename}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                  >
                    <Download size={16} /> Download Original
                  </a>
                </div>
              )}
            </div>
          )}

          {tab === 'Sentence Analysis' && (
            <div className="rounded-xl p-5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
              <h2 className="text-base font-medium mb-4">Sentence Analysis</h2>
              {result.sentenceAnalysis.length === 0 ? (
                <p className="text-sm text-[var(--text-dim)]">No sentence-level breakdown available.</p>
              ) : (
                <div className="space-y-3">
                  {result.sentenceAnalysis.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm flex-1 leading-relaxed">{s.text}</p>
                      <div className="flex items-center gap-2 shrink-0 w-32">
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${s.aiScore}%`, background: aiColor(s.aiScore) }} />
                        </div>
                        <span className="text-xs w-10 text-right" style={{ color: aiColor(s.aiScore) }}>{Math.round(s.aiScore)}% AI</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'Sources' && (
            <div className="rounded-xl p-5 max-w-xl" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
              <h2 className="text-base font-medium mb-4">Matched Sources</h2>
              {result.plagiarismSources.length === 0 ? (
                <p className="text-sm text-[var(--text-dim)]">No matching sources found.</p>
              ) : (
                <div className="space-y-3">
                  {result.plagiarismSources.map((s, i) => (
                    <div key={s.name} className="flex items-center justify-between pb-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xs w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--panel-2)', color: 'var(--text-dim)' }}>
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-sm">{s.name}</div>
                          <div className="text-xs text-[var(--text-dim)]">Similarity, {s.similarity}%</div>
                        </div>
                      </div>
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs shrink-0"
                          style={{ color: 'var(--accent-2)' }}
                        >
                          <ExternalLink size={14} /> View source
                        </a>
                      ) : (
                        <span className="text-xs text-[var(--text-dim)]">No link</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
