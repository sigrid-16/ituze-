"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CrisisButton } from "@/components/safety/crisis";
import { useI18n } from "@/lib/i18n";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="welcome-hide border-t border-border bg-background" style={{ "--welcome-delay": "1400ms" } as React.CSSProperties}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-10 text-sm text-muted sm:px-6 md:flex-row md:items-start">
        <div className="text-center md:text-left">
          <Logo />
          <p className="mt-3 max-w-sm">{t("site.footer")}</p>
          <p className="mt-1 text-xs">{t("site.footerDemo")}</p>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-semibold md:ml-auto" aria-label="Footer">
          <Link href="/" className="hover:text-primary">{t("nav.home")}</Link>
          <Link href="/about" className="hover:text-primary">{t("nav.about")}</Link>
          <Link href="/testimonials" className="hover:text-primary">{t("nav.testimonials")}</Link>
          <Link href="/signup" className="hover:text-primary">{t("nav.signUp")}</Link>
          <Link href="/login" className="hover:text-primary">{t("nav.logIn")}</Link>
        </nav>
        <CrisisButton />
      </div>
    </footer>
  );
}
