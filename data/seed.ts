/**
 * Demo seed data (Rwandan context). Everything here is fictional sample data.
 *
 * Dates are generated relative to "now", so the demo always looks current:
 * appointments are upcoming, check-ins are recent, events are ahead.
 */
import type {
  Appointment,
  AvailabilitySlot,
  CommunityEvent,
  CommunityGroup,
  DailyCheckin,
  DemoDatabase,
  Goal,
  GoalCheckin,
  GroupMember,
  GroupMessage,
  JournalEntry,
  Psychologist,
  Resource,
  SessionNote,
  Testimonial,
  User,
} from "@/lib/data/types";
import { SAMPLE_DRAWING_DATA_URL } from "./sample-media";

export const SEED_VERSION = 2;

/** Demo personas: each Log In card signs in as one of these. */
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
      avatarColor: "#8FAE9A",
      intents: ["understand", "professional"],
      joinedAt: at(now, -24),
    },
    {
      id: DEMO_USER_IDS.identified,
      role: "identified",
      nickname: "Aline",
      realName: "Aline Uwase",
      isAnonymous: false,
      language: "en",
      avatarColor: "#B5865F",
      intents: ["connect", "understand"],
      joinedAt: at(now, -71),
    },
    {
      id: DEMO_USER_IDS.psychologist,
      role: "psychologist",
      nickname: "Jean-Paul",
      realName: "Dr. Jean-Paul Habimana",
      isAnonymous: false,
      language: "en",
      avatarColor: "#2F4A3C",
      intents: [],
      joinedAt: at(now, -400),
    },
    {
      id: DEMO_USER_IDS.admin,
      role: "admin",
      nickname: "Claudine",
      realName: "Claudine Mukamana",
      isAnonymous: false,
      language: "en",
      avatarColor: "#69716B",
      intents: [],
      joinedAt: at(now, -500),
    },
  ];

  const psychologists: Psychologist[] = [
    {
      id: "p-jeanpaul",
      userId: DEMO_USER_IDS.psychologist,
      name: "Dr. Jean-Paul Habimana",
      title: "Clinical psychologist · Group facilitator",
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
      title: "Counselling psychologist · Group facilitator",
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
    // Aline (identified)
    {
      id: "a-1",
      memberId: DEMO_USER_IDS.identified,
      memberName: "Aline Uwase",
      memberAnonymous: false,
      psychologistId: "p-emmanuel",
      mode: "video",
      time: at(now, 2, 15, 0),
      durationMin: 50,
      status: "upcoming",
    },
    {
      id: "a-2",
      memberId: DEMO_USER_IDS.identified,
      memberName: "Aline Uwase",
      memberAnonymous: false,
      psychologistId: "p-emmanuel",
      mode: "video",
      time: at(now, -12, 15, 0),
      durationMin: 50,
      status: "completed",
    },
    // Inyenyeri (anonymous): booked with a nickname only
    {
      id: "a-3",
      memberId: DEMO_USER_IDS.anonymous,
      memberName: "Inyenyeri",
      memberAnonymous: true,
      psychologistId: "p-jeanpaul",
      mode: "text",
      time: at(now, 1, 18, 0),
      durationMin: 50,
      status: "upcoming",
    },
    // Jean-Paul's caseload (therapist demo)
    {
      id: "a-4",
      memberId: "u-client-1",
      memberName: "Quiet River",
      memberAnonymous: true,
      psychologistId: "p-jeanpaul",
      mode: "audio",
      time: at(now, 0, 17, 0),
      durationMin: 50,
      status: "upcoming",
    },
    {
      id: "a-5",
      memberId: "u-client-2",
      memberName: "Grace Mukamana",
      memberAnonymous: false,
      psychologistId: "p-jeanpaul",
      mode: "audio",
      time: at(now, 3, 10, 0),
      durationMin: 50,
      status: "upcoming",
    },
    {
      id: "a-6",
      memberId: "u-client-3",
      memberName: "Umuseke",
      memberAnonymous: true,
      psychologistId: "p-jeanpaul",
      mode: "text",
      time: at(now, 4, 19, 0),
      durationMin: 50,
      status: "requested",
      message: "I'm not sure where to start. Work has been very heavy and I can't sleep.",
    },
    {
      id: "a-7",
      memberId: "u-client-4",
      memberName: "Olivier Habimana",
      memberAnonymous: false,
      psychologistId: "p-jeanpaul",
      mode: "video",
      time: at(now, 5, 11, 0),
      durationMin: 50,
      status: "requested",
      message: "My father passed away in the spring. I'd like to talk to someone about it.",
    },
    {
      id: "a-8",
      memberId: "u-client-2",
      memberName: "Grace Mukamana",
      memberAnonymous: false,
      psychologistId: "p-jeanpaul",
      mode: "audio",
      time: at(now, -4, 10, 0),
      durationMin: 50,
      status: "completed",
    },
    {
      id: "a-9",
      memberId: "u-client-1",
      memberName: "Quiet River",
      memberAnonymous: true,
      psychologistId: "p-jeanpaul",
      mode: "text",
      time: at(now, -7, 20, 0),
      durationMin: 50,
      status: "completed",
    },
  ];

  const sessionNotes: SessionNote[] = [
    {
      id: "n-1",
      appointmentId: "a-8",
      psychologistId: "p-jeanpaul",
      body: "Talked about tiredness and irritability at home. Agreed to try asking her sister for help with school pick-ups twice a week. Follow up on sleep.",
      updatedAt: at(now, -4, 11, 0),
    },
    {
      id: "n-2",
      appointmentId: "a-9",
      psychologistId: "p-jeanpaul",
      body: "First session by text. Prefers to stay anonymous for now; respect that. Journaling at night helps. Gentle pace.",
      updatedAt: at(now, -7, 21, 0),
    },
  ];

  // Small, safe groups (no fixed program)
  const groups: CommunityGroup[] = [
    {
      id: "grp-kimihurura",
      name: "Evening circle · Kimihurura",
      description: "A calm weekday evening to talk, listen and share tea with people who understand.",
      facilitatorId: "p-jeanpaul",
      location: "Ituze Wellness Space, Kimihurura",
      rhythm: "Thursdays · 17:30",
      capacity: 10,
      createdAt: at(now, -60),
    },
    {
      id: "grp-remera",
      name: "Young adults · Remera",
      description: "For students and young professionals finding their way. Saturday mornings, relaxed and honest.",
      facilitatorId: "p-solange",
      location: "Ituze Wellness Space, Remera",
      rhythm: "Saturdays · 09:30",
      capacity: 10,
      createdAt: at(now, -90),
    },
    {
      id: "grp-nyamirambo",
      name: "Parents & caregivers · Nyamirambo",
      description: "For mothers, fathers and caregivers carrying a lot. Children's corner available.",
      facilitatorId: "p-josiane",
      location: "Community hall, Nyamirambo",
      rhythm: "Tuesdays · 18:00",
      capacity: 8,
      createdAt: at(now, -20),
    },
  ];

  const memberRows = (groupId: string, names: string[], prefix: string, first?: string): GroupMember[] =>
    names.map((n, i) => ({
      groupId,
      userId: i === 0 && first ? first : `u-${prefix}-${i}`,
      displayName: n,
      joinedAt: at(now, -30 + i),
    }));
  const groupMembers: GroupMember[] = [
    ...memberRows("grp-kimihurura", ["Aline", "Eric", "Divine", "Kevin", "Umutoni", "Patrick N.", "Grace", "Olivier"], "kim", DEMO_USER_IDS.identified),
    ...memberRows("grp-remera", ["Fabrice", "Ange", "Yvette", "Moïse", "Clarisse", "Jean de Dieu", "Ornella"], "rem"),
    ...memberRows("grp-nyamirambo", ["Sandrine", "Thierry", "Bella", "Innocent"], "nya"),
  ];

  const groupMessages: GroupMessage[] = [
    {
      id: "m-1",
      groupId: "grp-kimihurura",
      authorName: "Jean-Paul (facilitator)",
      body: "Muraho neza everyone! This Thursday we'll talk about the small things that help us on hard days. If you like, bring an object that comforts you. Tea will be ready from 17:15.",
      pinned: true,
      isAnnouncement: true,
      createdAt: at(now, -1, 10, 5),
    },
    {
      id: "m-2",
      groupId: "grp-kimihurura",
      authorName: "Divine",
      body: "Thank you Jean-Paul. Last week's breathing exercise helped me before an exam 🙏",
      pinned: false,
      isAnnouncement: false,
      createdAt: at(now, -1, 12, 40),
    },
    {
      id: "m-3",
      groupId: "grp-kimihurura",
      authorName: "Ituze team",
      body: "Our Saturday gathering is open to everyone this month. Bring a friend if you'd like.",
      pinned: false,
      isAnnouncement: true,
      createdAt: at(now, -3, 9, 0),
    },
    {
      id: "m-4",
      groupId: "grp-remera",
      authorName: "Solange (facilitator)",
      body: "We'll meet in the garden room if the weather is good ☀️",
      pinned: true,
      isAnnouncement: true,
      createdAt: at(now, -2, 9, 0),
    },
  ];

  const journalEntries: JournalEntry[] = [
    // Aline (identified, in the Kimihurura evening circle)
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
      content: "Drew this after the creative evening. The colours reminded me of my mother's kitchen.",
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
    // Inyenyeri (anonymous)
    {
      id: "j-5",
      userId: DEMO_USER_IDS.anonymous,
      type: "text",
      content:
        "First time writing here. I'm not sure what to say. I just know my mind has been very loud lately and it helps to put it somewhere.",
      mood: "heavy",
      // Shared on purpose with the therapist before their first session
      sharedWith: ["p-jeanpaul"],
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
      content: "Booked a session for tomorrow, still with my nickname. Nervous but curious.",
      mood: "anxious",
      createdAt: at(now, -1, 18, 5),
    },
  ];

  const dailyCheckins: DailyCheckin[] = [
    ...[
      [-1, "good"],
      [-2, "getting-by"],
      [-3, "good"],
      [-5, "heavy"],
      [-6, "getting-by"],
    ].map(([d, mood]) => ({
      id: `dc-al-${d}`,
      userId: DEMO_USER_IDS.identified,
      date: ymd(now, d as number),
      mood: mood as DailyCheckin["mood"],
    })),
    ...[
      [-1, "unsure"],
      [-3, "getting-by"],
      [-6, "heavy"],
    ].map(([d, mood]) => ({
      id: `dc-in-${d}`,
      userId: DEMO_USER_IDS.anonymous,
      date: ymd(now, d as number),
      mood: mood as DailyCheckin["mood"],
    })),
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
      title: "Community gathering & shared lunch",
      kind: "gathering",
      date: nextWeekday(now, 6, 12, 0, 3),
      location: "Ituze Wellness Space, Kimihurura",
      description: "An open, relaxed afternoon for everyone in the Ituze community. Bring a dish to share if you can.",
    },
    {
      id: "e-2",
      title: "Imigongo painting afternoon",
      kind: "creative",
      date: nextWeekday(now, 0, 14, 0, 8),
      location: "Partner art studio, Kacyiru",
      description: "Learn the geometric patterns of imigongo with a local artist. All materials provided.",
    },
    {
      id: "e-3",
      title: "Sleep & stress: a gentle workshop",
      kind: "workshop",
      date: at(now, 10, 18, 0),
      location: "Online · video",
      description: "Dr. Emmanuel Nkurunziza shares simple, practical ways to rest better when life is busy.",
    },
    {
      id: "e-4",
      title: "Evening circle: comfort objects",
      kind: "gathering",
      groupId: "grp-kimihurura",
      date: nextWeekday(now, 4, 17, 30),
      location: "Ituze Wellness Space, Kimihurura",
      description: "Our weekly circle. Bring something that comforts you, if you like.",
    },
  ];

  const resources: Resource[] = [
    {
      id: "r-1",
      kind: "exercise",
      title: "Box breathing for loud moments",
      summary: "A two-minute breathing pattern to slow things down.",
      body: "Breathe in for four counts. Hold for four. Breathe out for four. Hold for four. Repeat four times. Notice your feet on the ground.",
      minutes: 2,
      topic: "Stress",
      published: true,
      createdAt: at(now, -3),
    },
    {
      id: "r-2",
      kind: "article",
      title: "Why rest is not laziness",
      summary: "Tiredness is information, not failure. A short read on giving yourself permission to pause.",
      body: "Many of us grew up believing that rest has to be earned. But the body keeps asking for what it needs. Rest is how we come back to ourselves, and to the people we love.",
      minutes: 4,
      topic: "Rest",
      published: true,
      createdAt: at(now, -8),
    },
    {
      id: "r-3",
      kind: "exercise",
      title: "Three good things",
      summary: "Each evening, write down three things that went well, however small.",
      body: "Before sleep, write three things that went well today and why. Small is perfect: a kind word, a cup of tea, finishing something.",
      minutes: 5,
      topic: "Gratitude",
      published: true,
      createdAt: at(now, -12),
    },
    {
      id: "r-4",
      kind: "article",
      title: "Feeling alone in a new city",
      summary: "Loneliness is common, and it is not a sign that something is wrong with you.",
      body: "Moving for work or study can mean starting over. Small, regular contact helps more than big gestures: the same café, the same walk, a group that meets weekly.",
      minutes: 5,
      topic: "Connection",
      published: true,
      createdAt: at(now, -16),
    },
    {
      id: "r-5",
      kind: "article",
      title: "What to expect from a first session",
      summary: "What a psychologist will ask, what you can share, and what stays private.",
      body: "A first session is mostly about getting to know each other. You decide how much to share. You can stay anonymous, and you can stop at any time.",
      minutes: 3,
      topic: "Support",
      published: true,
      createdAt: at(now, -20),
    },
    {
      id: "r-6",
      kind: "exercise",
      title: "Grounding: 5-4-3-2-1",
      summary: "Notice five things you see, four you hear, three you can touch…",
      body: "Name five things you can see, four you can hear, three you can touch, two you can smell and one you can taste. Go slowly.",
      minutes: 3,
      topic: "Anxiety",
      published: false,
      createdAt: at(now, -1),
    },
  ];

  // Sample stories for the demo, to be replaced with real, consented stories.
  const testimonials: Testimonial[] = [
    {
      id: "t-1",
      name: "Aline",
      detail: "24, Kigali",
      quote:
        "I moved to Kigali for work and didn't know anyone. Some weeks the only conversations I had were with my manager. Joining a group on Ituze was scary at first, but by the third meeting I was laughing with people who understood exactly what I meant. We still meet for tea on Saturdays. I didn't realise how much I needed people until I found them.",
      approved: true,
      pinned: true,
      sample: true,
      createdAt: at(now, -30),
    },
    {
      id: "t-2",
      name: "“Quiet River” (now Eric)",
      detail: "31",
      quote:
        "I signed up with a nickname because I wasn't ready for anyone to know I was struggling, not even a stranger. For two months I just wrote in my journal at night. Then one evening I booked a session, still as Quiet River. Nobody pushed me. When I finally changed my name to Eric, it felt like I was introducing myself to my own healing. I don't hide anymore, and I don't need to.",
      approved: true,
      pinned: false,
      sample: true,
      createdAt: at(now, -20),
    },
    {
      id: "t-3",
      name: "Grace",
      detail: "45, Huye",
      quote:
        "I thought therapy was for people with big problems. I was just tired all the time and snapping at my children. Talking with a psychologist on Ituze, by voice call from my own kitchen, helped me see I'd been carrying too much for too long. It's a small change, but I ask for help now. My family feels the difference.",
      approved: true,
      pinned: false,
      sample: true,
      createdAt: at(now, -10),
    },
  ];

  return {
    version: SEED_VERSION,
    seededAt: now.toISOString(),
    users,
    journalEntries,
    dailyCheckins,
    goals,
    goalCheckins,
    psychologists,
    availabilitySlots,
    appointments,
    sessionNotes,
    groups,
    groupMembers,
    groupMessages,
    events,
    resources,
    testimonials,
    siteContent: {},
  };
}
