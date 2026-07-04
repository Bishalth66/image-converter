import type { FormatOption } from './types';

export const hasSupportedImageExtension = (fileName: string) =>
  /\.(jpe?g|png|webp|avif|gif|bmp|svg|tiff?|heic|heif)$/i.test(fileName);

export const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const createOutputName = (
  file: File | null,
  selectedFormat: FormatOption,
  width?: number,
  height?: number,
) => {
  if (!file) return `converted.${selectedFormat.extension}`;

  const baseName = file.name.replace(/\.[^.]+$/, '');
  return `${baseName}-${width ?? 'converted'}x${height ?? 'resized'}.${selectedFormat.extension}`;
};
