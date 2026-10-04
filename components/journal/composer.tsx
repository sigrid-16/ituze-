"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowLeft, ImageIcon, Lightbulb, Mic, NotebookPen, Shuffle, X } from "lucide-react";
import { toast } from "@/components/common/toaster";
import { PrivacyNote } from "@/components/common/privacy-note";
import { CrisisCard } from "@/components/safety/crisis";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { REFLECTION_PROMPTS, promptOfTheDay } from "@/data/prompts";
import { data, type JournalEntryType, type Mood } from "@/lib/data";
import { useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { containsCrisisLanguage } from "@/lib/safety";
import { cn } from "@/lib/utils";
import { ImagePicker } from "./image-picker";
import { MoodPicker } from "./moods";
import { VoiceRecorder, type VoiceClip } from "./voice-recorder";

const TABS: { type: JournalEntryType; icon: typeof NotebookPen; key: string }[] = [
  { type: "text", icon: NotebookPen, key: "journal.write" },
  { type: "voice", icon: Mic, key: "journal.voice" },
  { type: "image", icon: ImageIcon, key: "journal.image" },
];

export function JournalComposer() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const { userId } = useCurrentUser();

  const initialType = (["text", "voice", "image"].includes(params.get("type") ?? "") ? params.get("type") : "text") as JournalEntryType;
  const initialPrompt = params.get("prompt");

  const [type, setType] = useState<JournalEntryType>(initialType);
  const [promptId, setPromptId] = useState<string | undefined>(initialPrompt ?? undefined);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<Mood | undefined>();
  const [voice, setVoice] = useState<VoiceClip | undefined>();
  const [image, setImage] = useState<string | undefined>();
  const [crisisDismissed, setCrisisDismissed] = useState(false);
  const [saving, setSaving] = useState(false);

  const deferredText = useDeferredValue(text);
  const crisisDetected = useMemo(() => containsCrisisLanguage(deferredText), [deferredText]);
  // Shown gently while crisis language is present; never blocks writing or saving.
  const showCrisis = crisisDetected && !crisisDismissed;

  const prompt = promptId ? REFLECTION_PROMPTS.find((p) => p.id === promptId) : undefined;

  const canSave =
    !saving && (type === "text" ? text.trim().length > 0 : type === "voice" ? !!voice : !!image);

  function nextPrompt() {
    const idx = prompt ? REFLECTION_PROMPTS.indexOf(prompt) : REFLECTION_PROMPTS.indexOf(promptOfTheDay()) - 1;
    setPromptId(REFLECTION_PROMPTS[(idx + 1 + REFLECTION_PROMPTS.length) % REFLECTION_PROMPTS.length].id);
  }

  async function save() {
    setSaving(true);
    await data.journal.create({
      userId,
      type,
      content: text.trim(),
      mediaUrl: type === "voice" ? voice?.dataUrl : type === "image" ? image : undefined,
      durationSec: type === "voice" ? voice?.durationSec : undefined,
      mood,
      promptId,
    });
    toast(t("journal.saved"));
    router.push("/app/journal");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-2">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label={t("common.back")}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-extrabold tracking-tight">{t("journal.new")}</h1>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1 ring-1 ring-border" role="tablist">
        {TABS.map(({ type: tp, icon: Icon, key }) => (
          <button
            key={tp}
            role="tab"
            aria-selected={type === tp}
            onClick={() => setType(tp)}
            className={cn(
              "inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-bold transition-colors",
              type === tp ? "bg-primary text-primary-foreground" : "text-muted hover:text-text",
            )}
          >
            <Icon className="size-4" /> {t(key)}
          </button>
        ))}
      </div>

      {/* Optional reflection prompt */}
      {prompt ? (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-primary-soft p-4">
          <Lightbulb className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="flex-1 font-bold text-primary">{t(prompt.key)}</p>
          <button onClick={nextPrompt} className="cursor-pointer rounded-full p-1.5 text-primary hover:bg-surface" aria-label={t("journal.anotherPrompt")} title={t("journal.anotherPrompt")}>
            <Shuffle className="size-4" />
          </button>
          <button onClick={() => setPromptId(undefined)} className="cursor-pointer rounded-full p-1.5 text-primary hover:bg-surface" aria-label={t("journal.hidePrompt")} title={t("journal.hidePrompt")}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setPromptId(promptOfTheDay().id)} className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <Lightbulb className="size-4" /> {t("journal.usePrompt")}
        </button>
      )}

      <div className="space-y-4">
        {type === "voice" && <VoiceRecorder value={voice} onChange={setVoice} />}
        {type === "image" && <ImagePicker value={image} onChange={setImage} />}

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={type === "text" ? t("journal.placeholder") : t("journal.caption")}
          rows={type === "text" ? 10 : 3}
          aria-label={type === "text" ? t("journal.write") : t("journal.caption")}
          autoFocus={type === "text"}
          className="min-h-24 resize-y"
        />

        {showCrisis && <CrisisCard onDismiss={() => setCrisisDismissed(true)} />}

        <MoodPicker value={mood} onChange={setMood} />
      </div>

      <div className="sticky bottom-20 mt-6 flex items-center gap-3 rounded-3xl border border-border bg-surface/95 p-3 pl-5 shadow-lg backdrop-blur lg:bottom-6">
        <PrivacyNote className="flex-1 text-xs sm:text-sm" />
        <Button onClick={save} disabled={!canSave}>
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}
