'use client';

import { ChangeEvent, DragEvent, useEffect, useMemo, useRef, useState } from 'react';

type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

type ImageInfo = {
  width: number;
  height: number;
  url: string;
};

type Result = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  extension: string;
};

const formats: Array<{ label: string; mime: OutputFormat; extension: string; lossy: boolean }> = [
  { label: 'JPG', mime: 'image/jpeg', extension: 'jpg', lossy: true },
  { label: 'PNG', mime: 'image/png', extension: 'png', lossy: false },
  { label: 'WEBP', mime: 'image/webp', extension: 'webp', lossy: true },
  { label: 'AVIF', mime: 'image/avif', extension: 'avif', lossy: true },
];

const acceptedImages = 'image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.svg,.tif,.tiff,.heic,.heif';

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>('image/webp');
  const [quality, setQuality] = useState(86);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFormat = formats.find((format) => format.mime === targetFormat) ?? formats[2];
  const savings = file && result ? Math.round((1 - result.blob.size / file.size) * 100) : null;

  const outputName = useMemo(() => {
    if (!file) return `converted.${selectedFormat.extension}`;
    const baseName = file.name.replace(/\.[^.]+$/, '');
    return `${baseName}-${result?.width ?? 'converted'}x${result?.height ?? 'resized'}.${selectedFormat.extension}`;
  }, [file, result?.height, result?.width, selectedFormat.extension]);

  useEffect(() => {
    if (!imageInfo?.url) return;

    return () => {
      URL.revokeObjectURL(imageInfo.url);
    };
  }, [imageInfo?.url]);

  useEffect(() => {
    if (!result?.url) return;

    return () => {
      URL.revokeObjectURL(result.url);
    };
  }, [result?.url]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const clearResult = () => {
    if (result?.url) URL.revokeObjectURL(result.url);
    setResult(null);
  };

  const updateWidth = (value: string) => {
    setWidth(value);
    clearResult();
    if (!lockAspect || !imageInfo) return;

    const nextWidth = Number(value);
    setHeight(nextWidth > 0 ? String(Math.round((nextWidth / imageInfo.width) * imageInfo.height)) : '');
  };

  const updateHeight = (value: string) => {
    setHeight(value);
    clearResult();
    if (!lockAspect || !imageInfo) return;

    const nextHeight = Number(value);
    setWidth(nextHeight > 0 ? String(Math.round((nextHeight / imageInfo.height) * imageInfo.width)) : '');
  };

  const loadImage = async (nextFile: File | null | undefined) => {
    if (!nextFile) return;
    const hasImageExtension = /\.(jpe?g|png|webp|avif|gif|bmp|svg|tiff?|heic|heif)$/i.test(nextFile.name);

    if (!nextFile.type.startsWith('image/') && !hasImageExtension) {
      setError('Choose an image file.');
      return;
    }

    setLoading(true);
    setError(null);
    clearResult();

    const url = URL.createObjectURL(nextFile);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;

    try {
      await img.decode();
      if (imageInfo?.url) URL.revokeObjectURL(imageInfo.url);
      setFile(nextFile);
      setImageInfo({ width: img.naturalWidth, height: img.naturalHeight, url });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    } catch {
      URL.revokeObjectURL(url);
      setError('This image could not be opened by the browser. Try PNG, JPG, WEBP, AVIF, GIF, BMP, or SVG.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const convert = async () => {
    if (!file || !imageInfo) return;

    const outputWidth = Math.max(1, Math.round(Number(width) || imageInfo.width));
    const outputHeight = Math.max(1, Math.round(Number(height) || imageInfo.height));
    const img = new Image();
    img.decoding = 'async';
    img.src = imageInfo.url;

    setLoading(true);
    setError(null);
    clearResult();

    try {
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext('2d', { alpha: selectedFormat.mime !== 'image/jpeg' });
      if (!context) throw new Error('Canvas is unavailable.');

      if (selectedFormat.mime === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(img, 0, 0, outputWidth, outputHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, selectedFormat.mime, selectedFormat.lossy ? quality / 100 : undefined);
      });

      if (!blob || blob.type !== selectedFormat.mime) {
        throw new Error(`${selectedFormat.label} export is not supported by this browser.`);
      }

      setResult({
        blob,
        url: URL.createObjectURL(blob),
        width: outputWidth,
        height: outputHeight,
        extension: selectedFormat.extension,
      });
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Could not convert this image.');
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = outputName;
    link.click();
  };

  const reset = () => {
    if (imageInfo?.url) URL.revokeObjectURL(imageInfo.url);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setImageInfo(null);
    setResult(null);
    setWidth('');
    setHeight('');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#191b1f]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#deded5] pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#71736c]">Client-side studio</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">Image Converter</h1>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 rounded-md bg-[#191b1f] px-4 text-sm font-medium text-white transition hover:bg-[#30343b]"
          >
            Choose Image
          </button>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            onClick={() => !file && fileInputRef.current?.click()}
            onDragOver={(event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event: DragEvent<HTMLDivElement>) => {
              event.preventDefault();
              setDragging(false);
              loadImage(event.dataTransfer.files[0]);
            }}
            className={`flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-dashed transition ${
              dragging ? 'border-[#191b1f] bg-white' : 'border-[#c9c9bf] bg-[#fbfbf7]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedImages}
              onChange={(event: ChangeEvent<HTMLInputElement>) => loadImage(event.target.files?.[0])}
              className="hidden"
            />

            {imageInfo ? (
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-[#e4e4dc] px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file?.name}</p>
                    <p className="mt-0.5 text-xs text-[#71736c]">
                      {imageInfo.width} x {imageInfo.height} px / {file ? formatBytes(file.size) : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="h-9 rounded-md border border-[#cecec4] px-3 text-sm font-medium transition hover:border-[#191b1f]"
                  >
                    Clear
                  </button>
                </div>
                <div className="grid flex-1 place-items-center bg-[linear-gradient(45deg,#eeeeE7_25%,transparent_25%),linear-gradient(-45deg,#eeeeE7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eeeeE7_75%),linear-gradient(-45deg,transparent_75%,#eeeeE7_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={result?.url ?? imageInfo.url}
                    alt="Selected image preview"
                    className="max-h-[58vh] max-w-full object-contain shadow-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="grid flex-1 place-items-center p-8 text-center">
                <div>
                  <p className="text-xl font-semibold">Drop an image here</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-[#686b63]">
                    Convert and resize PNG, JPG, JPEG, WEBP, AVIF, GIF, BMP, SVG, and any image your browser can decode.
                  </p>
                  <button
                    type="button"
                    className="mt-6 h-10 rounded-md border border-[#bcbcb1] px-4 text-sm font-medium transition hover:border-[#191b1f]"
                  >
                    Browse files
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="rounded-lg border border-[#deded5] bg-white p-4">
              <h2 className="text-sm font-semibold">Format</h2>
              <div className="mt-3 grid grid-cols-4 rounded-md border border-[#d8d8cf] bg-[#f3f3ed] p-1">
                {formats.map((format) => (
                  <button
                    key={format.mime}
                    type="button"
                    onClick={() => {
                      setTargetFormat(format.mime);
                      clearResult();
                    }}
                    className={`h-9 rounded text-sm font-medium transition ${
                      targetFormat === format.mime ? 'bg-white text-[#191b1f] shadow-sm' : 'text-[#686b63] hover:text-[#191b1f]'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>

              {selectedFormat.lossy && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm">
                    <label htmlFor="quality" className="font-medium">Quality</label>
                    <span className="text-[#686b63]">{quality}%</span>
                  </div>
                  <input
                    id="quality"
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(event) => {
                      setQuality(Number(event.target.value));
                      clearResult();
                    }}
                    className="mt-3 w-full accent-[#191b1f]"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-[#deded5] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Resize</h2>
                <label className="flex items-center gap-2 text-sm text-[#686b63]">
                  <input
                    type="checkbox"
                    checked={lockAspect}
                    onChange={(event) => setLockAspect(event.target.checked)}
                    className="h-4 w-4 accent-[#191b1f]"
                  />
                  Lock ratio
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="text-sm font-medium">
                  Width
                  <input
                    type="number"
                    min="1"
                    value={width}
                    onChange={(event) => updateWidth(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-[#cdcdc4] px-3 outline-none transition focus:border-[#191b1f]"
                  />
                </label>
                <label className="text-sm font-medium">
                  Height
                  <input
                    type="number"
                    min="1"
                    value={height}
                    onChange={(event) => updateHeight(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-[#cdcdc4] px-3 outline-none transition focus:border-[#191b1f]"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-[#deded5] bg-white p-4">
              <h2 className="text-sm font-semibold">Export</h2>
              <div className="mt-3 space-y-2 text-sm text-[#686b63]">
                <div className="flex justify-between gap-4">
                  <span>Output</span>
                  <span className="font-medium text-[#191b1f]">{selectedFormat.label}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span>Size</span>
                  <span className="font-medium text-[#191b1f]">
                    {result ? `${result.width} x ${result.height}` : width && height ? `${width} x ${height}` : 'Original'}
                  </span>
                </div>
                {result && (
                  <div className="flex justify-between gap-4">
                    <span>File size</span>
                    <span className="font-medium text-[#191b1f]">{formatBytes(result.blob.size)}</span>
                  </div>
                )}
                {savings !== null && (
                  <div className="flex justify-between gap-4">
                    <span>Change</span>
                    <span className={`font-medium ${savings >= 0 ? 'text-[#237049]' : 'text-[#9b3d2c]'}`}>
                      {savings >= 0 ? '-' : '+'}
                      {Math.abs(savings)}%
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-md border border-[#efc8bd] bg-[#fff2ee] px-3 py-2 text-sm text-[#9b3d2c]">
                  {error}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={convert}
                  disabled={!file || loading}
                  className="h-11 rounded-md bg-[#191b1f] text-sm font-semibold text-white transition hover:bg-[#30343b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? 'Working...' : 'Convert'}
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={!result}
                  className="h-11 rounded-md border border-[#bdbdb3] text-sm font-semibold transition hover:border-[#191b1f] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Download
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
