"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Botanical } from "@/components/brand/botanical";
import { SectionHeading, withItalics } from "@/components/common/serif";
import { HeroPhotoPlaceholder, SupportCards } from "@/components/home/support-cards";
import { TestimonialCarousel, useTestimonials } from "@/components/home/testimonials";
import { WelcomeOverlay } from "@/components/home/welcome";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { data, useQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";

const delay = (ms: number) => ({ "--welcome-delay": `${ms}ms` }) as React.CSSProperties;

export default function HomePage() {
  const { t } = useI18n();
  const testimonials = useTestimonials();
  // Organizers can override the hero copy from their dashboard
  const { data: content } = useQuery("site-content", () => data.content.get());
  const welcome = t("home.welcome");

  return (
    <>
      <WelcomeOverlay text={welcome} targetId="hero-title" />

      {/* Hero */}
      <section className="relative overflow-hidden bg-blush">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.15fr_0.85fr] md:pb-24 md:pt-20">
          <div>
            <p className="eyebrow welcome-hide mb-6" style={delay(150)}>
              {t("home.heroEyebrow")}
            </p>
            <h1 id="hero-title" className="welcome-title welcome-heading">
              {withItalics(content?.heroTitle || welcome)}
            </h1>
            <p className="welcome-hide mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted" style={delay(250)}>
              {content?.heroBody || t("home.heroBody")}
            </p>
            <div className="welcome-hide mt-9" style={delay(400)}>
              <Button asChild size="lg" className="lift bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/signup">
                  {t("home.getStarted")} <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
          <div className="welcome-hide relative mx-auto w-full max-w-sm md:max-w-none" style={delay(300)}>
            <div className="absolute -right-24 top-10 bottom-10 hidden w-48 bg-sage md:block" aria-hidden />
            <HeroPhotoPlaceholder label={t("home.heroPhoto")} className="relative" />
          </div>
        </div>
      </section>

      {/* Three ways we support you */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <div className="welcome-hide" style={delay(500)}>
            <SectionHeading eyebrow={t("home.supportEyebrow")} title={t("home.supportTitle")} />
          </div>
          <div className="mt-12">
            <SupportCards welcome />
          </div>
          <div className="welcome-hide mt-12 text-center" style={delay(1400)}>
            <Button asChild className="lift px-8">
              <Link href="/signup">{t("home.getStarted")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="welcome-hide" style={delay(1500)}>
        {/* How it works */}
        <section className="bg-sage">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Reveal>
              <SectionHeading eyebrow={t("home.howEyebrow")} title={t("home.howTitle")} />
            </Reveal>
            <ol className="mt-12 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n, i) => (
                <Reveal as="li" key={n} delay={i * 120} className="lift rounded-[2rem] bg-surface/80 p-7 text-center">
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-primary/25 font-serif text-2xl text-primary">
                    {n}
                  </span>
                  <h3 className="mt-4 font-serif text-2xl">{t(`home.how${n}Title`)}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{t(`home.how${n}Body`)}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>

        {/* Testimonials preview */}
        <section className="bg-background">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
            <Reveal>
              <SectionHeading eyebrow={t("home.storiesEyebrow")} title={t("home.storiesTitle")} />
            </Reveal>
            <Reveal className="mt-12" delay={120}>
              <TestimonialCarousel items={testimonials} />
            </Reveal>
            <div className="mt-8 text-center">
              <Link href="/testimonials" className="text-xs font-bold uppercase tracking-[0.18em] text-primary hover:underline">
                {t("home.storiesAll")}
              </Link>
            </div>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="px-4 pb-20 sm:px-6">
          <Reveal className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-blush px-6 py-16 text-center sm:px-12">
            <Botanical variant="bud" className="mx-auto size-12 text-accent" />
            <p className="eyebrow mt-4">{t("home.ctaEyebrow")}</p>
            <h2 className="mt-3 font-serif text-4xl sm:text-5xl">{withItalics(t("home.ctaTitle"))}</h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{t("home.ctaBody")}</p>
            <Button asChild size="lg" className="lift mt-8">
              <Link href="/signup">
                {t("home.getStarted")} <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </section>
      </div>
    </>
  );
}
