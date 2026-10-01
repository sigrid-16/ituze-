# Ituze 🌿

**Ituze** (Kinyarwanda for *calm, peace*) is a mental wellness app. It runs as a **website** and can be **installed on a phone as an app** (it's a Progressive Web App, or PWA).

## Features

- **Daily check-in**: log how you feel in one tap, and get a gentle response
- **Mood tracker**: last-7-days chart, history with notes, and a check-in streak
- **Breathing exercises**: guided box (4·4·4·4), 4·7·8, and calm (4·6) breathing with an animated circle
- **Journal**: writing prompts, auto-saved drafts, and saved entries
- **Get help**: emergency numbers (112 / Rwanda 114), a link to find a helpline, and a 5-4-3-2-1 grounding exercise
- **Private**: all data stays on your device (localStorage). You can export or erase it at any time.
- **Works offline** once it has loaded, with light and dark mode

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish as a website (GitHub Pages)

1. Go to the repository's **Settings → Pages**.
2. Under *Build and deployment*, pick **Deploy from a branch**, then select `main` and `/ (root)`.
3. The site will be live at `https://<your-username>.github.io/ituze-/`.

## Install on your phone

Open the website on your phone, then:

- **Android (Chrome):** tap **Install app** in the header, or use menu ⋮ → *Add to Home screen*.
- **iPhone (Safari):** tap Share → *Add to Home Screen*.

The app then opens full-screen from its own icon, like a native app.

## Project structure

```
index.html            App layout (all screens)
styles.css            Styles (mobile-first, dark mode)
app.js                App logic
sw.js                 Service worker (offline support)
manifest.webmanifest  PWA manifest (name, icons, colours)
icons/                App icons
```

> Ituze is a self-care tool. It is not a substitute for professional care.
