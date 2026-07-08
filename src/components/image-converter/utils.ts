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

type ZipFile = {
  name: string;
  blob: Blob;
};

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const getCrc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
};

const getDosDateTime = () => {
  const now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  return { dosDate, dosTime };
};

const writeZipHeader = (values: Array<[number, number, 2 | 4]>, size: number) => {
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);
  values.forEach(([offset, value, byteLength]) => {
    if (byteLength === 2) {
      view.setUint16(offset, value, true);
    } else {
      view.setUint32(offset, value, true);
    }
  });
  return bytes;
};

export const createZipBlob = async (files: ZipFile[]) => {
  const encoder = new TextEncoder();
  const { dosDate, dosTime } = getDosDateTime();
  const localParts: BlobPart[] = [];
  const centralParts: BlobPart[] = [];
  let offset = 0;

  for (const file of files) {
    const fileBytes = new Uint8Array(await file.blob.arrayBuffer());
    const nameBytes = encoder.encode(file.name);
    const crc = getCrc32(fileBytes);

    const localHeader = writeZipHeader(
      [
        [0, 0x04034b50, 4],
        [4, 20, 2],
        [6, 2048, 2],
        [8, 0, 2],
        [10, dosTime, 2],
        [12, dosDate, 2],
        [14, crc, 4],
        [18, fileBytes.length, 4],
        [22, fileBytes.length, 4],
        [26, nameBytes.length, 2],
        [28, 0, 2],
      ],
      30,
    );

    const centralHeader = writeZipHeader(
      [
        [0, 0x02014b50, 4],
        [4, 20, 2],
        [6, 20, 2],
        [8, 2048, 2],
        [10, 0, 2],
        [12, dosTime, 2],
        [14, dosDate, 2],
        [16, crc, 4],
        [20, fileBytes.length, 4],
        [24, fileBytes.length, 4],
        [28, nameBytes.length, 2],
        [30, 0, 2],
        [32, 0, 2],
        [34, 0, 2],
        [36, 0, 2],
        [38, 0, 4],
        [42, offset, 4],
      ],
      46,
    );

    localParts.push(localHeader, nameBytes, fileBytes);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + fileBytes.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + (part instanceof Uint8Array ? part.length : 0), 0);
  const endHeader = writeZipHeader(
    [
      [0, 0x06054b50, 4],
      [4, 0, 2],
      [6, 0, 2],
      [8, files.length, 2],
      [10, files.length, 2],
      [12, centralSize, 4],
      [16, offset, 4],
      [20, 0, 2],
    ],
    22,
  );

  return new Blob([...localParts, ...centralParts, endHeader], { type: 'application/zip' });
};
