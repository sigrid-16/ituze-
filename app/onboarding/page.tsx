"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, EyeOff, HeartHandshake, Lock, NotebookPen, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { ImigongoBand } from "@/components/brand/imigongo";
import { Logo } from "@/components/brand/logo";
import { GOAL_KINDS } from "@/components/goals/goal-kinds";
import { CrisisButton } from "@/components/safety/crisis";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { data, type GoalKind } from "@/lib/data";
import { DEMO_USER_IDS, switchRole } from "@/lib/demo";
import { LOCALES, translate, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Account = "anonymous" | "identified";
const STEPS = 5;

export default function OnboardingPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState<Account>("anonymous");
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [goals, setGoals] = useState<GoalKind[]>([]);
  const [saving, setSaving] = useState(false);

  const canContinue = step !== 2 || (account === "anonymous" ? nickname.trim().length > 1 : realName.trim().length > 2);

  async function finish() {
    setSaving(true);
    const userId = DEMO_USER_IDS[account];
    if (account === "anonymous") {
      await data.users.update(userId, { nickname: nickname.trim(), language: locale });
    } else {
      const name = realName.trim();
      await data.users.update(userId, { realName: name, nickname: name.split(" ")[0], language: locale });
    }
    const existing = await data.goals.list(userId);
    for (const kind of goals) {
      if (existing.some((g) => g.kind === kind)) continue;
      const meta = GOAL_KINDS.find((g) => g.kind === kind)!;
      await data.goals.create({
        userId,
        kind,
        title: translate(locale, `goals.kinds.${kind}`),
        daysPerWeek: meta.defaultDays,
        reminder: { enabled: false, time: "20:00" },
      });
    }
    switchRole(account);
    router.push("/app");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex h-16 w-full max-w-xl items-center gap-3 px-4">
        <Link href="/demo" aria-label="Ituze">
          <Logo compact />
        </Link>
        <div className="flex flex-1 gap-1.5" aria-label={`${step + 1} / ${STEPS}`}>
          {Array.from({ length: STEPS }, (_, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-border")} />
          ))}
        </div>
        <CrisisButton compact />
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-32 pt-6">
        <div key={step} className="animate-rise">
          {step === 0 && (
            <section>
              <h1 className="text-3xl font-extrabold tracking-tight">{t("onboarding.welcomeTitle")}</h1>
              <p className="mt-3 text-lg text-muted">{t("onboarding.welcomeBody")}</p>
              <ImigongoBand className="my-6" />
              <ul className="space-y-3">
                {[
                  { icon: NotebookPen, k: "onboarding.introJournal" },
                  { icon: HeartHandshake, k: "onboarding.introSupport" },
                  { icon: UsersRound, k: "onboarding.introCohort" },
                ].map(({ icon: Icon, k }) => (
                  <li key={k} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-semibold">{t(k)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {step === 1 && (
            <section>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("onboarding.languageTitle")}</h1>
              <div className="mt-6 space-y-3" role="radiogroup">
                {LOCALES.map((l) => (
                  <ChoiceCard key={l.code} selected={locale === l.code} onClick={() => setLocale(l.code)}>
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-sm font-extrabold text-primary">
                      {l.short}
                    </span>
                    <span className="flex-1 text-lg font-bold">{l.label}</span>
                  </ChoiceCard>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("onboarding.accountTitle")}</h1>
              <p className="mt-2 text-muted">{t("onboarding.accountBody")}</p>
              <div className="mt-6 space-y-3" role="radiogroup">
                <ChoiceCard selected={account === "anonymous"} onClick={() => setAccount("anonymous")}>
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <EyeOff className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{t("onboarding.anonymousTitle")}</span>
                    <span className="block text-sm text-muted">{t("onboarding.anonymousBody")}</span>
                  </span>
                </ChoiceCard>
                <ChoiceCard selected={account === "identified"} onClick={() => setAccount("identified")}>
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-strong">
                    <UserRound className="size-5" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{t("onboarding.identifiedTitle")}</span>
                    <span className="block text-sm text-muted">{t("onboarding.identifiedBody")}</span>
                  </span>
                </ChoiceCard>
              </div>
              <div className="mt-6">
                {account === "anonymous" ? (
                  <>
                    <Label htmlFor="nickname">{t("onboarding.nickname")}</Label>
                    <Input
                      id="nickname"
                      autoComplete="off"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={t("onboarding.nicknamePlaceholder")}
                      maxLength={24}
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="realname">{t("onboarding.realName")}</Label>
                    <Input
                      id="realname"
                      autoComplete="name"
                      value={realName}
                      onChange={(e) => setRealName(e.target.value)}
                      placeholder={t("onboarding.realNamePlaceholder")}
                      maxLength={60}
                    />
                  </>
                )}
              </div>
            </section>
          )}

          {step === 3 && (
            <section>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("onboarding.goalsTitle")}</h1>
              <p className="mt-2 text-muted">{t("onboarding.goalsBody")}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {GOAL_KINDS.filter((g) => g.kind !== "custom").map(({ kind, icon: Icon }) => {
                  const selected = goals.includes(kind);
                  const disabled = !selected && goals.length >= 3;
                  return (
                    <button
                      key={kind}
                      aria-pressed={selected}
                      disabled={disabled}
                      onClick={() => setGoals((g) => (selected ? g.filter((x) => x !== kind) : [...g, kind]))}
                      className={cn(
                        "flex min-h-28 cursor-pointer flex-col items-start justify-between rounded-2xl border-2 bg-surface p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                        selected ? "border-primary bg-primary-soft" : "border-border hover:border-primary/40",
                      )}
                    >
                      <Icon className="size-6 text-primary" />
                      <span className="font-bold leading-tight">{t(`goals.kinds.${kind}`)}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {step === 4 && (
            <section>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("onboarding.consentTitle")}</h1>
              <ul className="mt-6 space-y-3">
                {[
                  { icon: Lock, k: "onboarding.consentJournal" },
                  { icon: UsersRound, k: "onboarding.consentCohort" },
                  { icon: HeartHandshake, k: "onboarding.consentPsych" },
                  { icon: ShieldCheck, k: "onboarding.consentAdmin" },
                ].map(({ icon: Icon, k }) => (
                  <li key={k} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="leading-relaxed">{t(k)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">
                {t("crisis.notEmergency")}
              </p>
            </section>
          )}
        </div>
      </main>

      <footer className="pb-safe fixed inset-x-0 bottom-0 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-4">
          {step > 0 && (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)} aria-label={t("common.back")}>
              <ArrowLeft /> <span className="hidden sm:inline">{t("common.back")}</span>
            </Button>
          )}
          {step === 3 && (
            <Button variant="ghost" onClick={() => setStep(4)}>
              {t("common.skip")}
            </Button>
          )}
          <Button
            className="ml-auto min-w-40"
            disabled={!canContinue || saving}
            onClick={() => (step < STEPS - 1 ? setStep((s) => s + 1) : finish())}
          >
            {step === STEPS - 1 ? (
              <>
                <Check /> {t("onboarding.consentAgree")}
              </>
            ) : (
              <>
                {t("common.continue")} <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function ChoiceCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center gap-4 rounded-2xl border-2 bg-surface p-4 text-left transition-colors",
        selected ? "border-primary bg-primary-soft/60" : "border-border hover:border-primary/40",
      )}
    >
      {children}
      <span
        className={cn(
          "inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-3.5" />}
      </span>
    </button>
  );
}
