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

/** Inline script that applies the theme before first paint (avoids a flash). */
export const themeBootScript = `(function(){try{var s=JSON.parse(localStorage.getItem('ituze-settings')||'{}');var t=s.theme||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');if(s.locale)document.documentElement.lang=s.locale;}catch(e){}})();`;
