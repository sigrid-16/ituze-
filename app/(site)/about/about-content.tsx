"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Languages, MapPin } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { Botanical } from "@/components/brand/botanical";
import { SectionHeading, withItalics } from "@/components/common/serif";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { createSeed } from "@/data/seed";
import { useI18n } from "@/lib/i18n";

const PSYCHOLOGISTS = createSeed()
  .psychologists.filter((p) => p.verificationStatus === "verified")
  .slice(0, 4);

const VALUES = [
  { n: 1, icon: "leaf" },
  { n: 2, icon: "sprig" },
  { n: 3, icon: "bud" },
  { n: 4, icon: "stem" },
] as const;

export function AboutContent() {
  const { t } = useI18n();
  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-24">
          <p className="eyebrow animate-rise">{t("about.eyebrow")}</p>
          <h1 className="animate-rise mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl [animation-delay:80ms]">
            {withItalics(t("about.title"))}
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted [animation-delay:160ms]">
            {t("about.intro")}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:py-24">
        <Reveal>
          <SectionHeading align="left" eyebrow={t("about.whyEyebrow")} title={t("about.whyTitle")} body={t("about.whyBody")} />
        </Reveal>
        <Reveal delay={120} className="relative mx-auto aspect-square w-full max-w-sm">
          <div className="absolute inset-0 rounded-full bg-sage" aria-hidden />
          <div className="absolute inset-8 flex items-center justify-center rounded-full bg-blush" aria-hidden>
            <Botanical variant="sprig" className="size-32 text-primary/50" />
          </div>
        </Reveal>
      </section>

      <section className="bg-sage">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <Reveal>
            <SectionHeading eyebrow={t("about.valuesEyebrow")} title={t("about.valuesTitle")} />
          </Reveal>
          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => (
              <Reveal as="li" key={v.n} delay={i * 100} className="arch lift bg-surface/85 px-6 pb-8 pt-12 text-center">
                <Botanical variant={v.icon} className="mx-auto size-10 text-accent" />
                <h3 className="mt-4 font-serif text-2xl">{t(`about.value${v.n}Title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`about.value${v.n}Body`)}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <Reveal>
          <SectionHeading eyebrow={t("about.teamEyebrow")} title={t("about.teamTitle")} body={t("about.teamBody")} />
        </Reveal>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PSYCHOLOGISTS.map((p, i) => (
            <Reveal as="li" key={p.id} delay={i * 100} className="lift rounded-[2rem] border border-border bg-surface p-6 text-center">
              <Avatar name={p.name} color={p.photoColor} className="mx-auto size-20 text-xl" />
              <p className="mt-4 font-serif text-xl leading-tight">{p.name}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
                <BadgeCheck className="size-3.5" /> {t("about.verified")}
              </p>
              <p className="mt-3 text-sm text-muted">{p.specialties.slice(0, 2).join(" · ")}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3.5" /> {p.location.split(" · ")[0]}
              </p>
            </Reveal>
          ))}
        </ul>
        <Reveal className="mx-auto mt-12 flex max-w-xl items-center gap-4 rounded-full bg-blush px-6 py-4">
          <Languages className="size-6 shrink-0 text-accent-strong" />
          <p className="text-sm">
            <span className="font-bold">{t("about.languagesTitle")}.</span> {t("about.languagesBody")}
          </p>
        </Reveal>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="lift">
            <Link href="/signup">
              {t("home.getStarted")} <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
