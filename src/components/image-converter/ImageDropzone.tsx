'use client';

import { useDropzone } from 'react-dropzone';

import { acceptedImageDropzone } from './config';
import type { ConversionResult, ImageInfo } from './types';
import { formatBytes } from './utils';

type ImageDropzoneProps = {
  file: File | null;
  imageInfo: ImageInfo | null;
  result: ConversionResult | null;
  onFileSelect: (file: File | null | undefined) => void;
  onReset: () => void;
};

export function ImageDropzone({
  file,
  imageInfo,
  result,
  onFileSelect,
  onReset,
}: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedImageDropzone,
    multiple: false,
    noClick: Boolean(file),
    onDrop: ([nextFile]) => onFileSelect(nextFile),
  });

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-dashed transition ${
        isDragActive ? 'border-[#191b1f] bg-white' : 'border-[#c9c9bf] bg-[#fbfbf7]'
      }`}
    >
      <input {...getInputProps()} />

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
              onClick={(event) => {
                event.stopPropagation();
                onReset();
              }}
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
  );
}
