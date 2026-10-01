(() => {
  "use strict";

  // ---------- Storage ----------
  const KEY = "ituze:v1";
  const load = () => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      return { moods: [], journal: [], ...data };
    } catch {
      return { moods: [], journal: [] };
    }
  };
  let state = load();
  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
  };

  // ---------- Helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const dayKey = (d) => {
    const x = new Date(d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };
  const fmtDate = (ts) =>
    new Date(ts).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const pick = (arr, not) => {
    if (arr.length < 2) return arr[0];
    let v;
    do { v = arr[Math.floor(Math.random() * arr.length)]; } while (v === not);
    return v;
  };
  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    children.forEach((c) => node.append(c));
    return node;
  };

  let toastTimer;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  };

  // ---------- Content ----------
  const MOODS = [
    { value: 1, emoji: "😢", label: "Awful" },
    { value: 2, emoji: "😕", label: "Low" },
    { value: 3, emoji: "😐", label: "Okay" },
    { value: 4, emoji: "🙂", label: "Good" },
    { value: 5, emoji: "😄", label: "Great" },
  ];
  const MOOD_MSG = {
    1: "Thank you for being honest. It's okay to not be okay — the Help tab is here if you need it. 💚",
    2: "Sorry today feels heavy. A few slow breaths might help a little.",
    3: "Okay is okay. Be gentle with yourself today.",
    4: "Glad you're doing well! What's one thing that helped?",
    5: "Wonderful! Hold on to this feeling — maybe write it down.",
  };
  const AFFIRMATIONS = [
    "You are allowed to take up space.",
    "Progress, not perfection.",
    "Your feelings are valid.",
    "One breath at a time is enough.",
    "You have survived every hard day so far.",
    "Rest is productive too.",
    "You are more than your thoughts.",
    "It's okay to ask for help.",
    "Small steps still move you forward.",
    "Be as kind to yourself as you are to others.",
    "This moment will pass.",
    "You deserve peace — ituze.",
  ];
  const PROMPTS = [
    "What are three things you're grateful for today?",
    "What's weighing on you right now?",
    "Describe a moment today when you felt calm.",
    "What would you say to a friend feeling the way you do?",
    "What is one thing you can let go of?",
    "What made you smile recently?",
    "What do you need more of this week?",
    "Write about a place where you feel safe.",
    "What's one small win from today?",
  ];

  // ---------- Navigation ----------
  const VIEWS = ["home", "mood", "breathe", "journal", "help"];
  const show = (name) => {
    if (!VIEWS.includes(name)) name = "home";
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    $$(".tab").forEach((t) => {
      const on = t.dataset.go === name;
      t.classList.toggle("active", on);
      if (on) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current");
    });
    if (name !== "breathe") stopBreathing();
    window.scrollTo({ top: 0 });
  };
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]");
    if (go) location.hash = go.dataset.go;
  });
  window.addEventListener("hashchange", () => show(location.hash.slice(1)));

  // ---------- Home ----------
  const hour = new Date().getHours();
  $("#greeting").textContent = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const setAffirmation = () => {
    const a = $("#affirmation");
    a.textContent = pick(AFFIRMATIONS, a.textContent);
  };
  $("#newAffirmation").addEventListener("click", setAffirmation);
  setAffirmation();

  const streak = () => {
    const days = new Set(state.moods.map((m) => dayKey(m.ts)));
    let count = 0;
    const d = new Date();
    if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1); // streak still alive until end of today
    while (days.has(dayKey(d))) { count++; d.setDate(d.getDate() - 1); }
    return count;
  };
  const renderStats = () => {
    $("#statStreak").textContent = streak();
    $("#statCheckins").textContent = state.moods.length;
    $("#statEntries").textContent = state.journal.length;
  };

  // ---------- Mood ----------
  let selectedMood = null;
  $$(".mood-picker").forEach((picker) => {
    MOODS.forEach((m) => {
      const b = el("button", { className: "mood-btn", type: "button" },
        el("span", { className: "emoji", textContent: m.emoji }),
        el("span", { textContent: m.label }));
      b.dataset.value = m.value;
      b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", m.label);
      picker.append(b);
    });
    picker.addEventListener("click", (e) => {
      const b = e.target.closest(".mood-btn");
      if (!b) return;
      const value = Number(b.dataset.value);
      $$(".mood-btn", picker).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      if (picker.dataset.target === "home") {
        addMood(value, "");
        $("#homeMoodMsg").textContent = MOOD_MSG[value];
        setTimeout(() => $$(".mood-btn", picker).forEach((x) => x.setAttribute("aria-pressed", "false")), 900);
      } else {
        selectedMood = value;
        $("#saveMood").disabled = false;
      }
    });
  });

  const addMood = (value, note) => {
    state.moods.unshift({ id: crypto.randomUUID?.() ?? String(Date.now()), ts: Date.now(), value, note });
    save();
    renderMoods();
    renderStats();
    toast("Check-in saved");
  };

  $("#saveMood").addEventListener("click", () => {
    if (!selectedMood) return;
    addMood(selectedMood, $("#moodNote").value.trim());
    $("#moodNote").value = "";
    selectedMood = null;
    $("#saveMood").disabled = true;
    $$('.mood-picker[data-target="mood"] .mood-btn').forEach((x) => x.setAttribute("aria-pressed", "false"));
  });

  const renderMoods = () => {
    // Chart: last 7 days average
    const chart = $("#moodChart");
    chart.replaceChildren();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const k = dayKey(d);
      const vals = state.moods.filter((m) => dayKey(m.ts) === k).map((m) => m.value);
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      const mood = avg ? MOODS[Math.round(avg) - 1] : null;
      const bar = el("div", { className: "bar" + (avg ? "" : " empty") });
      bar.style.height = avg ? `${(avg / 5) * 100}%` : "4px";
      bar.title = avg ? `${mood.label} (${avg.toFixed(1)})` : "No check-ins";
      chart.append(el("div", { className: "bar-col" },
        el("span", { className: "bar-emoji", textContent: mood ? mood.emoji : "" }),
        bar,
        el("span", { className: "bar-label", textContent: d.toLocaleDateString(undefined, { weekday: "narrow" }) })));
    }

    // History list
    const list = $("#moodList");
    list.replaceChildren();
    if (!state.moods.length) {
      list.append(el("li", { className: "empty-state", textContent: "No check-ins yet. How are you feeling?" }));
      return;
    }
    state.moods.slice(0, 50).forEach((m) => {
      const mood = MOODS[m.value - 1];
      const del = el("button", { className: "del-btn", textContent: "✕", type: "button" });
      del.setAttribute("aria-label", "Delete check-in");
      del.addEventListener("click", () => {
        state.moods = state.moods.filter((x) => x.id !== m.id);
        save(); renderMoods(); renderStats();
      });
      const body = el("div", { style: "flex:1" },
        el("strong", { textContent: mood.label }),
        el("div", { className: "muted small", textContent: fmtDate(m.ts) }));
      if (m.note) body.append(el("div", { textContent: m.note }));
      list.append(el("li", {}, el("span", { className: "emoji", textContent: mood.emoji }), body, del));
    });
  };

  // ---------- Breathing ----------
  const PATTERNS = {
    box: [["Breathe in", 4, 1.6], ["Hold", 4, 1.6], ["Breathe out", 4, 1], ["Hold", 4, 1]],
    relax: [["Breathe in", 4, 1.6], ["Hold", 7, 1.6], ["Breathe out", 8, 1]],
    calm: [["Breathe in", 4, 1.6], ["Breathe out", 6, 1]],
  };
  let pattern = "box";
  let breathing = false;
  let breathTimer = null;
  let cycles = 0;
  const circle = $("#breathCircle");

  const runPhase = (idx, remaining) => {
    const phases = PATTERNS[pattern];
    const [label, secs, scale] = phases[idx];
    if (remaining === secs) {
      $("#breathLabel").textContent = label;
      circle.style.transitionDuration = `${secs}s`;
      circle.style.transform = `scale(${scale})`;
      if (navigator.vibrate) navigator.vibrate(30);
    }
    $("#breathCount").textContent = remaining;
    breathTimer = setTimeout(() => {
      if (remaining > 1) return runPhase(idx, remaining - 1);
      const next = (idx + 1) % phases.length;
      if (next === 0) {
        cycles++;
        $("#breathCycles").textContent = `${cycles} cycle${cycles === 1 ? "" : "s"} completed`;
      }
      runPhase(next, phases[next][1]);
    }, 1000);
  };

  function stopBreathing() {
    breathing = false;
    clearTimeout(breathTimer);
    circle.style.transitionDuration = "0.6s";
    circle.style.transform = "scale(1)";
    $("#breathLabel").textContent = "Ready";
    $("#breathCount").textContent = "";
    $("#breathToggle").textContent = "Start";
  }

  $("#breathToggle").addEventListener("click", () => {
    if (breathing) {
      stopBreathing();
      return;
    }
    breathing = true;
    cycles = 0;
    $("#breathCycles").textContent = "Follow the circle.";
    $("#breathToggle").textContent = "Stop";
    runPhase(0, PATTERNS[pattern][0][1]);
  });

  $$(".seg").forEach((s) => s.addEventListener("click", () => {
    $$(".seg").forEach((x) => x.classList.toggle("active", x === s));
    pattern = s.dataset.pattern;
    if (breathing) stopBreathing();
  }));

  // ---------- Journal ----------
  const setPrompt = () => {
    const p = $("#journalPrompt");
    p.textContent = pick(PROMPTS, p.textContent);
  };
  $("#newPrompt").addEventListener("click", setPrompt);
  setPrompt();

  const DRAFT_KEY = "ituze:draft";
  const jt = $("#journalText");
  try { jt.value = localStorage.getItem(DRAFT_KEY) || ""; } catch { /* ignore */ }
  jt.addEventListener("input", () => {
    try { localStorage.setItem(DRAFT_KEY, jt.value); } catch { /* ignore */ }
  });

  $("#saveJournal").addEventListener("click", () => {
    const text = jt.value.trim();
    if (!text) { toast("Write something first"); return; }
    state.journal.unshift({
      id: crypto.randomUUID?.() ?? String(Date.now()),
      ts: Date.now(),
      prompt: $("#journalPrompt").textContent,
      text,
    });
    save();
    jt.value = "";
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setPrompt();
    renderJournal();
    renderStats();
    toast("Entry saved");
  });

  const renderJournal = () => {
    const list = $("#journalList");
    list.replaceChildren();
    if (!state.journal.length) {
      list.append(el("li", { className: "empty-state", textContent: "Your entries will appear here." }));
      return;
    }
    state.journal.forEach((j) => {
      const del = el("button", { className: "del-btn", textContent: "✕", type: "button" });
      del.setAttribute("aria-label", "Delete entry");
      del.addEventListener("click", () => {
        if (!confirm("Delete this entry?")) return;
        state.journal = state.journal.filter((x) => x.id !== j.id);
        save(); renderJournal(); renderStats();
      });
      list.append(el("li", {},
        el("div", { className: "entry-head" }, el("span", { className: "muted small", textContent: fmtDate(j.ts) }), del),
        j.prompt ? el("p", { className: "entry-prompt", textContent: j.prompt }) : "",
        el("p", { className: "entry-text", textContent: j.text })));
    });
  };

  // ---------- Data ----------
  $("#exportData").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: `ituze-${dayKey(Date.now())}.json` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $("#clearData").addEventListener("click", () => {
    if (!confirm("Erase all check-ins and journal entries from this device? This cannot be undone.")) return;
    state = { moods: [], journal: [] };
    save();
    renderMoods(); renderJournal(); renderStats();
    toast("All data erased");
  });

  // ---------- Install (PWA) ----------
  let deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $("#installBtn").hidden = false;
  });
  $("#installBtn").addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    $("#installBtn").hidden = true;
  });
  window.addEventListener("appinstalled", () => { $("#installBtn").hidden = true; });

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  // ---------- Init ----------
  renderMoods();
  renderJournal();
  renderStats();
  show(location.hash.slice(1) || "home");
})();
