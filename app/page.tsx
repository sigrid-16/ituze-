"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarHeart,
  ClipboardList,
  Feather,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Languages,
  Lock,
  MapPin,
  NotebookPen,
  Palette,
  Sprout,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { Logo } from "@/components/brand/logo";
import { CrisisButton } from "@/components/safety/crisis";
import { LanguageSwitcher, ThemeToggle } from "@/components/shell/settings-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOURNEY_PHASES, JOURNEY_WEEKS } from "@/data/journey";
import { createSeed } from "@/data/seed";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PSYCHOLOGISTS = createSeed().psychologists.filter((p) => p.verificationStatus === "verified").slice(0, 4);
const PHASE_TONES = [
  "bg-primary-soft text-primary",
  "bg-accent-soft text-accent-strong",
  "bg-primary-soft text-primary",
  "bg-accent-soft text-accent-strong",
];

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-dvh overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" aria-label="Ituze">
            <Logo />
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm font-semibold text-muted lg:flex" aria-label="Sections">
            <a href="#how" className="hover:text-primary">{t("landing.navHow")}</a>
            <a href="#journey" className="hover:text-primary">{t("landing.navJourney")}</a>
            <a href="#cohorts" className="hover:text-primary">{t("landing.navCohorts")}</a>
            <a href="#psychologists" className="hover:text-primary">{t("landing.navPsychologists")}</a>
            <a href="#alumni" className="hover:text-primary">{t("landing.navAlumni")}</a>
          </nav>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
              <Link href="/demo">{t("common.tryDemo")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <ImigongoPattern variant="diamond" className="absolute inset-x-0 top-0 h-full w-full text-primary opacity-[0.045]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24">
          <div className="animate-rise">
            <Badge variant="accent" className="mb-5">
              <Sprout /> {t("landing.heroEyebrow")}
            </Badge>
            <h1 className="text-balance text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              {t("landing.heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted">{t("landing.heroBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/demo">
                  {t("common.tryDemo")} <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#journey">{t("landing.heroSecondary")}</a>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted">{t("landing.heroNote")}</p>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Pillars */}
      <section id="how" className="scroll-mt-20 border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <SectionTitle title={t("landing.pillarsTitle")} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { icon: NotebookPen, title: "landing.pillarJournalTitle", body: "landing.pillarJournalBody" },
              { icon: HeartHandshake, title: "landing.pillarSupportTitle", body: "landing.pillarSupportBody" },
              { icon: UsersRound, title: "landing.pillarCohortTitle", body: "landing.pillarCohortBody" },
            ].map((p, i) => (
              <div key={p.title} className="rounded-3xl border border-border bg-background p-6">
                <span
                  className={cn(
                    "inline-flex size-12 items-center justify-center rounded-2xl",
                    i === 1 ? "bg-accent-soft text-accent-strong" : "bg-primary-soft text-primary",
                  )}
                >
                  <p.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{t(p.title)}</h3>
                <p className="mt-2 leading-relaxed text-muted">{t(p.body)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey */}
      <section id="journey" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
          <SectionTitle title={t("landing.journeyTitle")} body={t("landing.journeyBody")} />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_PHASES.map((ph, i) => (
              <li key={ph.phase} className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6">
                <ImigongoPattern className={cn("absolute inset-x-0 top-0 h-2.5 w-full opacity-50", i % 2 ? "text-accent" : "text-primary")} />
                <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold", PHASE_TONES[i])}>
                  {t("landing.phaseLabel", { n: ph.phase })}
                </span>
                <h3 className="mt-3 text-lg font-bold">{t(ph.titleKey)}</h3>
                <ul className="mt-4 space-y-3">
                  {ph.weeks.map((w) => {
                    const wk = JOURNEY_WEEKS[w - 1];
                    return (
                      <li key={w} className="flex gap-3 text-sm">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-background text-xs font-bold text-primary">
                          {w}
                        </span>
                        <span className="pt-1 leading-snug">{t(wk.themeKey)}</span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Cohorts */}
      <section id="cohorts" className="scroll-mt-20 bg-primary text-primary-foreground">
        <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-16 sm:px-6 lg:py-24">
          <ImigongoPattern className="absolute -right-10 top-0 h-full w-1/2 opacity-[0.08]" variant="diamond" />
          <div className="relative">
            <h2 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">{t("landing.cohortsTitle")}</h2>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              {["landing.factWeeks", "landing.factPeople", "landing.factFacilitator", "landing.factInPerson"].map((k) => (
                <span key={k} className="rounded-full bg-primary-foreground/12 px-3 py-1.5 ring-1 ring-primary-foreground/25">
                  {t(k)}
                </span>
              ))}
            </div>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: ClipboardList, k: 1 },
                { icon: UsersRound, k: 2 },
                { icon: CalendarHeart, k: 3 },
                { icon: GraduationCap, k: 4 },
              ].map(({ icon: Icon, k }) => (
                <li key={k} className="rounded-3xl bg-primary-foreground/[0.08] p-6 ring-1 ring-primary-foreground/15">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary-foreground text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-sm font-bold opacity-80">0{k}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold">{t(`landing.cohortStep${k}Title`)}</h3>
                  <p className="mt-2 leading-relaxed opacity-85">{t(`landing.cohortStep${k}Body`)}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Psychologists */}
      <section id="psychologists" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:py-24">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("landing.psychTitle")}</h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">{t("landing.psychBody")}</p>
            <ul className="mt-6 space-y-3 font-semibold">
              <li className="flex items-center gap-3"><BadgeCheck className="size-5 text-primary" /> {t("landing.psychPoint1")}</li>
              <li className="flex items-center gap-3"><Languages className="size-5 text-primary" /> {t("landing.psychPoint2")}</li>
              <li className="flex items-center gap-3"><Lock className="size-5 text-primary" /> {t("landing.psychPoint3")}</li>
            </ul>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PSYCHOLOGISTS.map((p) => (
              <div key={p.id} className="rounded-3xl border border-border bg-surface p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} color={p.photoColor} className="size-12" />
                  <div className="min-w-0">
                    <p className="truncate font-bold">{p.name}</p>
                    <Badge className="mt-0.5">
                      <BadgeCheck /> {t("landing.psychBadge")}
                    </Badge>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{p.specialties.slice(0, 2).join(" · ")}</p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="size-3.5" /> {p.location}
                </p>
                <p className="mt-1 text-xs font-bold tracking-wider text-primary">{p.languages.map((l) => l.toUpperCase()).join(" · ")}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni + principles */}
      <section id="alumni" className="scroll-mt-20 border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="relative overflow-hidden rounded-3xl bg-accent-soft p-8">
            <ImigongoPattern className="absolute inset-x-0 bottom-0 h-8 w-full text-accent opacity-40" />
            <HandHeart className="size-10 text-accent-strong" />
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight">{t("landing.alumniTitle")}</h2>
            <p className="mt-4 text-lg leading-relaxed">{t("landing.alumniBody")}</p>
            <div className="mb-6 mt-6 flex flex-wrap gap-2">
              {[
                { icon: UsersRound, k: "landing.alumniGatherings" },
                { icon: Palette, k: "landing.alumniCreative" },
                { icon: HandHeart, k: "landing.alumniVolunteer" },
                { icon: Sprout, k: "landing.alumniPrograms" },
              ].map(({ icon: Icon, k }) => (
                <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold">
                  <Icon className="size-4 text-accent-strong" /> {t(k)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{t("landing.principlesTitle")}</h2>
            <ul className="mt-6 space-y-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <li key={n} className="flex items-start gap-4 rounded-2xl border border-border bg-background p-4">
                  <Feather className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="font-semibold">{t(`landing.principle${n}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-primary-soft px-6 py-12 text-center sm:px-12">
          <ImigongoPattern variant="diamond" className="absolute inset-0 h-full w-full text-primary opacity-[0.06]" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">{t("landing.ctaTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-lg">{t("landing.ctaBody")}</p>
            <Button asChild size="lg" className="mt-7">
              <Link href="/demo">
                {t("common.tryDemo")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:px-6">
          <Logo compact />
          <p className="text-center sm:text-left">{t("landing.footer")}</p>
          <CrisisButton className="sm:ml-auto" />
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ title, body }: { title: string; body?: string }) {
  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 text-lg leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

/** Stylised preview of the member app, built from real UI pieces. */
function HeroPreview() {
  const { t } = useI18n();
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary-soft/60 blur-2xl" />
      <div className="space-y-4">
        <div className="animate-rise rounded-3xl border border-border bg-surface p-5 shadow-lg [animation-delay:80ms]">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("home.promptTitle")}</p>
          <p className="mt-2 text-lg font-bold">{t("prompts.p2")}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
            <Lock className="size-3.5" /> {t("common.private")}
          </div>
        </div>
        <div className="animate-rise ml-6 rounded-3xl border border-border bg-surface p-5 shadow-lg sm:ml-12 [animation-delay:160ms]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("common.week", { n: 6 })} · {t("journey.phase2")}</p>
            <Badge variant="accent">6 / 12</Badge>
          </div>
          <p className="mt-2 font-bold">{t("journey.w6")}</p>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: 12 }, (_, i) => (
              <span key={i} className={cn("h-2 flex-1 rounded-full", i < 5 ? "bg-primary" : i === 5 ? "bg-accent" : "bg-border")} />
            ))}
          </div>
        </div>
        <div className="animate-rise flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 shadow-lg [animation-delay:240ms]">
          <Avatar name="Emmanuel Nkurunziza" color="#4E7A6C" className="size-11" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">Dr. Emmanuel Nkurunziza</p>
            <p className="text-xs text-muted">Video · 15:00</p>
          </div>
          <Badge>
            <BadgeCheck /> {t("landing.psychBadge")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
