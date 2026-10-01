# Ituze: demo web app

**From isolation to connection, growth, and contribution.**

Ituze is a community-centered mental wellness platform for Rwanda. It combines a private journal, verified psychologists and a 12-week healing journey in small in-person cohorts. This repository holds the **responsive demo web app** that partners, funders and psychologists will see before the mobile app is built.

Everything runs in the browser with sample data, so it needs no backend, accounts or environment variables.

## Run it locally

Requirements: Node.js 20.9+ (22 LTS recommended).

```bash
npm install
npm run dev          # http://localhost:3000
```

Production build:

```bash
npm run build && npm start
```

Deploy to Vercel with one command: `npx vercel` (or import the repo in the Vercel dashboard; no configuration needed).

## What's in the demo (build steps 1–2)

| Area | Route | Notes |
|---|---|---|
| Landing page | `/` | Vision, 12-week journey (4 phases), how cohorts work, psychologist network, alumni, principles |
| Demo role picker | `/demo` | Anonymous member · Identified member · Psychologist · Admin |
| Onboarding | `/onboarding` | Intro, language, anonymous/identified, optional 1–3 goals, consent ("who can see what") |
| Home | `/app` | Greeting, today's reflection prompt, gentle goal check-in, next appointment / cohort session, latest cohort announcement or waiting-list status |
| Journal | `/app/journal`, `/app/journal/new` | Text, **voice recording** (MediaRecorder), **image upload** (resized in-browser), optional rotating prompts, optional mood tag, private-by-default note, search & filters |
| Wellness goals | `/app/me/goals` | Preset or custom goals, gentle rhythm (×/week), optional reminder time, Yes / A little / Not today check-ins, weekly dots, no streak-shaming |
| Me | `/app/me` | Profile, **opt-in** upgrade from anonymous to identified, language, theme, privacy & consent, reset demo |

Placeholders show where the next build steps go: Support, Cohort, My Journey, the psychologist dashboard and the admin dashboard.

**App shell:** a left sidebar on desktop and bottom tabs on phones. Language switch (Kinyarwanda / English / French), light/dark/system theme, a role switcher, and a **"Need help now?"** button on every screen.

**Safety:** crisis contacts live in [`config/crisis-contacts.json`](config/crisis-contacts.json) and are not hardcoded. Journal text is checked on-device for crisis language (EN/FR/RW). When it matches, a gentle card offers support contacts and a psychologist booking. Writing is never blocked.

> ⚠️ Verify every crisis number with local authorities before any real-world use. The Kinyarwanda and French translations are drafts and need review by native speakers.

## Project structure

```
app/                 Next.js App Router pages (landing, demo, onboarding, /app/*)
components/
  ui/                shadcn-style primitives (Button, Card, Dialog, DropdownMenu…, built on Radix)
  shell/             App shell, nav config, role switcher, language/theme controls
  brand/             Logo, imigongo-inspired patterns, avatar
  journal/ goals/    Feature components
  safety/            "Need help now?" dialog + crisis card
config/              Admin-editable config (crisis contacts)
data/                Mock seed data (Rwandan context), journey weeks, reflection prompts
lib/
  data/              Data-access layer: types, DataSource interface, mock (localStorage) implementation, useQuery
  i18n/              en (source), rw, fr dictionaries + useI18n()
  settings.ts        Per-browser settings (language, theme, demo role)
  safety.ts          Crisis contacts + crisis-language detection
```

## Swapping in a real backend (Supabase)

UI code only talks to the `DataSource` interface (`lib/data/source.ts`) through `data` and `useQuery` from `lib/data`.

1. Implement `DataSource` in `lib/data/supabase-source.ts`.
2. Export it as `data` in `lib/data/index.ts`, and point `subscribeToDataChanges` at Supabase realtime.
3. Enforce privacy with Row Level Security:
   - `journal_entries`: readable only by their owner (`auth.uid() = user_id`); store content encrypted.
   - `cohort_messages`: readable only by the cohort's members and facilitator.
   - Admin analytics: available only through aggregated views, never row-level journal access.

Demo data is stored in `localStorage` (`ituze-demo-db`). It reseeds automatically after 7 days so dates stay current, and you can reset it at any time from the role switcher or the Me page.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (brand palette as CSS variables / theme tokens, full dark mode) · Radix primitives in shadcn/ui style · lucide icons · Nunito (self-hosted via Fontsource).
