'use client';

type ResizePanelProps = {
  width: string;
  height: string;
  lockAspect: boolean;
  onWidthChange: (value: string) => void;
  onHeightChange: (value: string) => void;
  onLockAspectChange: (locked: boolean) => void;
};

export function ResizePanel({
  width,
  height,
  lockAspect,
  onWidthChange,
  onHeightChange,
  onLockAspectChange,
}: ResizePanelProps) {
  return (
    <div className="rounded-lg border border-[#deded5] bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Resize</h2>
        <label className="flex items-center gap-2 text-sm text-[#686b63]">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(event) => onLockAspectChange(event.target.checked)}
            className="h-4 w-4 accent-[#191b1f]"
          />
          Lock ratio
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium">
          Width
          <input
            type="number"
            min="1"
            value={width}
            onChange={(event) => onWidthChange(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-[#cdcdc4] px-3 outline-none transition focus:border-[#191b1f]"
          />
        </label>
        <label className="text-sm font-medium">
          Height
          <input
            type="number"
            min="1"
            value={height}
            onChange={(event) => onHeightChange(event.target.value)}
            className="mt-2 h-10 w-full rounded-md border border-[#cdcdc4] px-3 outline-none transition focus:border-[#191b1f]"
          />
        </label>
      </div>
    </div>
  );
}
