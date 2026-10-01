/**
 * Demo seed data (Rwandan context). Everything here is fictional sample data.
 *
 * Dates are generated relative to "now", so the demo always looks current:
 * cohorts are mid-journey, appointments are upcoming, check-ins are recent.
 */
import type {
  Appointment,
  AvailabilitySlot,
  Cohort,
  CohortMember,
  CohortMessage,
  CommunityEvent,
  DemoDatabase,
  Goal,
  GoalCheckin,
  JournalEntry,
  Psychologist,
  User,
  WaitlistEntry,
} from "@/lib/data/types";
import { SAMPLE_DRAWING_DATA_URL } from "./sample-media";

export const SEED_VERSION = 1;

/** Demo personas — the role switcher signs in as one of these. */
export const DEMO_USER_IDS = {
  anonymous: "u-inyenyeri",
  identified: "u-aline",
  psychologist: "u-jeanpaul",
  admin: "u-claudine",
} as const;

const DAY = 86_400_000;

function at(base: Date, dayOffset: number, hour = 9, minute = 0): string {
  const d = new Date(base.getTime() + dayOffset * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function ymd(base: Date, dayOffset: number): string {
  const d = new Date(base.getTime() + dayOffset * DAY);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Next given weekday (0=Sun) at hour:minute, at least `minDays` ahead. */
function nextWeekday(base: Date, weekday: number, hour: number, minute = 0, minDays = 0): string {
  const d = new Date(base.getTime() + minDays * DAY);
  while (d.getDay() !== weekday) d.setTime(d.getTime() + DAY);
  d.setHours(hour, minute, 0, 0);
  if (d.getTime() < base.getTime()) d.setTime(d.getTime() + 7 * DAY);
  return d.toISOString();
}

export function createSeed(now = new Date()): DemoDatabase {
  const users: User[] = [
    {
      id: DEMO_USER_IDS.anonymous,
      role: "anonymous",
      nickname: "Inyenyeri",
      realName: null,
      isAnonymous: true,
      language: "rw",
      avatarColor: "#7FB8A4",
      joinedAt: at(now, -24),
    },
    {
      id: DEMO_USER_IDS.identified,
      role: "identified",
      nickname: "Aline",
      realName: "Aline Uwase",
      isAnonymous: false,
      language: "en",
      avatarColor: "#C8664A",
      joinedAt: at(now, -71),
    },
    {
      id: DEMO_USER_IDS.psychologist,
      role: "psychologist",
      nickname: "Jean-Paul",
      realName: "Dr. Jean-Paul Habimana",
      isAnonymous: false,
      language: "en",
      avatarColor: "#2F5D50",
      joinedAt: at(now, -400),
    },
    {
      id: DEMO_USER_IDS.admin,
      role: "admin",
      nickname: "Claudine",
      realName: "Claudine Mukamana",
      isAnonymous: false,
      language: "en",
      avatarColor: "#6B746E",
      joinedAt: at(now, -500),
    },
  ];

  const psychologists: Psychologist[] = [
    {
      id: "p-jeanpaul",
      userId: DEMO_USER_IDS.psychologist,
      name: "Dr. Jean-Paul Habimana",
      title: "Clinical psychologist · Cohort facilitator",
      photoColor: "#2F5D50",
      initials: "JH",
      verificationStatus: "verified",
      licenseNumber: "DEMO-CP-0142",
      credentials: ["PhD Clinical Psychology", "Trauma-informed group facilitation"],
      specialties: ["Trauma-informed care", "Grief & loss", "Group healing"],
      languages: ["rw", "en", "fr"],
      bio: "I have walked alongside individuals and groups in Kigali for over twelve years. I believe healing grows in safe, honest community.",
      location: "Kimihurura, Gasabo · Kigali",
      modes: ["video", "audio", "text"],
      yearsExperience: 12,
    },
    {
      id: "p-solange",
      userId: "u-solange",
      name: "Solange Mukeshimana",
      title: "Counselling psychologist",
      photoColor: "#C8664A",
      initials: "SM",
      verificationStatus: "verified",
      licenseNumber: "DEMO-CP-0218",
      credentials: ["MSc Counselling Psychology", "Youth mental health certificate"],
      specialties: ["Anxiety", "Students & young adults", "Self-esteem"],
      languages: ["rw", "en"],
      bio: "I work mostly with young people finding their way through studies, family expectations and first jobs. Every feeling is welcome here.",
      location: "Remera, Gasabo · Kigali",
      modes: ["video", "text"],
      yearsExperience: 7,
    },
    {
      id: "p-emmanuel",
      userId: "u-emmanuel",
      name: "Dr. Emmanuel Nkurunziza",
      title: "Clinical psychologist",
      photoColor: "#4E7A6C",
      initials: "EN",
      verificationStatus: "verified",
      licenseNumber: "DEMO-CP-0097",
      credentials: ["PhD Psychology", "Family systems therapy"],
      specialties: ["Low mood", "Men's wellbeing", "Family relationships"],
      languages: ["rw", "fr", "en"],
      bio: "Strength includes asking for support. I offer a calm, confidential space to talk about pressure, relationships and finding meaning again.",
      location: "Kacyiru, Gasabo · Kigali",
      modes: ["video", "audio"],
      yearsExperience: 15,
    },
    {
      id: "p-josiane",
      userId: "u-josiane",
      name: "Josiane Ingabire",
      title: "Counselling psychologist · Cohort facilitator",
      photoColor: "#9E4A33",
      initials: "JI",
      verificationStatus: "verified",
      licenseNumber: "DEMO-CP-0311",
      credentials: ["MSc Clinical Psychology", "Perinatal mental health"],
      specialties: ["Women's wellbeing", "New parents", "Stress"],
      languages: ["rw", "en"],
      bio: "Mothers, caregivers and women carrying a lot: you deserve care too. I combine talk therapy with creative and body-based practices.",
      location: "Nyamirambo, Nyarugenge · Kigali",
      modes: ["video", "audio", "text"],
      yearsExperience: 9,
    },
    {
      id: "p-patrick",
      userId: "u-patrick",
      name: "Patrick Mugisha",
      title: "Counselling psychologist",
      photoColor: "#3B6F8F",
      initials: "PM",
      verificationStatus: "verified",
      licenseNumber: "DEMO-CP-0254",
      credentials: ["MSc Counselling", "Addiction recovery support"],
      specialties: ["Recovery", "Young adults", "Anger & stress"],
      languages: ["rw", "en"],
      bio: "Change is possible at any age. I help people understand their patterns and build steady routines that support recovery.",
      location: "Kicukiro · Kigali",
      modes: ["audio", "text"],
      yearsExperience: 6,
    },
    {
      id: "p-alice",
      userId: "u-alice",
      name: "Alice Uwimana",
      title: "Clinical psychologist",
      photoColor: "#8A6F4E",
      initials: "AU",
      verificationStatus: "pending",
      licenseNumber: "DEMO-CP-0402",
      credentials: ["MSc Clinical Psychology"],
      specialties: ["Child & adolescent", "School wellbeing"],
      languages: ["rw", "fr"],
      bio: "Awaiting verification.",
      location: "Kibagabaga, Gasabo · Kigali",
      modes: ["video"],
      yearsExperience: 4,
    },
  ];

  const availabilitySlots: AvailabilitySlot[] = psychologists
    .filter((p) => p.verificationStatus === "verified")
    .flatMap((p, pi) =>
      [1, 2, 3, 5, 6, 8].flatMap((d) =>
        [9, 11, 14, 16].map((h, hi) => ({
          id: `slot-${p.id}-${d}-${h}`,
          psychologistId: p.id,
          start: at(now, d + (pi % 2), h, 0),
          durationMin: 50,
          booked: (d + hi + pi) % 4 === 0,
        })),
      ),
    );

  const appointments: Appointment[] = [
    {
      id: "a-1",
      memberId: DEMO_USER_IDS.identified,
      psychologistId: "p-emmanuel",
      mode: "video",
      time: at(now, 2, 15, 0),
      durationMin: 50,
      status: "upcoming",
    },
    {
      id: "a-2",
      memberId: DEMO_USER_IDS.anonymous,
      psychologistId: "p-solange",
      mode: "text",
      time: at(now, 1, 18, 0),
      durationMin: 50,
      status: "upcoming",
    },
    {
      id: "a-3",
      memberId: DEMO_USER_IDS.identified,
      psychologistId: "p-emmanuel",
      mode: "video",
      time: at(now, -12, 15, 0),
      durationMin: 50,
      status: "completed",
    },
  ];

  // Cohorts at different points of the 12 weeks
  const cohorts: Cohort[] = [
    {
      id: "c-kimihurura",
      name: "Kimihurura · Evening cohort",
      facilitatorId: "p-jeanpaul",
      location: "Ituze Wellness Space, Kimihurura",
      timeSlot: "17:30–19:30",
      // week 6 session is in 2 days
      startDate: at(now, -33, 17, 30),
      status: "active",
      capacity: 9,
      currentWeek: 6,
    },
    {
      id: "c-remera",
      name: "Remera · Morning cohort",
      facilitatorId: "p-solange",
      location: "Ituze Wellness Space, Remera",
      timeSlot: "09:00–11:00",
      // week 10 session is in 3 days
      startDate: at(now, -60, 9, 0),
      status: "active",
      capacity: 10,
      currentWeek: 10,
    },
    {
      id: "c-nyamirambo",
      name: "Nyamirambo · Evening cohort",
      facilitatorId: "p-josiane",
      location: "Community hall, Nyamirambo",
      timeSlot: "17:30–19:30",
      startDate: at(now, 12, 17, 30),
      status: "forming",
      capacity: 8,
      currentWeek: 0,
    },
    {
      id: "c-kacyiru-2025",
      name: "Kacyiru · Spring cohort",
      facilitatorId: "p-jeanpaul",
      location: "Ituze Wellness Space, Kimihurura",
      timeSlot: "17:30–19:30",
      startDate: at(now, -160, 17, 30),
      status: "graduated",
      capacity: 8,
      currentWeek: 12,
    },
  ];

  const kimihururaNames = ["Aline", "Eric", "Divine", "Kevin", "Umutoni", "Patrick N.", "Grace", "Olivier"];
  const cohortMembers: CohortMember[] = [
    ...kimihururaNames.map((n, i) => ({
      cohortId: "c-kimihurura",
      userId: i === 0 ? DEMO_USER_IDS.identified : `u-kim-${i}`,
      displayName: n,
      joinedAt: at(now, -40),
    })),
    ...["Fabrice", "Ange", "Yvette", "Moïse", "Clarisse", "Jean de Dieu", "Ornella", "Samuel", "Nadine"].map((n, i) => ({
      cohortId: "c-remera",
      userId: `u-rem-${i}`,
      displayName: n,
      joinedAt: at(now, -68),
    })),
    ...["Sandrine", "Thierry", "Bella", "Innocent"].map((n, i) => ({
      cohortId: "c-nyamirambo",
      userId: `u-nya-${i}`,
      displayName: n,
      joinedAt: at(now, -3),
    })),
  ];

  const waitlistEntries: WaitlistEntry[] = [
    {
      id: "w-1",
      userId: DEMO_USER_IDS.anonymous,
      preferredLocation: "Kimihurura",
      preferredSlot: "Weekday evenings",
      createdAt: at(now, -9),
    },
    ...["Keza", "Ndoli", "Mahoro", "Gisa", "Isimbi", "Teta"].map((n, i) => ({
      id: `w-${i + 2}`,
      userId: `u-wait-${i}`,
      preferredLocation: i % 2 ? "Remera" : "Nyamirambo",
      preferredSlot: i % 3 ? "Saturday mornings" : "Weekday evenings",
      createdAt: at(now, -i - 2),
    })),
  ];

  const cohortMessages: CohortMessage[] = [
    {
      id: "m-1",
      cohortId: "c-kimihurura",
      authorId: DEMO_USER_IDS.psychologist,
      authorName: "Jean-Paul (facilitator)",
      isFacilitator: true,
      body: "Muraho neza everyone! Week 6 is about self-worth & confidence. If you like, bring a small object that reminds you of something you are proud of. See you at our next session, 17:30. Tea will be ready from 17:15.",
      pinned: true,
      isAnnouncement: true,
      createdAt: at(now, -1, 10, 5),
    },
    {
      id: "m-2",
      cohortId: "c-kimihurura",
      authorId: "u-kim-2",
      authorName: "Divine",
      isFacilitator: false,
      body: "Thank you Jean-Paul. Last week's breathing exercise helped me before an exam 🙏",
      pinned: false,
      isAnnouncement: false,
      createdAt: at(now, -1, 12, 40),
    },
    {
      id: "m-3",
      cohortId: "c-kimihurura",
      authorId: "u-kim-6",
      authorName: "Grace",
      isFacilitator: false,
      body: "I might be 10 minutes late next session because of work, please start without me.",
      pinned: false,
      isAnnouncement: false,
      createdAt: at(now, 0, 8, 15),
    },
    {
      id: "m-4",
      cohortId: "c-remera",
      authorId: "u-solange",
      authorName: "Solange (facilitator)",
      isFacilitator: true,
      body: "Week 10: values, meaning & purpose. We'll meet in the garden room if the weather is good ☀️",
      pinned: true,
      isAnnouncement: true,
      createdAt: at(now, -2, 9, 0),
    },
  ];

  const journalEntries: JournalEntry[] = [
    // Aline (identified, in cohort week 6)
    {
      id: "j-1",
      userId: DEMO_USER_IDS.identified,
      type: "text",
      content:
        "Today the group shared stories about the people who raised us. I didn't expect to cry, but it felt lighter afterwards. Divine said something about her grandmother that stayed with me all evening.",
      mood: "mixed",
      createdAt: at(now, -8, 20, 10),
    },
    {
      id: "j-2",
      userId: DEMO_USER_IDS.identified,
      type: "image",
      content: "Drew this after the creativity exercise. The colours reminded me of my mother's kitchen.",
      mediaUrl: SAMPLE_DRAWING_DATA_URL,
      mood: "calm",
      createdAt: at(now, -5, 19, 30),
    },
    {
      id: "j-3",
      userId: DEMO_USER_IDS.identified,
      type: "text",
      content:
        "What gave me energy this week: walking to work with my sister, finishing the report early, and the rain on Thursday night.",
      mood: "grateful",
      promptId: "prompt-2",
      createdAt: at(now, -2, 21, 0),
    },
    {
      id: "j-4",
      userId: DEMO_USER_IDS.identified,
      type: "text",
      content: "Slept better two nights in a row. I left my phone in the sitting room. Small win.",
      mood: "proud",
      createdAt: at(now, 0, 7, 20),
    },
    // Inyenyeri (anonymous, on the waiting list)
    {
      id: "j-5",
      userId: DEMO_USER_IDS.anonymous,
      type: "text",
      content:
        "First time writing here. I'm not sure what to say. I just know my mind has been very loud lately and it helps to put it somewhere.",
      mood: "heavy",
      createdAt: at(now, -6, 22, 15),
    },
    {
      id: "j-6",
      userId: DEMO_USER_IDS.anonymous,
      type: "text",
      content: "Talked to my cousin for an hour. I laughed for the first time in a while.",
      mood: "hopeful",
      promptId: "prompt-2",
      createdAt: at(now, -3, 21, 45),
    },
    {
      id: "j-7",
      userId: DEMO_USER_IDS.anonymous,
      type: "text",
      content: "Signed up for the cohort waiting list. Nervous but curious.",
      mood: "anxious",
      createdAt: at(now, -1, 18, 5),
    },
  ];

  const goals: Goal[] = [
    {
      id: "g-1",
      userId: DEMO_USER_IDS.identified,
      kind: "sleep",
      title: "Rest well: phone out of the bedroom",
      intention: "So I wake up with more patience for my family.",
      daysPerWeek: 5,
      reminder: { enabled: true, time: "21:30" },
      archived: false,
      createdAt: at(now, -30),
    },
    {
      id: "g-2",
      userId: DEMO_USER_IDS.identified,
      kind: "gratitude",
      title: "Note three good things",
      daysPerWeek: 3,
      reminder: { enabled: false, time: "20:00" },
      archived: false,
      createdAt: at(now, -20),
    },
    {
      id: "g-3",
      userId: DEMO_USER_IDS.identified,
      kind: "movement",
      title: "Walk to work twice a week",
      daysPerWeek: 2,
      reminder: { enabled: false, time: "07:00" },
      archived: false,
      createdAt: at(now, -14),
    },
    {
      id: "g-4",
      userId: DEMO_USER_IDS.anonymous,
      kind: "stress",
      title: "A 10-minute walk when things feel loud",
      daysPerWeek: 3,
      reminder: { enabled: true, time: "17:00" },
      archived: false,
      createdAt: at(now, -10),
    },
    {
      id: "g-5",
      userId: DEMO_USER_IDS.anonymous,
      kind: "journaling",
      title: "Write a few lines in the evening",
      daysPerWeek: 3,
      reminder: { enabled: false, time: "21:00" },
      archived: false,
      createdAt: at(now, -6),
    },
  ];

  const pattern: Array<[string, string, number[]]> = [
    ["g-1", DEMO_USER_IDS.identified, [-1, -2, -4, -5, -7, -8, -9, -12]],
    ["g-2", DEMO_USER_IDS.identified, [-2, -5, -6, -10]],
    ["g-3", DEMO_USER_IDS.identified, [-3, -7]],
    ["g-4", DEMO_USER_IDS.anonymous, [-1, -4, -6]],
    ["g-5", DEMO_USER_IDS.anonymous, [-1, -3, -6]],
  ];
  const goalCheckins: GoalCheckin[] = pattern.flatMap(([goalId, userId, days]) =>
    days.map((d, i) => ({
      id: `gc-${goalId}-${d}`,
      goalId,
      userId,
      date: ymd(now, d),
      feeling: i % 4 === 3 ? ("a-little" as const) : ("did-it" as const),
    })),
  );

  const events: CommunityEvent[] = [
    {
      id: "e-1",
      title: "Alumni gathering & shared lunch",
      kind: "gathering",
      date: nextWeekday(now, 6, 12, 0, 5),
      location: "Ituze Wellness Space, Kimihurura",
      description: "Reconnect with alumni from every cohort. Bring a dish to share if you can.",
    },
    {
      id: "e-2",
      title: "Imigongo painting afternoon",
      kind: "creative",
      date: nextWeekday(now, 0, 14, 0, 9),
      location: "Partner art studio, Kacyiru",
      description: "Learn the geometric patterns of imigongo with a local artist. All materials provided.",
    },
    {
      id: "e-3",
      title: "Welcome circle for the Nyamirambo cohort",
      kind: "volunteer",
      date: at(now, 12, 17, 0),
      location: "Community hall, Nyamirambo",
      description: "Volunteer to greet new members on their first evening and share what the journey meant to you.",
    },
  ];

  return {
    version: SEED_VERSION,
    seededAt: now.toISOString(),
    users,
    journalEntries,
    goals,
    goalCheckins,
    psychologists,
    availabilitySlots,
    appointments,
    cohorts,
    cohortMembers,
    waitlistEntries,
    cohortMessages,
    events,
  };
}
