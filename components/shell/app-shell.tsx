"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Sparkles } from "lucide-react";
import { Botanical } from "@/components/brand/botanical";
import { Logo } from "@/components/brand/logo";
import { CrisisButton } from "@/components/safety/crisis";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { accessOf, useSession } from "@/lib/auth";
import type { Role } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AccountMenu } from "./account-menu";
import { isActive, navFor, rolesForPath } from "./nav";
import { LanguageSwitcher, ThemeToggle } from "./settings-controls";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { session, ready } = useSession();
  const { t } = useI18n();
  const role = session?.role ?? "identified";
  const nav = navFor(role);
  const allowed = rolesForPath(pathname);
  const blocked = session && allowed !== null && !allowed.includes(session.role);

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-border bg-blush/60 lg:flex">
        <div className="px-6 pb-6 pt-6">
          <Link href="/" aria-label="Ituze">
            <Logo />
          </Link>
        </div>
        {session && (
          <nav className="flex-1 space-y-1 px-3" aria-label="Main">
            {nav.map((item) => {
              const active = isActive(item, pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-full px-4 font-semibold transition-colors duration-300",
                    active ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface hover:text-text",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        )}
        <div className="relative mt-auto space-y-3 p-4">
          <Botanical variant="sprig" className="absolute -top-16 right-2 size-24 text-primary/10" />
          <CrisisButton className="w-full justify-center" />
          {session && <AccountMenu variant="card" />}
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md lg:ml-64">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="lg:hidden" aria-label="Ituze">
            <Logo compact />
          </Link>
          <span className="hidden items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent-strong sm:inline-flex">
            <Sparkles className="size-3" /> {t("common.demoVersion")}
          </span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <CrisisButton compact className="lg:hidden" />
            <LanguageSwitcher />
            <ThemeToggle />
            {session && <AccountMenu className="lg:hidden" />}
          </div>
        </div>
      </header>

      <main className="lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {!ready ? <ShellSkeleton /> : !session ? <SignedOut /> : blocked ? <WrongRole allowedRole={allowed![0]} /> : children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      {session && (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden" aria-label="Main">
          <ul className="mx-auto flex max-w-lg">
            {nav
              .filter((item) => !item.desktopOnly)
              .map((item) => {
                const active = isActive(item, pathname);
                return (
                  <li key={item.href} className="flex-1">
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-16 flex-col items-center justify-center gap-1 text-[0.68rem] font-semibold transition-colors",
                        active ? "text-primary" : "text-muted",
                      )}
                    >
                      <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-300", active && "bg-primary-soft")}>
                        <item.icon className="size-5" strokeWidth={active ? 2.2 : 1.8} />
                      </span>
                      <span className="max-w-full truncate px-0.5">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </nav>
      )}
    </div>
  );
}

function ShellSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <div className="h-8 w-2/3 animate-pulse rounded-full bg-border/70" />
      <div className="h-40 animate-pulse rounded-3xl bg-border/50" />
      <div className="h-28 animate-pulse rounded-3xl bg-border/50" />
    </div>
  );
}

function SignedOut() {
  const { t } = useI18n();
  return (
    <Card className="arch mx-auto mt-10 max-w-md bg-blush px-8 pb-10 pt-14 text-center">
      <Botanical variant="leaf" className="mx-auto size-10 text-accent" />
      <p className="mt-3 font-serif text-3xl">{t("roles.signedOut")}</p>
      <p className="mt-2 text-muted">{t("roles.signedOutBody")}</p>
      <Button asChild className="lift mt-6">
        <Link href="/login">
          <LogIn /> {t("nav.logIn")}
        </Link>
      </Button>
    </Card>
  );
}

/** Dashboards are only reached by signing in with the matching access type. */
function WrongRole({ allowedRole }: { allowedRole: Role }) {
  const { t } = useI18n();
  const label = t(`roles.${allowedRole}`);
  return (
    <Card className="arch mx-auto mt-10 max-w-md bg-blush px-8 pb-10 pt-14 text-center">
      <Botanical variant="leaf" className="mx-auto size-10 text-accent" />
      <p className="mt-3 font-serif text-3xl">{t("roles.notForRole", { role: label })}</p>
      <Button asChild className="lift mt-6">
        <Link href={`/login#${accessOf(allowedRole)}`}>
          <LogIn /> {t("roles.logInAs", { role: label })}
        </Link>
      </Button>
    </Card>
  );
}
