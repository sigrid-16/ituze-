"use client";

import Link from "next/link";
import { Botanical } from "@/components/brand/botanical";
import { withItalics } from "@/components/common/serif";
import { TestimonialCard, useTestimonials } from "@/components/home/testimonials";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function TestimonialsContent() {
  const { t } = useI18n();
  const items = useTestimonials();
  const hasSamples = items.some((i) => i.sample);

  return (
    <>
      <section className="bg-blush">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 md:py-24">
          <p className="eyebrow animate-rise">{t("testimonials.eyebrow")}</p>
          <h1 className="animate-rise mt-4 font-serif text-5xl leading-[1.05] sm:text-6xl [animation-delay:80ms]">
            {withItalics(t("testimonials.title"))}
          </h1>
          <p className="animate-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted [animation-delay:160ms]">
            {t("testimonials.intro")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <ul className="grid gap-6 lg:grid-cols-3">
          {items.map((item, i) => (
            <Reveal as="li" key={item.id} delay={i * 140} className="lift rounded-[2rem]">
              <TestimonialCard t={item} className={i % 2 ? "bg-sage" : "bg-blush"} />
            </Reveal>
          ))}
        </ul>
        {hasSamples && <p className="mx-auto mt-8 max-w-xl text-center text-sm text-muted">{t("testimonials.sampleNote")}</p>}
      </section>

      <section className="px-4 pb-20 sm:px-6">
        <Reveal className="mx-auto max-w-4xl rounded-[2.5rem] bg-sage px-6 py-14 text-center sm:px-12">
          <Botanical variant="leaf" className="mx-auto size-11 text-primary/60" />
          <h2 className="mt-4 font-serif text-4xl">{withItalics(t("testimonials.shareTitle"))}</h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">{t("testimonials.shareBody")}</p>
          <Button asChild className="lift mt-7">
            <Link href="/signup">{t("home.getStarted")}</Link>
          </Button>
        </Reveal>
      </section>
    </>
  );
}
