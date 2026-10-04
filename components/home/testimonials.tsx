"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, Quote } from "lucide-react";
import { createSeed } from "@/data/seed";
import { data, useQuery, type Testimonial } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SEED_TESTIMONIALS = createSeed().testimonials;
const SLIDE_MS = 8000;

/** Approved testimonials (pinned first). Falls back to the sample stories before data loads. */
export function useTestimonials(): Testimonial[] {
  const { data: list } = useQuery("testimonials:public", () => data.testimonials.list());
  return list ?? SEED_TESTIMONIALS;
}

export function TestimonialCard({ t: item, className, large }: { t: Testimonial; className?: string; large?: boolean }) {
  const { t } = useI18n();
  return (
    <figure className={cn("relative flex h-full flex-col rounded-[2rem] bg-surface p-7 sm:p-9", className)}>
      <Quote className="size-7 text-accent" aria-hidden />
      <blockquote className={cn("mt-4 flex-1 font-serif leading-snug text-text", large ? "text-2xl sm:text-[1.7rem]" : "text-xl")}>
        {item.quote}
      </blockquote>
      <figcaption className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span>
          <span className="block font-bold">{item.name}</span>
          {item.detail && <span className="block text-sm text-muted">{item.detail}</span>}
        </span>
        {item.sample && (
          <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-accent-strong">
            {t("testimonials.sample")}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/**
 * Slow carousel: about 8 seconds per story, smooth crossfade, pauses on hover
 * and focus, with manual arrows and dots. Never auto-advances when the viewer
 * prefers reduced motion.
 */
export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const count = items.length;
  const current = count ? index % count : 0;
  const paused = hovered || focused || stopped || reduceMotion;

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (paused || count < 2) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [paused, count, current]);

  if (!count) return null;
  const go = (i: number) => setIndex((i + count) % count);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("nav.testimonials")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      className="mx-auto max-w-3xl"
    >
      <div className="lift grid rounded-[2rem]" aria-live={paused ? "polite" : "off"}>
        {items.map((item, i) => (
          <div
            key={item.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${count}`}
            aria-hidden={i !== current}
            inert={i !== current}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-700 ease-out",
              i === current ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <TestimonialCard t={item} large />
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(current - 1)}
            className="lift inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-primary"
            aria-label={t("common.previous")}
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="flex items-center gap-1">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                aria-label={t("testimonials.goTo", { n: i + 1 })}
                aria-current={i === current}
                className="group inline-flex size-6 cursor-pointer items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-500 ease-out",
                    i === current ? "w-6 bg-primary" : "w-2 bg-primary/25 group-hover:bg-primary/50",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(current + 1)}
            className="lift inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-primary"
            aria-label={t("common.next")}
          >
            <ChevronRight className="size-5" />
          </button>
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => setStopped((s) => !s)}
              className="ml-1 inline-flex size-10 cursor-pointer items-center justify-center rounded-full text-muted hover:text-primary"
              aria-label={stopped ? t("testimonials.play") : t("testimonials.pause")}
            >
              {stopped ? <Play className="size-4" /> : <Pause className="size-4" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
