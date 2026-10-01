"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ImigongoPattern } from "@/components/brand/imigongo";
import { CrisisButton } from "@/components/safety/crisis";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROLE_HOME, switchRole, useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { useHydrated } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { isActive, navFor, rolesForPath } from "./nav";
import { RoleSwitcher } from "./role-switcher";
import { LanguageSwitcher, ThemeToggle } from "./settings-controls";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { role } = useCurrentUser();
  const hydrated = useHydrated();
  const { t } = useI18n();
  const nav = navFor(role);
  const allowed = rolesForPath(pathname);
  const blocked = hydrated && allowed !== null && !allowed.includes(role);

  return (
    <div className="min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-border bg-surface lg:flex">
        <div className="px-6 pb-4 pt-6">
          <Link href="/" aria-label="Ituze">
            <Logo />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {nav.map((item) => {
            const active = isActive(item, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-2xl px-4 font-semibold transition-colors",
                  active ? "bg-primary-soft text-primary" : "text-muted hover:bg-primary-soft/50 hover:text-text",
                )}
              >
                <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="relative space-y-3 p-4">
          <CrisisButton className="w-full justify-center" />
          <RoleSwitcher variant="card" />
        </div>
        <ImigongoPattern className="h-10 w-full text-primary opacity-[0.07]" />
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md lg:ml-64">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-2 px-4 sm:px-6">
          <Link href="/" className="lg:hidden" aria-label="Ituze">
            <Logo compact />
          </Link>
          <span className="hidden rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-bold text-accent-strong sm:inline lg:ml-0">
            {t("common.demo")}
          </span>
          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <CrisisButton compact className="lg:hidden" />
            <LanguageSwitcher />
            <ThemeToggle />
            <RoleSwitcher className="lg:hidden" />
          </div>
        </div>
      </header>

      <main className="lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12 lg:pt-8">
          {!hydrated ? <ShellSkeleton /> : blocked ? <WrongRole allowedRole={allowed![0]} /> : children}
        </div>
      </main>

      {/* Mobile bottom tabs */}
      <nav
        className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden"
        aria-label="Main"
      >
        <ul className="mx-auto flex max-w-lg">
          {nav.map((item) => {
            const active = isActive(item, pathname);
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition-colors",
                    active ? "text-primary" : "text-muted",
                  )}
                >
                  <span className={cn("flex h-7 w-12 items-center justify-center rounded-full transition-colors", active && "bg-primary-soft")}>
                    <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
                  </span>
                  {t(item.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
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

function WrongRole({ allowedRole }: { allowedRole: "anonymous" | "identified" | "psychologist" | "admin" }) {
  const { t } = useI18n();
  const router = useRouter();
  const { role } = useCurrentUser();
  return (
    <Card className="mx-auto mt-10 max-w-md text-center">
      <Lock className="mx-auto size-8 text-primary" />
      <p className="mt-3 font-bold">
        {t("roles.viewingAs")}: {t(`roles.${role}`)}
      </p>
      <p className="mt-1 text-sm text-muted">{t("roles.notForRole", { role: t(`roles.${allowedRole}`) })}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button
          onClick={() => {
            switchRole(allowedRole);
          }}
        >
          {t("roles.switchTo", { role: t(`roles.${allowedRole}`) })}
        </Button>
        <Button variant="outline" onClick={() => router.push(ROLE_HOME[role])}>
          {t("common.back")}
        </Button>
      </div>
    </Card>
  );
}
