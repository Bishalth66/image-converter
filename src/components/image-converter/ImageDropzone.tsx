'use client';

import { useDropzone } from 'react-dropzone';

import { acceptedImageDropzone } from './config';
import type { ConversionResult, ImageItem } from './types';
import { formatBytes } from './utils';

type ImageDropzoneProps = {
  items: ImageItem[];
  activeId: string | null;
  result: ConversionResult | null;
  onFileSelect: (files: File[] | FileList | null | undefined) => void;
  onActiveChange: (id: string) => void;
  onReset: () => void;
};

export function ImageDropzone({
  items,
  activeId,
  result,
  onFileSelect,
  onActiveChange,
  onReset,
}: ImageDropzoneProps) {
  const activeItem = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const hasItems = items.length > 0;

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: acceptedImageDropzone,
    multiple: true,
    noClick: hasItems,
    onDrop: (acceptedFiles) => onFileSelect(acceptedFiles),
  });

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-dashed transition ${
        isDragActive ? 'border-[#191b1f] bg-white' : 'border-[#c9c9bf] bg-[#fbfbf7]'
      }`}
    >
      <input {...getInputProps()} />

      {activeItem ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-[#e4e4dc] px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{activeItem.file.name}</p>
              <p className="mt-0.5 text-xs text-[#71736c]">
                {activeItem.width} x {activeItem.height} px / {formatBytes(activeItem.file.size)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  open();
                }}
                className="h-9 rounded-md border border-[#cecec4] px-3 text-sm font-medium transition hover:border-[#191b1f]"
              >
                Add files
              </button>
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
          </div>
          <div className="grid flex-1 place-items-center bg-[linear-gradient(45deg,#eeeeE7_25%,transparent_25%),linear-gradient(-45deg,#eeeeE7_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eeeeE7_75%),linear-gradient(-45deg,transparent_75%,#eeeeE7_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result?.url ?? activeItem.url}
              alt="Selected image preview"
              className="max-h-[58vh] max-w-full object-contain shadow-sm"
            />
          </div>
          {items.length > 1 && (
            <div className="grid max-h-28 grid-cols-2 gap-2 overflow-y-auto border-t border-[#e4e4dc] p-3 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onActiveChange(item.id);
                  }}
                  className={`min-w-0 rounded-md border px-3 py-2 text-left text-xs transition ${
                    item.id === activeItem.id
                      ? 'border-[#191b1f] bg-white'
                      : 'border-[#deded5] bg-[#fbfbf7] hover:border-[#a9aaa0]'
                  }`}
                >
                  <span className="block truncate font-medium">{item.file.name}</span>
                  <span className="mt-0.5 block text-[#71736c]">{formatBytes(item.file.size)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="grid flex-1 place-items-center p-8 text-center">
          <div>
            <p className="text-xl font-semibold">Drop images here</p>
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
