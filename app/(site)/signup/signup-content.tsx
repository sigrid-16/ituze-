"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, EyeOff, HeartHandshake, Lock, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { withItalics } from "@/components/common/serif";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { data, type Intent } from "@/lib/data";
import { DEMO_USER_IDS } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type ShowUp = "nickname" | "real";
const INTENTS: Intent[] = ["understand", "connect", "professional", "exploring"];
const STEPS = 3;

export function SignupContent() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showUp, setShowUp] = useState<ShowUp | null>(null);
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [intents, setIntents] = useState<Intent[]>([]);
  const [saving, setSaving] = useState(false);

  const nameOk = showUp === "nickname" ? nickname.trim().length > 1 : showUp === "real" ? realName.trim().length > 2 : false;
  const canContinue = step === 0 ? nameOk : true;

  async function finish() {
    setSaving(true);
    const anonymous = showUp === "nickname";
    const userId = DEMO_USER_IDS[anonymous ? "anonymous" : "identified"];
    if (anonymous) {
      // Nickname only: no real name, no photo
      await data.users.update(userId, { nickname: nickname.trim(), realName: null, isAnonymous: true, intents, language: locale });
    } else {
      const name = realName.trim();
      await data.users.update(userId, { realName: name, nickname: name.split(" ")[0], isAnonymous: false, intents, language: locale });
    }
    await auth.signUpUser({ anonymous });
    router.push("/app");
  }

  return (
    <section className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6 md:pt-16">
      <div className="flex items-center gap-3">
        <p className="eyebrow">{t("signup.eyebrow")}</p>
        <p className="ml-auto text-sm font-semibold text-muted">{t("signup.stepOf", { n: step + 1, total: STEPS })}</p>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-primary" : "bg-border")} />
        ))}
      </div>

      <div key={step} className="animate-rise mt-10">
        {step === 0 && (
          <div>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{withItalics(t("signup.showUpTitle"))}</h1>
            <div className="mt-8 grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label={t("signup.showUpTitle").replaceAll("*", "")}>
              <Choice selected={showUp === "nickname"} onClick={() => setShowUp("nickname")} tone="bg-sage" icon={EyeOff}
                title={t("signup.nicknameTitle")} body={t("signup.nicknameBody")} />
              <Choice selected={showUp === "real"} onClick={() => setShowUp("real")} tone="bg-blush" icon={UserRound}
                title={t("signup.realNameTitle")} body={t("signup.realNameBody")} />
            </div>
            <p className="mt-4 text-center text-sm italic text-muted">{t("signup.changeAnytime")}</p>

            {showUp && (
              <div className="animate-rise mt-8">
                {showUp === "nickname" ? (
                  <>
                    <Label htmlFor="nickname">{t("signup.nickname")}</Label>
                    <Input id="nickname" autoComplete="off" value={nickname} onChange={(e) => setNickname(e.target.value)}
                      placeholder={t("signup.nicknamePlaceholder")} maxLength={24} autoFocus />
                  </>
                ) : (
                  <>
                    <Label htmlFor="realname">{t("signup.realName")}</Label>
                    <Input id="realname" autoComplete="name" value={realName} onChange={(e) => setRealName(e.target.value)}
                      placeholder={t("signup.realNamePlaceholder")} maxLength={60} autoFocus />
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{withItalics(t("signup.bringsTitle"))}</h1>
            <p className="mt-3 text-muted">{t("signup.bringsHint")}</p>
            <div className="mt-8 space-y-3">
              {INTENTS.map((k) => {
                const selected = intents.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setIntents((list) => (selected ? list.filter((x) => x !== k) : [...list, k]))}
                    className={cn(
                      "lift flex w-full cursor-pointer items-center gap-4 rounded-full border-2 px-6 py-4 text-left transition-colors duration-300",
                      selected ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-primary/40",
                    )}
                  >
                    <span className="flex-1 font-serif text-xl italic">{t(`signup.intents.${k}`)}</span>
                    <span className={cn("inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                      {selected && <Check className="size-3.5" />}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-center text-sm italic text-muted">{t("signup.noWrong")}</p>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-serif text-4xl leading-tight sm:text-5xl">{withItalics(t("signup.privacyTitle"))}</h1>
            <ul className="mt-8 space-y-3">
              {[
                { icon: Lock, k: "privacy.journal" },
                { icon: UsersRound, k: "privacy.community" },
                { icon: HeartHandshake, k: "privacy.psych" },
                { icon: ShieldCheck, k: "privacy.organizer" },
              ].map(({ icon: Icon, k }) => (
                <li key={k} className="flex gap-4 rounded-3xl bg-blush p-5">
                  <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="leading-relaxed">{t(k)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">{t("crisis.notEmergency")}</p>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center gap-3">
        {step > 0 && (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft /> {t("common.back")}
          </Button>
        )}
        <Button
          className="lift ml-auto min-w-40"
          disabled={!canContinue || saving}
          onClick={() => (step < STEPS - 1 ? setStep((s) => s + 1) : finish())}
        >
          {step === STEPS - 1 ? t("signup.finish") : t("common.continue")} <ArrowRight />
        </Button>
      </div>

      <div className="mt-12 border-t border-border pt-6 text-center text-sm text-muted">
        <p>
          {t("signup.haveAccount")}{" "}
          <Link href="/login" className="font-bold text-primary underline-offset-4 hover:underline">
            {t("nav.logIn")}
          </Link>
        </p>
        <p className="mt-2 text-xs">{t("signup.usersOnly")}</p>
      </div>
    </section>
  );
}

function Choice({
  selected,
  onClick,
  tone,
  icon: Icon,
  title,
  body,
}: {
  selected: boolean;
  onClick: () => void;
  tone: string;
  icon: typeof EyeOff;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "arch lift flex cursor-pointer flex-col items-center border-2 px-6 pb-7 pt-12 text-center transition-colors duration-300",
        tone,
        selected ? "border-primary" : "border-transparent hover:border-primary/30",
      )}
    >
      <span className={cn("flex size-12 items-center justify-center rounded-full transition-colors", selected ? "bg-primary text-primary-foreground" : "bg-surface text-primary")}>
        {selected ? <Check className="size-5" /> : <Icon className="size-5" />}
      </span>
      <span className="mt-4 font-serif text-2xl font-semibold">{title}</span>
      <span className="mt-2 text-sm italic leading-relaxed text-muted">“{body}”</span>
    </button>
  );
}
