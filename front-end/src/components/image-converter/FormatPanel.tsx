'use client';

import { formats } from './config';
import type { FormatOption, OutputFormat } from './types';

type FormatPanelProps = {
  targetFormat: OutputFormat;
  selectedFormat: FormatOption;
  quality: number;
  onFormatChange: (format: OutputFormat) => void;
  onQualityChange: (quality: number) => void;
};

export function FormatPanel({
  targetFormat,
  selectedFormat,
  quality,
  onFormatChange,
  onQualityChange,
}: FormatPanelProps) {
  return (
    <div className="rounded-lg border border-[#deded5] bg-white p-4">
      <h2 className="text-sm font-semibold">Format</h2>
      <div className="mt-3 grid grid-cols-4 rounded-md border border-[#d8d8cf] bg-[#f3f3ed] p-1">
        {formats.map((format) => (
          <button
            key={format.mime}
            type="button"
            onClick={() => onFormatChange(format.mime)}
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
            <label htmlFor="quality" className="font-medium">
              Quality
            </label>
            <span className="text-[#686b63]">{quality}%</span>
          </div>
          <input
            id="quality"
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(event) => onQualityChange(Number(event.target.value))}
            className="mt-3 w-full accent-[#191b1f]"
          />
        </div>
      )}
    </div>
  );
}
