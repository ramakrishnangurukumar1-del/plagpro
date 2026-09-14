import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { getDocumentResult, getReportPdfBlobUrl, downloadReportPdf } from '../api/documents';

export default function ReportPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [filename, setFilename] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocumentResult(id).then((r) => setFilename(r.filename));
    getReportPdfBlobUrl(id)
      .then(setPdfUrl)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <header
        className="h-14 shrink-0 flex items-center justify-between px-5 border-b"
        style={{ borderColor: 'var(--border)', background: 'var(--panel)' }}
      >
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        <span className="text-sm text-[var(--text-dim)]">{filename || 'analysis_report'}</span>
        <button
          onClick={() => downloadReportPdf(id, `${(filename || 'report').replace(/\.[^.]+$/, '')}_report.pdf`)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-xs font-medium"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          <Download size={14} /> Download
        </button>
      </header>

      <div className="flex-1 py-6 px-4">
        {loading ? (
          <div className="text-sm text-[var(--text-dim)] text-center mt-10">Generating report...</div>
        ) : !pdfUrl ? (
          <div className="text-sm text-[var(--text-dim)] text-center mt-10">Could not generate this report.</div>
        ) : (
          <iframe src={pdfUrl} title="Report preview" className="w-full max-w-3xl mx-auto rounded-lg" style={{ height: '85vh', border: 'none', background: 'white' }} />
        )}
      </div>
    </div>
  );
}
