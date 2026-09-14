import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X } from 'lucide-react';
import AppLayout from '../layouts/AppLayout';
import { currentUser } from '../mock/data';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  function addFiles(fileList) {
    const arr = Array.from(fileList).slice(0, 10 - files.length);
    setFiles((prev) => [...prev, ...arr]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  function removeFile(i) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  function startAnalysis() {
    navigate('/app/processing/doc1');
  }

  return (
    <AppLayout role="Student" user={currentUser}>
      <h1 className="text-2xl font-semibold mb-1">Upload Documents</h1>
      <p className="text-[var(--text-dim)] text-sm mb-6">Drag and drop your files or click to browse</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="rounded-2xl flex flex-col items-center justify-center py-16 cursor-pointer transition-colors"
        style={{
          background: 'var(--panel)',
          border: `2px dashed ${dragOver ? 'var(--accent-2)' : 'var(--border)'}`,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--accent-soft)' }}
        >
          <UploadCloud size={28} color="var(--accent-2)" />
        </div>
        <p className="font-medium mb-1">Drag & Drop Files Here</p>
        <p className="text-sm text-[var(--text-dim)] mb-4">or</p>
        <button
          type="button"
          className="px-5 py-2 rounded-lg text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          Browse Files
        </button>
        <p className="text-xs text-[var(--text-dim)] mt-5">
          Supported formats: PDF, JPG, PNG, DOCX &nbsp;•&nbsp; Max 10 files &nbsp;•&nbsp; Max 10MB each
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-5 space-y-2">
          {files.map((f, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3 text-sm">
                <File size={18} className="text-[var(--accent-2)]" />
                {f.name}
                <span className="text-[var(--text-dim)] text-xs">
                  ({(f.size / (1024 * 1024)).toFixed(1)} MB)
                </span>
              </div>
              <button onClick={() => removeFile(i)} className="text-[var(--text-dim)] hover:text-white">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-[var(--text-dim)]">{files.length} / 10 files</span>
        <button
          disabled={files.length === 0}
          onClick={startAnalysis}
          className="px-6 py-2.5 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
        >
          Start Analysis
        </button>
      </div>
    </AppLayout>
  );
}
