"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botanical } from "@/components/brand/botanical";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * The three ways Ituze supports people. Photos are pre-cropped to 4:5 and
 * positioned so the subject stays in view inside the arch at every size.
 */
export const SUPPORT_OPTIONS = [
  {
    key: "advice",
    title: "home.adviceTitle",
    body: "home.adviceBody",
    alt: "home.adviceAlt",
    src: "/images/get-advice.jpg",
    // Keep the dandelion and the candle in view
    position: "30% 40%",
    tone: "bg-blush",
    icon: "sprig",
  },
  {
    key: "community",
    title: "home.communityTitle",
    body: "home.communityBody",
    alt: "home.communityAlt",
    src: "/images/join-community.jpg",
    // The group sits in the lower half of the photo
    position: "50% 72%",
    tone: "bg-sage",
    icon: "leaf",
  },
  {
    key: "professional",
    title: "home.professionalTitle",
    body: "home.professionalBody",
    alt: "home.professionalAlt",
    src: "/images/professional-support.jpg",
    // Both people talking
    position: "50% 45%",
    tone: "bg-blush",
    icon: "stem",
  },
] as const;

export function SupportCards({ welcome }: { welcome?: boolean }) {
  const { t } = useI18n();
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {SUPPORT_OPTIONS.map((o, i) => (
        <li
          key={o.key}
          className={cn("mx-auto w-full max-w-sm sm:max-w-none", welcome && "welcome-hide", i === 2 && "sm:col-span-2 sm:max-w-sm lg:col-span-1 lg:max-w-none")}
          style={welcome ? ({ "--welcome-delay": `${650 + i * 260}ms` } as React.CSSProperties) : undefined}
        >
          <Link
            href="/signup"
            className={cn("arch lift group flex h-full flex-col p-3 pb-7 text-center", o.tone)}
            aria-label={`${t(o.title)}: ${t(o.body)}`}
          >
            <div className="arch-top relative aspect-[4/5] overflow-hidden">
              <Image
                src={o.src}
                alt={t(o.alt)}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 360px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                style={{ objectPosition: o.position }}
              />
            </div>
            <Botanical variant={o.icon} className="mx-auto mt-5 size-9 text-accent" />
            <h3 className="mt-2 font-serif text-3xl leading-tight">{t(o.title)}</h3>
            <p className="mx-auto mt-2 max-w-[26ch] leading-relaxed text-muted">{t(o.body)}</p>
            <span className="mt-4 inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              {t("common.learnMore")} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Placeholder for the hero photo. Swap for <Image src="/images/hero.jpg" …/> once a photo is chosen. */
export function HeroPhotoPlaceholder({ className, label }: { className?: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn("arch relative flex aspect-[4/5] w-full items-end justify-center overflow-hidden bg-sage", className)}
    >
      <div className="absolute inset-x-6 top-6 bottom-0 arch-top bg-gradient-to-b from-blush/80 to-sage" aria-hidden />
      <div className="absolute -right-10 bottom-10 size-40 rounded-full bg-accent-soft/70" aria-hidden />
      <Botanical variant="stem" className="relative mb-16 size-40 text-primary/45" />
      <span className="absolute bottom-5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-primary/60">{label}</span>
    </div>
  );
}
