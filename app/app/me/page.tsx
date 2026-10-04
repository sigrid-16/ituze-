"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronRight, EyeOff, HeartHandshake, Lock, RotateCcw, ShieldCheck, Target, UserRound, UsersRound } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { LanguageSegmented, ThemeSegmented } from "@/components/shell/settings-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { data, resetDemoData, type Intent } from "@/lib/data";
import { displayName, isMemberRole, useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const INTENTS: Intent[] = ["understand", "connect", "professional", "exploring"];

export default function MePage() {
  const { t } = useI18n();
  const { user, role, userId } = useCurrentUser();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [realName, setRealName] = useState("");
  const [nicknameOpen, setNicknameOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const member = isMemberRole(role);

  return (
    <>
      <PageHeader title={t("me.title")} />

      {/* Profile */}
      <Card className="relative overflow-hidden rounded-[2rem] bg-blush/60">
        <div className="flex items-center gap-4">
          {user && <Avatar name={displayName(user)} color={user.avatarColor} className="size-16 text-xl" />}
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-3xl">{displayName(user)}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {member && user && (
                <Badge variant={user.isAnonymous ? "primary" : "accent"}>
                  {user.isAnonymous ? <EyeOff /> : <UserRound />}
                  {t(user.isAnonymous ? "me.anonymousBadge" : "me.identifiedBadge")}
                </Badge>
              )}
              <Badge variant="outline">{t(`roles.${role}`)}</Badge>
            </div>
          </div>
        </div>

        {member && user?.isAnonymous && (
          <div className="mt-5 rounded-2xl bg-surface p-4">
            <p className="font-bold">{t("me.upgradeTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t("me.upgradeBody")}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setUpgradeOpen(true)}>
              <UserRound /> {t("me.upgradeButton")}
            </Button>
          </div>
        )}
        {member && user && !user.isAnonymous && (
          <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4">
            <p className="flex-1 text-sm text-muted">{t("signup.changeAnytime")}</p>
            <Button variant="ghost" size="sm" onClick={() => setNicknameOpen(true)}>
              <EyeOff /> {t("me.nicknameButton")}
            </Button>
          </div>
        )}
      </Card>

      {member && (
        <section className="mt-6">
          <CardEyebrow className="mb-3 px-1">{t("me.shortcuts")}</CardEyebrow>
          <div className="grid gap-3 sm:grid-cols-2">
            <ShortcutLink href="/app/me/goals" icon={Target} label={t("nav.goals")} />
          </div>
        </section>
      )}

      {member && user && (
        <Card className="mt-6 rounded-[2rem]">
          <CardEyebrow>{t("me.intentsTitle")}</CardEyebrow>
          <p className="mt-1 text-sm text-muted">{t("me.intentsBody")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {INTENTS.map((k) => {
              const selected = user.intents.includes(k);
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    data.users.update(userId, { intents: selected ? user.intents.filter((x) => x !== k) : [...user.intents, k] })
                  }
                  className={cn(
                    "inline-flex cursor-pointer items-center gap-1.5 rounded-full border-2 px-3.5 py-2 text-sm font-semibold transition-colors duration-300",
                    selected ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40",
                  )}
                >
                  {selected && <Check className="size-4" />} {t(`signup.intents.${k}`)}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardEyebrow className="mb-3">{t("settings.language")}</CardEyebrow>
          <LanguageSegmented />
          <CardEyebrow className="mb-3 mt-6">{t("settings.theme")}</CardEyebrow>
          <ThemeSegmented />
        </Card>

        <Card>
          <CardEyebrow className="mb-3">{t("me.privacy")}</CardEyebrow>
          <ul className="space-y-3 text-sm leading-relaxed">
            {[
              { icon: Lock, k: "privacy.journal" },
              { icon: UsersRound, k: "privacy.community" },
              { icon: HeartHandshake, k: "privacy.psych" },
              { icon: ShieldCheck, k: "privacy.organizer" },
            ].map(({ icon: Icon, k }) => (
              <li key={k} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                {t(k)}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <p className="mt-6 rounded-2xl bg-accent-soft px-4 py-3 text-sm font-semibold text-accent-strong">{t("crisis.notEmergency")}</p>

      <Button
        variant="ghost"
        className="mt-4"
        onClick={() => {
          if (window.confirm(`${t("me.resetDemo")}?`)) {
            resetDemoData();
            toast(t("me.resetDone"));
          }
        }}
      >
        <RotateCcw /> {t("me.resetDemo")}
      </Button>

      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent title={t("me.upgradeTitle")} description={t("me.upgradeBody")}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const name = realName.trim();
              if (name.length < 3) return;
              await data.users.update(userId, { realName: name, isAnonymous: false });
              setUpgradeOpen(false);
              toast(t("me.upgradeDone"));
            }}
          >
            <Label htmlFor="upgrade-name">{t("signup.realName")}</Label>
            <Input id="upgrade-name" value={realName} onChange={(e) => setRealName(e.target.value)} autoComplete="name" placeholder={t("signup.realNamePlaceholder")} />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setUpgradeOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={realName.trim().length < 3}>
                {t("me.upgradeConfirm")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={nicknameOpen} onOpenChange={setNicknameOpen}>
        <DialogContent title={t("me.nicknameTitle")} description={t("signup.nicknameBody")}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const nick = nickname.trim();
              if (nick.length < 2) return;
              await data.users.update(userId, { nickname: nick, isAnonymous: true });
              setNicknameOpen(false);
              toast(t("me.nicknameDone"));
            }}
          >
            <Label htmlFor="nickname-name">{t("signup.nickname")}</Label>
            <Input id="nickname-name" value={nickname} onChange={(e) => setNickname(e.target.value)} autoComplete="off" placeholder={t("signup.nicknamePlaceholder")} maxLength={24} />
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setNicknameOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={nickname.trim().length < 2}>
                {t("common.save")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ShortcutLink({ href, icon: Icon, label }: { href: string; icon: typeof Target; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-3xl border border-border bg-surface p-4 transition-colors hover:border-primary/50">
      <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Icon className="size-5" />
      </span>
      <span className="flex-1 font-bold">{label}</span>
      <ChevronRight className="size-5 text-muted" />
    </Link>
  );
}
