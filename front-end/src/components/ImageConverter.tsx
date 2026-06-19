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

  const fmt = (b: number) =>
    b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const saved =
    file && webpSize ? Math.round((1 - webpSize / file.size) * 100) : null;

  const load = (f: File | null | undefined) => {
    if (!f?.type.match(/image\/jpe?g/)) return;
    setFile(f);
    setWebpBlob(null);
    setWebpSize(null);
    setError(null);
  };

  const convert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(
        `http://localhost:8000/convert?quality=${quality}`,
        { method: 'POST', body: fd }
      );

      if (!res.ok) throw new Error();
      const blob = await res.blob();

      setWebpBlob(blob);
      setWebpSize(blob.size);
    } catch {
      setError('Backend not reachable on port 8000');
    }

    setLoading(false);
  };

  const download = () => {
    if (!webpBlob || !file) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(webpBlob);
    a.download = file.name.replace(/\.jpe?g$/i, '.webp');
    a.click();
  };

  const reset = () => {
    setFile(null);
    setWebpBlob(null);
    setWebpSize(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-sm font-medium text-gray-900 tracking-tight">
          webpconvert <span className="text-gray-400 font-normal">/ jpg → webp</span>
        </div>

        {/* Dropzone */}
        {!file ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e: DragEvent<HTMLDivElement>) => {
              e.preventDefault();
              setDragging(false);
              load(e.dataTransfer.files[0]);
            }}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
              ${dragging ? 'border-gray-900 bg-gray-50' : 'border-gray-200 hover:border-gray-900'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                load(e.target.files?.[0])
              }
              className="hidden"
            />

            <p className="text-sm font-medium text-gray-900">
              Drop a JPG to convert
            </p>
            <p className="text-xs text-gray-500 mt-1">
              or click to browse
            </p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* File row */}
            <div className="flex items-center justify-between border-b pb-3">
              <div className="truncate text-sm font-medium text-gray-900">
                {file.name}
              </div>
              <div className="text-xs text-gray-500 ml-3">
                {fmt(file.size)}
              </div>
              <button
                onClick={reset}
                className="ml-3 text-gray-400 hover:text-gray-900"
              >
                ✕
              </button>
            </div>

            {/* Quality */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Quality</span>
                <span className="text-gray-900 font-medium">{quality}%</span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setQuality(+e.target.value)
                }
                className="w-full accent-black"
              />
            </div>

            {/* Result */}
            {webpSize !== null && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  <span className="text-gray-900 font-medium">
                    {fmt(webpSize)}
                  </span>{' '}
                  webp · was {fmt(file.size)}
                </span>

                {saved !== null && saved > 0 && (
                  <span className="px-2 py-1 rounded-full bg-green-50 text-green-700">
                    −{saved}%
                  </span>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="text-xs text-red-500">{error}</div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={convert}
                disabled={loading}
                className="flex-1 bg-black text-white text-sm py-2 rounded-lg hover:opacity-80 disabled:opacity-40 transition"
              >
                {loading ? 'Converting…' : 'Convert'}
              </button>

              {webpBlob && (
                <button
                  onClick={download}
                  className="flex-1 border text-sm py-2 rounded-lg hover:border-black transition"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}