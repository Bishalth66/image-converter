import type { FormatOption } from './types';

export const formats: FormatOption[] = [
  { label: 'JPG', mime: 'image/jpeg', extension: 'jpg', lossy: true },
  { label: 'PNG', mime: 'image/png', extension: 'png', lossy: false },
  { label: 'WEBP', mime: 'image/webp', extension: 'webp', lossy: true },
  { label: 'AVIF', mime: 'image/avif', extension: 'avif', lossy: true },
];

export const acceptedImages = 'image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.bmp,.svg,.tif,.tiff,.heic,.heif';

export const defaultFormat = formats[2];
