"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { CrisisButton } from "@/components/safety/crisis";
import { LanguageSwitcher, ThemeToggle } from "@/components/shell/settings-controls";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Public pages only. Dashboards are reached through the Log In page, never from here. */
const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/testimonials", key: "nav.testimonials" },
] as const;

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu after navigating
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = (href: string) =>
    cn(
      "text-[0.8rem] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-primary",
      pathname === href ? "text-primary" : "text-muted",
    );

  return (
    <header className="welcome-hide sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Ituze" className="shrink-0">
          <Logo />
        </Link>

        <nav className="ml-8 hidden items-center gap-7 md:flex" aria-label={t("site.mainNav")}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={linkClass(l.href)} aria-current={pathname === l.href ? "page" : undefined}>
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <CrisisButton compact className="hidden lg:inline-flex" />
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="outline" size="sm" className="lift">
              <Link href="/signup" aria-current={pathname === "/signup" ? "page" : undefined}>
                {t("nav.signUp")}
              </Link>
            </Button>
            <Button asChild size="sm" className="lift">
              <Link href="/login" aria-current={pathname === "/login" ? "page" : undefined}>
                {t("nav.logIn")}
              </Link>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t("nav.menu")}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="animate-rise border-t border-border bg-background px-4 pb-6 pt-3 md:hidden" aria-label={t("site.mainNav")}>
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn("block rounded-2xl px-4 py-3", linkClass(l.href))}
                  aria-current={pathname === l.href ? "page" : undefined}
                >
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/signup">{t("nav.signUp")}</Link>
            </Button>
            <Button asChild>
              <Link href="/login">{t("nav.logIn")}</Link>
            </Button>
          </div>
          <CrisisButton className="mt-3 w-full justify-center" />
        </nav>
      )}
    </header>
  );
}
