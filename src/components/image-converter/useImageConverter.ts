'use client';

import { useEffect, useMemo, useState } from 'react';

import { defaultFormat, formats } from './config';
import type { ConversionResult, ImageInfo, OutputFormat } from './types';
import { createOutputName, hasSupportedImageExtension } from './utils';

export function useImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>(defaultFormat.mime);
  const [quality, setQuality] = useState(86);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedFormat = formats.find((format) => format.mime === targetFormat) ?? defaultFormat;
  const savings = file && result ? Math.round((1 - result.blob.size / file.size) * 100) : null;

  const outputName = useMemo(
    () => createOutputName(file, selectedFormat, result?.width, result?.height),
    [file, result?.height, result?.width, selectedFormat],
  );

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

  const clearResult = () => {
    setResult(null);
  };

  const updateTargetFormat = (format: OutputFormat) => {
    setTargetFormat(format);
    clearResult();
  };

  const updateQuality = (value: number) => {
    setQuality(value);
    clearResult();
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

    if (!nextFile.type.startsWith('image/') && !hasSupportedImageExtension(nextFile.name)) {
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
      setFile(nextFile);
      setImageInfo({ width: img.naturalWidth, height: img.naturalHeight, url });
      setWidth(String(img.naturalWidth));
      setHeight(String(img.naturalHeight));
    } catch {
      URL.revokeObjectURL(url);
      setError('This image could not be opened by the browser. Try PNG, JPG, WEBP, AVIF, GIF, BMP, or SVG.');
    } finally {
      setLoading(false);
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
    setFile(null);
    setImageInfo(null);
    setResult(null);
    setWidth('');
    setHeight('');
    setError(null);
  };

  return {
    file,
    imageInfo,
    targetFormat,
    selectedFormat,
    quality,
    width,
    height,
    lockAspect,
    result,
    loading,
    error,
    savings,
    setLockAspect,
    updateTargetFormat,
    updateQuality,
    updateWidth,
    updateHeight,
    loadImage,
    convert,
    download,
    reset,
  };
}
