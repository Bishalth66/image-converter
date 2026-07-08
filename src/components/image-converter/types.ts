export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';

export type ImageInfo = {
  width: number;
  height: number;
  url: string;
};

export type ImageItem = ImageInfo & {
  id: string;
  file: File;
};

export type ConversionResult = {
  id: string;
  sourceName: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  extension: string;
};

export type FormatOption = {
  label: string;
  mime: OutputFormat;
  extension: string;
  lossy: boolean;
};
