"use client";

import { useEffect, useRef } from "react";

const SEEN_KEY = "ituze-welcomed";
const WORD_STEP_MS = 300; // matches the CSS stagger in globals.css
const WORD_FADE_MS = 800;
const FIRST_WORD_MS = 150;
const PAUSE_MS = 1200;
const MOVE_MS = 1100;
const REVEAL_MS = 2100; // last support card finishes fading in

declare global {
  interface Window {
    __ituzeWelcomeAt?: number;
  }
}

function seen() {
  try {
    return !!sessionStorage.getItem(SEEN_KEY);
  } catch {
    return true;
  }
}
function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

/**
 * First-visit welcome: the sentence appears word by word, rests, then glides
 * up into the hero headline (`targetId`) while the rest of the page fades in.
 *
 * Phases live on <html data-welcome>, set before first paint by the boot
 * script in components/providers.tsx: "words" → "move" → "reveal" → removed.
 * Any click, tap, scroll or key press skips to the finished page. Reduced
 * motion and later visits in the same session show the page immediately.
 *
 * The overlay is decorative (aria-hidden); the real headline is always in the
 * page for search engines and screen readers.
 */
export function WelcomeOverlay({ text, targetId }: { text: string; targetId: string }) {
  const sentenceRef = useRef<HTMLParagraphElement>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  useEffect(() => {
    const root = document.documentElement;
    let start = window.__ituzeWelcomeAt ?? 0;
    if (!root.dataset.welcome) {
      // Arrived by client-side navigation: still play on the first visit of the session
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce || seen()) return;
      root.dataset.welcome = "words";
      start = performance.now();
    }
    markSeen();

    const timers: number[] = [];
    const events = ["pointerdown", "keydown", "wheel", "touchmove", "scroll"] as const;
    const finish = () => {
      timers.forEach(clearTimeout);
      events.forEach((e) => window.removeEventListener(e, finish));
      delete root.dataset.welcome;
      if (sentenceRef.current) sentenceRef.current.style.transform = "";
    };
    events.forEach((e) => window.addEventListener(e, finish, { passive: true }));

    const reveal = () => {
      root.dataset.welcome = "reveal";
      timers.push(window.setTimeout(finish, REVEAL_MS));
    };
    const move = () => {
      const sentence = sentenceRef.current;
      const target = document.getElementById(targetId);
      if (!sentence || !target) return finish();
      const from = sentence.getBoundingClientRect();
      const to = target.getBoundingClientRect();
      sentence.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px)`;
      root.dataset.welcome = "move";
      timers.push(window.setTimeout(reveal, MOVE_MS));
    };

    const wordsDone = FIRST_WORD_MS + (wordCount - 1) * WORD_STEP_MS + WORD_FADE_MS;
    timers.push(window.setTimeout(move, Math.max(0, wordsDone + PAUSE_MS - (performance.now() - start))));
    return finish;
  }, [targetId, wordCount]);

  return (
    <div className="welcome-overlay fixed inset-0 z-50 items-center justify-center px-4 sm:px-6" aria-hidden>
      <div className="mx-auto w-full max-w-6xl">
        <p ref={sentenceRef} className="welcome-sentence welcome-heading mx-auto">
          {words.map((w, i) => {
            const italic = w.startsWith("*");
            const clean = w.replaceAll("*", "");
            return (
              <span key={i}>
                <span className="welcome-word" style={{ "--i": i } as React.CSSProperties}>
                  {italic ? <em>{clean.replace(/[.,!?]$/, "")}</em> : clean}
                  {italic && /[.,!?]$/.test(clean) ? clean.slice(-1) : null}
                </span>
                {i < words.length - 1 ? " " : null}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
}
