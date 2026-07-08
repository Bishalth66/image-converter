'use client';
import { ExportPanel } from './image-converter/ExportPanel';
import { FormatPanel } from './image-converter/FormatPanel';
import { ImageDropzone } from './image-converter/ImageDropzone';
import { ResizePanel } from './image-converter/ResizePanel';
import { useImageConverter } from './image-converter/useImageConverter';

export default function ImageConverter() {
  const converter = useImageConverter();

  return (
    <main className="min-h-screen bg-[#f7f7f2] text-[#191b1f]">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#deded5] pb-4">
          <h1 className="mt-1 text-2xl font-semibold tracking-normal sm:text-3xl">Image Converter</h1>
        </header>

        <section className="grid flex-1 gap-6 py-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ImageDropzone
            items={converter.items}
            activeId={converter.activeId}
            result={converter.result}
            onFileSelect={converter.loadImages}
            onActiveChange={converter.setActiveId}
            onReset={converter.reset}
          />

          <aside className="space-y-5">
            <FormatPanel
              targetFormat={converter.targetFormat}
              selectedFormat={converter.selectedFormat}
              quality={converter.quality}
              onFormatChange={converter.updateTargetFormat}
              onQualityChange={converter.updateQuality}
            />

            <ResizePanel
              width={converter.width}
              height={converter.height}
              lockAspect={converter.lockAspect}
              onWidthChange={converter.updateWidth}
              onHeightChange={converter.updateHeight}
              onLockAspectChange={converter.setLockAspect}
            />

            <ExportPanel
              file={converter.file}
              fileCount={converter.items.length}
              resultCount={converter.results.length}
              selectedFormat={converter.selectedFormat}
              width={converter.width}
              height={converter.height}
              result={converter.result}
              loading={converter.loading}
              error={converter.error}
              savings={converter.savings}
              onConvert={converter.convert}
              onDownload={converter.download}
            />
          </aside>
        </section>
      </div>
    </main>
  );
}
