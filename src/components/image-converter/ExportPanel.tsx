'use client';

import type { ConversionResult, FormatOption } from './types';
import { formatBytes } from './utils';

type ExportPanelProps = {
  file: File | null;
  fileCount: number;
  resultCount: number;
  selectedFormat: FormatOption;
  width: string;
  height: string;
  result: ConversionResult | null;
  loading: boolean;
  error: string | null;
  savings: number | null;
  onConvert: () => void;
  onDownload: () => void;
};

export function ExportPanel({
  file,
  fileCount,
  resultCount,
  selectedFormat,
  width,
  height,
  result,
  loading,
  error,
  savings,
  onConvert,
  onDownload,
}: ExportPanelProps) {
  const outputSize = result ? `${result.width} x ${result.height}` : width && height ? `${width} x ${height}` : 'Original';
  const downloadLabel = resultCount > 1 ? `Download ${resultCount}` : 'Download';

  return (
    <div className="rounded-lg border border-[#deded5] bg-white p-4">
      <h2 className="text-sm font-semibold">Export</h2>
      <div className="mt-3 space-y-2 text-sm text-[#686b63]">
        <div className="flex justify-between gap-4">
          <span>Output</span>
          <span className="font-medium text-[#191b1f]">{selectedFormat.label}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Files</span>
          <span className="font-medium text-[#191b1f]">{fileCount || '-'}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Size</span>
          <span className="font-medium text-[#191b1f]">{outputSize}</span>
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
          onClick={onConvert}
          disabled={!file || loading}
          className="h-11 rounded-md bg-[#191b1f] text-sm font-semibold text-white transition hover:bg-[#30343b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Working...' : fileCount > 1 ? `Convert ${fileCount}` : 'Convert'}
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={resultCount === 0}
          className="h-11 rounded-md border border-[#bdbdb3] text-sm font-semibold transition hover:border-[#191b1f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {downloadLabel}
        </button>
      </div>
    </div>
  );
}
