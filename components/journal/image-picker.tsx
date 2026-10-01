"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

/** Downscale to keep the demo's browser storage small. */
async function resizeImage(file: File, max = 1280, quality = 0.82): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ImagePicker({ value, onChange }: { value?: string; onChange: (dataUrl?: string) => void }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(file?: File) {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await resizeImage(file));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handle(e.target.files?.[0])}
        aria-label={t("journal.addImage")}
      />
      {value ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="max-h-96 w-full rounded-2xl border border-border bg-background object-contain" />
          <Button variant="ghost" size="sm" onClick={() => input.current?.click()}>
            <RefreshCw /> {t("journal.changeImage")}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handle(e.dataTransfer.files?.[0]);
          }}
          className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background px-4 py-10 text-muted transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ImagePlus className="size-8" />
          <span className="font-semibold">{busy ? t("common.loading") : t("journal.addImage")}</span>
        </button>
      )}
    </div>
  );
}
