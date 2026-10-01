"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface VoiceClip {
  dataUrl: string;
  durationSec: number;
}

const MAX_SECONDS = 180;
const BARS = 28;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** Records a short voice note with MediaRecorder. Audio stays on this device in the demo. */
export function VoiceRecorder({ value, onChange }: { value?: VoiceClip; onChange: (clip?: VoiceClip) => void }) {
  const { t } = useI18n();
  const [state, setState] = useState<"idle" | "recording" | "denied" | "unsupported">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0.08));
  const recorder = useRef<MediaRecorder | null>(null);
  const cleanup = useRef<() => void>(() => {});

  useEffect(() => () => cleanup.current(), []);

  async function start() {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setState("denied");
      return;
    }
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m));
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 32000 } : undefined);
    const chunks: Blob[] = [];
    const startedAt = Date.now();

    // Live level meter
    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const buf = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
      setLevels((l) => [...l.slice(1), Math.max(0.08, Math.min(1, peak * 2.2))]);
      const secs = (Date.now() - startedAt) / 1000;
      setElapsed(secs);
      if (secs >= MAX_SECONDS) rec.stop();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    cleanup.current = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((tr) => tr.stop());
      ctx.close().catch(() => {});
    };

    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onstop = async () => {
      cleanup.current();
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      const durationSec = (Date.now() - startedAt) / 1000;
      onChange({ dataUrl: await blobToDataUrl(blob), durationSec });
      setState("idle");
    };
    recorder.current = rec;
    rec.start();
    setElapsed(0);
    setState("recording");
  }

  function stop() {
    recorder.current?.stop();
  }

  if (state === "unsupported" || state === "denied") {
    return (
      <div className="rounded-2xl bg-accent-soft p-4 text-sm font-semibold text-accent-strong">
        {t(state === "denied" ? "journal.micDenied" : "journal.micUnsupported")}
        <Button variant="link" size="sm" className="ml-2 h-auto" onClick={() => setState("idle")}>
          {t("journal.reRecord")}
        </Button>
      </div>
    );
  }

  if (value && state === "idle") {
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
        <p className="text-sm font-semibold">
          {t("journal.voiceNote")} · {formatDuration(value.durationSec)}
        </p>
        <audio controls src={value.dataUrl} className="w-full" />
        <Button variant="ghost" size="sm" onClick={() => onChange(undefined)}>
          <RotateCcw /> {t("journal.reRecord")}
        </Button>
      </div>
    );
  }

  const recording = state === "recording";
  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-background px-4 py-8">
      <div className="flex h-16 w-full max-w-sm items-center justify-center gap-[3px]" aria-hidden>
        {levels.map((l, i) => (
          <span
            key={i}
            className={cn("w-1.5 rounded-full transition-[height] duration-75", recording ? "bg-primary" : "bg-border")}
            style={{ height: `${Math.round(l * 100)}%` }}
          />
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm font-semibold tabular-nums" aria-live="polite">
        {recording && <span className="animate-rec size-2.5 rounded-full bg-crisis" />}
        {recording ? `${t("journal.recording")} ${formatDuration(elapsed)}` : formatDuration(0)}
      </p>
      {recording ? (
        <Button size="lg" variant="outline" onClick={stop} className="min-w-44">
          <Square className="fill-current" /> {t("journal.stop")}
        </Button>
      ) : (
        <Button size="lg" onClick={start} className="min-w-44">
          <Mic /> {t("journal.record")}
        </Button>
      )}
    </div>
  );
}
