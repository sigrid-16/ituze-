"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, EyeOff, HeartHandshake, Lock, Map, RotateCcw, ShieldCheck, Target, UserRound, UsersRound } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { PageHeader } from "@/components/common/page-header";
import { toast } from "@/components/common/toaster";
import { LanguageSegmented, ThemeSegmented } from "@/components/shell/settings-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { data, resetDemoData } from "@/lib/data";
import { displayName, isMemberRole, useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";

export default function MePage() {
  const { t } = useI18n();
  const { user, role, userId } = useCurrentUser();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [realName, setRealName] = useState("");
  const member = isMemberRole(role);

  return (
    <>
      <PageHeader title={t("me.title")} />

      {/* Profile */}
      <Card className="relative overflow-hidden">
        <ImigongoPattern className="absolute inset-x-0 top-0 h-2.5 w-full text-accent opacity-50" />
        <div className="flex items-center gap-4 pt-2">
          {user && <Avatar name={displayName(user)} color={user.avatarColor} className="size-16 text-xl" />}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-extrabold">{displayName(user)}</p>
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
          <div className="mt-5 rounded-2xl bg-background p-4">
            <p className="font-bold">{t("me.upgradeTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{t("me.upgradeBody")}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setUpgradeOpen(true)}>
              <UserRound /> {t("me.upgradeButton")}
            </Button>
          </div>
        )}
      </Card>

      {member && (
        <section className="mt-6">
          <CardEyebrow className="mb-3 px-1">{t("me.shortcuts")}</CardEyebrow>
          <div className="grid gap-3 sm:grid-cols-2">
            <ShortcutLink href="/app/me/goals" icon={Target} label={t("nav.goals")} />
            <ShortcutLink href="/app/me/journey" icon={Map} label={t("nav.journey")} />
          </div>
        </section>
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
              { icon: Lock, k: "onboarding.consentJournal" },
              { icon: UsersRound, k: "onboarding.consentCohort" },
              { icon: HeartHandshake, k: "onboarding.consentPsych" },
              { icon: ShieldCheck, k: "onboarding.consentAdmin" },
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
            toast(t("demo.resetDone"));
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
            <Label htmlFor="upgrade-name">{t("onboarding.realName")}</Label>
            <Input id="upgrade-name" value={realName} onChange={(e) => setRealName(e.target.value)} autoComplete="name" placeholder={t("onboarding.realNamePlaceholder")} />
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
