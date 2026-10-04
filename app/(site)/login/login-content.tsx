"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { withItalics } from "@/components/common/serif";
import { Button } from "@/components/ui/button";
import { ACCESS_HOME, auth, type AccessType } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const DOORS: { access: AccessType; emoji: string; tone: string; title: string; body: string; button: string }[] = [
  { access: "user", emoji: "👤", tone: "bg-blush", title: "login.userTitle", body: "login.userBody", button: "login.userButton" },
  { access: "therapist", emoji: "🧠", tone: "bg-sage", title: "login.therapistTitle", body: "login.therapistBody", button: "login.therapistButton" },
  { access: "organizer", emoji: "🛠", tone: "bg-blush", title: "login.organizerTitle", body: "login.organizerBody", button: "login.organizerButton" },
];

export function LoginContent() {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<AccessType | null>(null);

  async function signIn(access: AccessType) {
    setBusy(access);
    const session = await auth.signIn(access);
    router.push(ACCESS_HOME[session.access]);
  }

  return (
    <div className="relative">
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-14 sm:px-6 md:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="animate-rise font-serif text-5xl leading-[1.05] sm:text-6xl">{withItalics(t("login.title"))}</h1>
          <p className="animate-rise mx-auto mt-5 max-w-xl text-lg italic leading-relaxed text-muted [animation-delay:80ms]">
            {t("login.subtitle")}
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {DOORS.map((d, i) => (
            <li key={d.access} className="animate-rise flex flex-col" style={{ animationDelay: `${160 + i * 120}ms` }}>
              <div className={cn("arch lift flex flex-1 flex-col items-center px-6 pb-8 pt-14 text-center", d.tone)}>
                <span className="flex size-16 items-center justify-center rounded-full bg-surface text-3xl shadow-sm" aria-hidden>
                  {d.emoji}
                </span>
                <h2 className="mt-5 font-serif text-3xl">{t(d.title)}</h2>
                <p className="mt-2 flex-1 leading-relaxed text-muted">{t(d.body)}</p>
                <Button className="lift mt-6 w-full max-w-60" onClick={() => signIn(d.access)} disabled={busy !== null}>
                  {t(d.button)} <ArrowRight />
                </Button>
              </div>
              {d.access === "therapist" && (
                <p className="mt-3 px-4 text-center text-sm italic text-muted">
                  {t("login.therapistNote")}{" "}
                  <a href="mailto:hello@ituze.example" className="font-semibold not-italic text-primary underline-offset-4 hover:underline">
                    {t("login.contactUs")}
                  </a>
                </p>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center text-sm text-muted">
          <p>{t("login.demoNote")}</p>
          <p className="mt-3">
            {t("login.noAccount")}{" "}
            <Link href="/signup" className="font-bold text-primary underline-offset-4 hover:underline">
              {t("login.createAccount")}
            </Link>
          </p>
        </div>
      </section>

      <DemoLabel />
    </div>
  );
}

/** Small "Demo version" label pinned to the corner. */
export function DemoLabel() {
  const { t } = useI18n();
  return (
    <span className="fixed bottom-4 left-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-surface/95 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent-strong shadow-sm backdrop-blur">
      <Sparkles className="size-3.5" /> {t("common.demoVersion")}
    </span>
  );
}
