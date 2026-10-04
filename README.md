# Ituze: demo web app

**You don't have to carry everything alone.**

Ituze is a calm mental wellness platform for Rwanda. It brings together a private journal and helpful resources, small and safe community groups, and private sessions with verified psychologists. This repository holds the **responsive demo web app**.

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

## What's in the demo

**Public pages** (main navigation): Home `/`, About `/about`, Testimonials `/testimonials`, Sign Up `/signup`, Log In `/login`.

| Area | Route | Notes |
|---|---|---|
| Home | `/` | Welcome animation on the first visit of a session ("You don't have to carry everything alone.", word by word, then it settles into the hero). Click, tap, scroll or any key skips it; reduced motion shows the page straight away. Then: hero, three arch-shaped support cards with photos (Get Advice, Join Community, Professional Support), "How Ituze works", a slow testimonial carousel and a closing call to action |
| Log In | `/login` | Three access cards (User, Therapist, Organizer). **Demo mode:** no passwords, each button signs into a sample account. This is the only way to reach the dashboards |
| Sign Up | `/signup` | Users only. Nickname or real name, then "What brings you to Ituze?" (multi-select), then who-can-see-what |
| User dashboard | `/app` | Greeting by time of day, daily "How are you, really?" check-in with a gentle reply, then Journal, Community, Professional support, Resources, Upcoming events, Personal insights and Wellness goals, ordered by the sign-up answers |
| User pages | `/app/journal`, `/app/community`, `/app/support`, `/app/resources`, `/app/me`, `/app/me/goals` | Journal (text, voice, images; share a single entry with your psychologist), groups and events, psychologist booking requests, articles and exercises, settings (switch between nickname and real name both ways) |
| Therapist dashboard | `/app/psychologist`, `/schedule`, `/profile` | Session requests (anonymous clients by nickname only), upcoming sessions, reminders, private session notes, journal entries a client chose to share, availability, profile editor |
| Organizer dashboard | `/app/admin`, `/community`, `/content`, `/testimonials`, `/therapists` | Counts-only overview, groups, members, activities and announcements, homepage copy, articles and resources, testimonials (add, edit, approve, pin, remove), therapist accounts and verification, bookings |

The three testimonials are **sample stories** (tagged on the site) and can be replaced from the organizer dashboard.

**Design:** cream and blush backgrounds, sage sections, deep green buttons and warm tan accents; Cormorant Garamond headings with one word in italics; arch-shaped cards, pill buttons and botanical line icons. Sections fade and slide up gently as you scroll; all motion is turned off when the device asks for reduced motion.

**Safety:** a **"Need help now?"** button on every screen. Crisis contacts live in [`config/crisis-contacts.json`](config/crisis-contacts.json) and are not hardcoded. Journal text is checked on-device for crisis language (EN/FR/RW). When it matches, a gentle card offers support contacts and a psychologist booking. Writing is never blocked.

> ⚠️ Verify every crisis number with local authorities before any real-world use. The Kinyarwanda and French translations are drafts and need review by native speakers. The therapist and organizer dashboards are in English for now (other languages fall back to English).

## Authentication

`lib/auth.ts` is the only place that signs people in and out. Today it's a demo adapter. To add real authentication, implement `AuthAdapter` (e.g. with Supabase Auth) and export it as `auth`; pages only use `auth.signIn`, `auth.signUpUser`, `auth.signOut` and `useSession`.

## Project structure

```
app/(site)/          Public pages: home, about, testimonials, login, signup
app/app/             Dashboards (user, /psychologist, /admin)
components/
  ui/                shadcn-style primitives (Button, Card, Dialog, DropdownMenu…, built on Radix)
  site/ home/        Public header/footer, welcome animation, support cards, testimonials
  shell/             App shell, nav config, account menu, language/theme controls
  dashboard/ organizer/  Dashboard sections and organizer screens
  brand/             Logo, botanical line icons, avatar
  journal/ goals/    Feature components
  safety/            "Need help now?" dialog + crisis card
config/              Admin-editable config (crisis contacts)
data/                Mock seed data (Rwandan context), reflection prompts
public/images/       Support card photos
lib/
  data/              Data-access layer: types, DataSource interface, mock (localStorage) implementation, useQuery
  i18n/              en (source), rw, fr dictionaries + useI18n()
  auth.ts            Sign in / sign up / sign out (demo adapter)
  settings.ts        Per-browser settings (language, theme, signed-in demo account)
  safety.ts          Crisis contacts + crisis-language detection
```

## Swapping in a real backend (Supabase)

UI code only talks to the `DataSource` interface (`lib/data/source.ts`) through `data` and `useQuery` from `lib/data`.

1. Implement `DataSource` in `lib/data/supabase-source.ts`.
2. Export it as `data` in `lib/data/index.ts`, and point `subscribeToDataChanges` at Supabase realtime.
3. Enforce privacy with Row Level Security:
   - `journal_entries`: readable only by their owner (`auth.uid() = user_id`); store content encrypted.
   - `group_messages`: readable only by the group's members and facilitator.
   - `session_notes`: readable only by the therapist who wrote them.
   - Admin analytics: available only through aggregated views, never row-level journal access.

Demo data is stored in `localStorage` (`ituze-demo-db`). It reseeds automatically after 7 days so dates stay current, and you can reset it at any time from the account menu or the Settings page.

## Tech

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 (brand palette as CSS variables / theme tokens, full dark mode) · Radix primitives in shadcn/ui style · lucide icons · Cormorant Garamond + Nunito (self-hosted via Fontsource).
