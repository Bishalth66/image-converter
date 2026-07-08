'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { defaultFormat, formats } from './config';
import type { ConversionResult, ImageItem, OutputFormat } from './types';
import { createOutputName, createZipBlob, hasSupportedImageExtension } from './utils';

export function useImageConverter() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>(defaultFormat.mime);
  const [quality, setQuality] = useState(86);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lockAspect, setLockAspect] = useState(true);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsRef = useRef<ImageItem[]>([]);
  const resultsRef = useRef<ConversionResult[]>([]);

  const selectedFormat = formats.find((format) => format.mime === targetFormat) ?? defaultFormat;
  const activeItem = items.find((item) => item.id === activeId) ?? items[0] ?? null;
  const file = activeItem?.file ?? null;
  const imageInfo = activeItem ? { width: activeItem.width, height: activeItem.height, url: activeItem.url } : null;
  const result = activeItem ? (results.find((nextResult) => nextResult.id === activeItem.id) ?? null) : null;
  const totalInputSize = items.reduce((total, item) => total + item.file.size, 0);
  const totalOutputSize = results.reduce((total, nextResult) => total + nextResult.blob.size, 0);
  const savings =
    totalInputSize > 0 && results.length > 0 ? Math.round((1 - totalOutputSize / totalInputSize) * 100) : null;

  const outputName = useMemo(
    () => createOutputName(file, selectedFormat, result?.width, result?.height),
    [file, result?.height, result?.width, selectedFormat],
  );

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      resultsRef.current.forEach((nextResult) => URL.revokeObjectURL(nextResult.url));
    };
  }, []);

  const clearResults = () => {
    resultsRef.current.forEach((nextResult) => URL.revokeObjectURL(nextResult.url));
    setResults([]);
  };

  const loadImageItem = async (nextFile: File): Promise<ImageItem> => {
    const url = URL.createObjectURL(nextFile);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;

    try {
      await img.decode();
      return {
        id: `${nextFile.name}-${nextFile.lastModified}-${nextFile.size}-${crypto.randomUUID()}`,
        file: nextFile,
        width: img.naturalWidth,
        height: img.naturalHeight,
        url,
      };
    } catch {
      URL.revokeObjectURL(url);
      throw new Error(`${nextFile.name} could not be opened by the browser.`);
    }
  };

  const convertItem = async (item: ImageItem) => {
    const outputWidth = Math.max(1, Math.round(Number(width) || item.width));
    const outputHeight = Math.max(1, Math.round(Number(height) || item.height));
    const img = new Image();
    img.decoding = 'async';
    img.src = item.url;

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

    return {
      id: item.id,
      sourceName: item.file.name,
      blob,
      url: URL.createObjectURL(blob),
      width: outputWidth,
      height: outputHeight,
      extension: selectedFormat.extension,
    };
  };

  const updateTargetFormat = (format: OutputFormat) => {
    setTargetFormat(format);
    clearResults();
  };

  const updateQuality = (value: number) => {
    setQuality(value);
    clearResults();
  };

  const updateWidth = (value: string) => {
    setWidth(value);
    clearResults();
    if (!lockAspect || !imageInfo) return;

    const nextWidth = Number(value);
    setHeight(nextWidth > 0 ? String(Math.round((nextWidth / imageInfo.width) * imageInfo.height)) : '');
  };

  const updateHeight = (value: string) => {
    setHeight(value);
    clearResults();
    if (!lockAspect || !imageInfo) return;

    const nextHeight = Number(value);
    setWidth(nextHeight > 0 ? String(Math.round((nextHeight / imageInfo.height) * imageInfo.width)) : '');
  };

  const loadImages = async (nextFiles: File[] | FileList | null | undefined) => {
    const imageFiles = Array.from(nextFiles ?? []).filter((nextFile) => {
      return nextFile.type.startsWith('image/') || hasSupportedImageExtension(nextFile.name);
    });

    if (imageFiles.length === 0) {
      setError('Choose one or more image files.');
      return;
    }

    setLoading(true);
    setError(null);
    clearResults();
    const nextItems: ImageItem[] = [];

    try {
      for (const imageFile of imageFiles) {
        nextItems.push(await loadImageItem(imageFile));
      }
      const firstItem = nextItems[0];

      setItems((currentItems) => [...currentItems, ...nextItems]);
      setActiveId(firstItem.id);
      setWidth(String(firstItem.width));
      setHeight(String(firstItem.height));
    } catch (loadError) {
      nextItems.forEach((item) => URL.revokeObjectURL(item.url));
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'These images could not be opened by the browser. Try PNG, JPG, WEBP, AVIF, GIF, BMP, or SVG.',
      );
    } finally {
      setLoading(false);
    }
  };

  const convert = async () => {
    if (items.length === 0) return;

    setLoading(true);
    setError(null);
    clearResults();

    try {
      const convertedItems = await Promise.all(items.map(convertItem));
      setResults(convertedItems);
    } catch (conversionError) {
      setError(conversionError instanceof Error ? conversionError.message : 'Could not convert these images.');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = (nextResult: ConversionResult) => {
    const sourceFile = items.find((item) => item.id === nextResult.id)?.file ?? null;
    const link = document.createElement('a');
    link.href = nextResult.url;
    link.download = createOutputName(sourceFile, selectedFormat, nextResult.width, nextResult.height);
    link.click();
  };

  const download = async () => {
    if (results.length === 0) return;

    if (results.length === 1 && result) {
      downloadResult(result);
      return;
    }

    const zipBlob = await createZipBlob(
      results.map((nextResult) => {
        const sourceFile = items.find((item) => item.id === nextResult.id)?.file ?? null;
        return {
          name: createOutputName(sourceFile, selectedFormat, nextResult.width, nextResult.height),
          blob: nextResult.blob,
        };
      }),
    );
    const zipUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = zipUrl;
    link.download = `converted-images-${selectedFormat.extension}.zip`;
    link.click();

    window.setTimeout(() => {
      URL.revokeObjectURL(zipUrl);
    });
  };

  const reset = () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    resultsRef.current.forEach((nextResult) => URL.revokeObjectURL(nextResult.url));
    setItems([]);
    setActiveId(null);
    setResults([]);
    setWidth('');
    setHeight('');
    setError(null);
  };

  return {
    items,
    activeId,
    file,
    imageInfo,
    targetFormat,
    selectedFormat,
    quality,
    width,
    height,
    lockAspect,
    result,
    results,
    loading,
    error,
    savings,
    outputName,
    setActiveId,
    setLockAspect,
    updateTargetFormat,
    updateQuality,
    updateWidth,
    updateHeight,
    loadImages,
    convert,
    download,
    reset,
  };
}
