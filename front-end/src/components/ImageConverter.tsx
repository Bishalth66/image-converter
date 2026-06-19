'use client';
import { useState, useRef, DragEvent, ChangeEvent } from 'react';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [webpBlob, setWebpBlob] = useState<Blob | null>(null);
  const [webpSize, setWebpSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [loading, setLoading] = useState<boolean>(false);
  const [dragging, setDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fmt = (b: number): string =>
    b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const saved: number | null =
    file && webpSize ? Math.round((1 - webpSize / file.size) * 100) : null;

  const load = (f: File | null | undefined): void => {
    if (!f?.type.match(/image\/jpe?g/)) return;
    setFile(f);
    setWebpBlob(null);
    setWebpSize(null);
    setError(null);
  };

  const convert = async (): Promise<void> => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`http://localhost:8000/convert?quality=${quality}`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      setWebpBlob(blob);
      setWebpSize(blob.size);
    } catch {
      setError('Backend unreachable. Is it running on port 8000?');
    }
    setLoading(false);
  };

  const download = (): void => {
    if (!webpBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(webpBlob);
    a.download = file.name.replace(/\.jpe?g$/i, '.webp');
    a.click();
  };

  const reset = (): void => {
    setFile(null);
    setWebpBlob(null);
    setWebpSize(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .p {
          min-height: 100vh;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 2rem;
        }
        .w { width: 100%; max-width: 420px; }
        .logo {
          font-size: 13px; font-weight: 500;
          color: #111; letter-spacing: -0.01em;
          margin-bottom: 2.5rem;
        }
        .logo span { color: #bbb; font-weight: 400; }
        .drop {
          border: 1.5px dashed #E0E0E0;
          border-radius: 12px;
          padding: 3rem 1.5rem;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .drop:hover, .drop.over { border-color: #111; }
        .drop input { display: none; }
        .drop-title { font-size: 14px; font-weight: 500; color: #111; margin-bottom: 4px; }
        .drop-sub { font-size: 12px; color: #999; }
        .file-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; border-bottom: 1px solid #F0F0F0;
        }
        .file-name {
          font-size: 13px; color: #111; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 260px;
        }
        .file-size { font-size: 12px; color: #999; white-space: nowrap; margin-left: 8px; }
        .btn-x { background: none; border: none; cursor: pointer; color: #bbb; font-size: 16px; line-height: 1; padding: 2px 4px; }
        .btn-x:hover { color: #111; }
        .row { padding: 20px 0; border-bottom: 1px solid #F0F0F0; }
        .row-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px; }
        .row-label { font-size: 12px; color: #999; }
        .row-val { font-size: 12px; font-weight: 500; color: #111; }
        input[type=range] {
          -webkit-appearance: none; width: 100%; height: 1.5px;
          background: #E8E8E8; border-radius: 1px; outline: none; cursor: pointer;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px;
          border-radius: 50%; background: #111; cursor: pointer;
        }
        .result-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0; border-bottom: 1px solid #F0F0F0;
        }
        .result-info { font-size: 12px; color: #999; }
        .result-info strong { color: #111; font-weight: 500; }
        .badge-saved {
          font-size: 11px; font-weight: 500;
          background: #F0FBF4; color: #1A7F3C;
          padding: 3px 8px; border-radius: 20px;
        }
        .err { font-size: 12px; color: #E53E3E; padding: 14px 0; }
        .actions { display: flex; gap: 8px; padding-top: 20px; }
        .btn-main {
          flex: 1; padding: 11px;
          background: #111; color: #fff;
          border: none; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: opacity 0.15s;
          font-family: inherit;
        }
        .btn-main:hover { opacity: 0.8; }
        .btn-main:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-dl {
          flex: 1; padding: 11px;
          background: #fff; color: #111;
          border: 1.5px solid #E0E0E0; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: border-color 0.15s;
          font-family: inherit;
        }
        .btn-dl:hover { border-color: #111; }
      `}</style>

      <div className="p">
        <div className="w">

          <div className="logo">webpconvert <span>/ jpg to webp</span></div>

          {!file ? (
            <div
              className={`drop${dragging ? ' over' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(false); load(e.dataTransfer.files[0]); }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg"
                onChange={(e: ChangeEvent<HTMLInputElement>) => load(e.target.files?.[0])}
              />
              <div className="drop-title">Drop a JPG to convert</div>
              <div className="drop-sub">or click to browse</div>
            </div>
          ) : (
            <>
              <div className="file-row">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{fmt(file.size)}</span>
                <button className="btn-x" onClick={reset}>✕</button>
              </div>

              <div className="row">
                <div className="row-head">
                  <span className="row-label">Quality</span>
                  <span className="row-val">{quality}%</span>
                </div>
                <input
                  type="range" min="10" max="100" step="1"
                  value={quality}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuality(+e.target.value)}
                />
              </div>

              {webpSize !== null && (
                <div className="result-row">
                  <span className="result-info">
                    <strong>{fmt(webpSize)}</strong> webp · was {fmt(file.size)}
                  </span>
                  {saved !== null && saved > 0 && (
                    <span className="badge-saved">−{saved}%</span>
                  )}
                </div>
              )}

              {error && <div className="err">{error}</div>}

              <div className="actions">
                <button className="btn-main" onClick={convert} disabled={loading}>
                  {loading ? 'Converting…' : 'Convert'}
                </button>
                {webpBlob && (
                  <button className="btn-dl" onClick={download}>Download</button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}