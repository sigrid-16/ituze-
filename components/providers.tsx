"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/common/toaster";
import { CrisisProvider } from "@/components/safety/crisis";
import { useSettings } from "@/lib/settings";

/** Keeps <html> class + lang in sync with the viewer's settings. */
function DocumentSync() {
  const { theme, locale } = useSettings();
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    root.lang = locale;
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme, locale]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CrisisProvider>
      <DocumentSync />
      {children}
      <Toaster />
    </CrisisProvider>
  );
}

/**
 * Inline script that runs before first paint:
 * - applies the theme (avoids a flash)
 * - opts into scroll reveals, unless the viewer prefers reduced motion
 * - starts the homepage welcome sequence on the first visit of the session
 *   (components/home/welcome.tsx), with a safety timeout so content can
 *   never stay hidden if scripts fail.
 */
export const themeBootScript = `(function(){var h=document.documentElement;try{var s=JSON.parse(localStorage.getItem('ituze-settings')||'{}');var t=s.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)h.classList.add('dark');if(s.locale)h.lang=s.locale;}catch(e){}try{var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!rm)h.classList.add('can-reveal');var seen=false;try{seen=!!sessionStorage.getItem('ituze-welcomed');}catch(e){}if(!rm&&!seen&&location.pathname==='/'){h.setAttribute('data-welcome','words');window.__ituzeWelcomeAt=performance.now();setTimeout(function(){h.removeAttribute('data-welcome');},12000);}}catch(e){}})();`;
