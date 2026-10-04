/**
 * Domain types for Ituze.
 *
 * These mirror the planned Supabase tables (see README "Data model") so the
 * mock data source can be swapped for a real backend without touching the UI.
 */

/**
 * Account roles. In the UI, "psychologist" is labelled Therapist and "admin"
 * is labelled Organizer; "anonymous" and "identified" are both Users.
 */
export type Role = "anonymous" | "identified" | "psychologist" | "admin";
export type Locale = "en" | "rw" | "fr";

/** "What brings you to Ituze?" answers. They only change what is recommended first. */
export type Intent = "understand" | "connect" | "professional" | "exploring";

export interface User {
  id: string;
  role: Role;
  nickname: string;
  realName: string | null;
  isAnonymous: boolean;
  language: Locale;
  avatarColor?: string;
  intents: Intent[];
  joinedAt: string;
}

/* ----------------------------- Journal ---------------------------------- */

export type JournalEntryType = "text" | "voice" | "image";
export type Mood = "calm" | "grateful" | "hopeful" | "tired" | "heavy" | "anxious" | "proud" | "mixed";

export interface JournalEntry {
  id: string;
  userId: string;
  type: JournalEntryType;
  /** Plain text in the demo. With the real backend this becomes `encrypted_content`. */
  content: string;
  /** Data URL in the demo (voice note / image). With the backend: storage URL. */
  mediaUrl?: string;
  /** Seconds, for voice notes */
  durationSec?: number;
  mood?: Mood;
  promptId?: string;
  /** Psychologist ids this entry was explicitly shared with. Private when empty. */
  sharedWith?: string[];
  createdAt: string;
}

export interface ReflectionPrompt {
  id: string;
  /** i18n key, so prompts are translated */
  key: string;
}

/* --------------------------- Daily check-in ----------------------------- */

export type CheckinMood = "good" | "getting-by" | "heavy" | "too-much" | "unsure";

export interface DailyCheckin {
  id: string;
  userId: string;
  /** YYYY-MM-DD */
  date: string;
  mood: CheckinMood;
}

/* ------------------------------ Goals ----------------------------------- */

export type GoalKind = "sleep" | "journaling" | "stress" | "movement" | "gratitude" | "custom";
export type CheckinFeeling = "did-it" | "a-little" | "not-today";

export interface Goal {
  id: string;
  userId: string;
  kind: GoalKind;
  title: string;
  /** Free text "why this matters to me" */
  intention?: string;
  /** Gentle target, e.g. 4 days a week. Never used to score or rank. */
  daysPerWeek: number;
  reminder: { enabled: boolean; time: string };
  archived: boolean;
  createdAt: string;
}

export interface GoalCheckin {
  id: string;
  goalId: string;
  userId: string;
  /** YYYY-MM-DD */
  date: string;
  feeling: CheckinFeeling;
  note?: string;
}

/* ------------------------- Psychologists -------------------------------- */

export type VerificationStatus = "pending" | "verified" | "rejected";
export type SessionMode = "video" | "audio" | "text";

export interface Psychologist {
  id: string;
  userId: string;
  name: string;
  title: string;
  photoColor: string;
  initials: string;
  verificationStatus: VerificationStatus;
  licenseNumber: string;
  credentials: string[];
  specialties: string[];
  languages: Locale[];
  bio: string;
  location: string;
  modes: SessionMode[];
  yearsExperience: number;
}

export interface AvailabilitySlot {
  id: string;
  psychologistId: string;
  start: string;
  durationMin: number;
  booked: boolean;
}

/** "requested" waits for the therapist to accept; "declined" was not accepted. */
export type AppointmentStatus = "requested" | "upcoming" | "completed" | "cancelled" | "declined";

export interface Appointment {
  id: string;
  memberId: string;
  /** What the therapist sees: the nickname for anonymous clients, never more. */
  memberName: string;
  memberAnonymous: boolean;
  psychologistId: string;
  slotId?: string;
  mode: SessionMode;
  time: string;
  durationMin: number;
  status: AppointmentStatus;
  /** Optional message from the client with the request */
  message?: string;
}

/** Private to the therapist who wrote it. */
export interface SessionNote {
  id: string;
  appointmentId: string;
  psychologistId: string;
  body: string;
  updatedAt: string;
}

/* ----------------------------- Community -------------------------------- */

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  /** Psychologist id of the facilitator, if any */
  facilitatorId?: string;
  location: string;
  /** e.g. "Thursdays · 17:30" */
  rhythm: string;
  capacity: number;
  createdAt: string;
}

export interface GroupMember {
  groupId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}

export interface GroupMessage {
  id: string;
  groupId: string;
  authorName: string;
  body: string;
  pinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  kind: "gathering" | "creative" | "workshop" | "volunteer";
  /** Group-only activity, or open to everyone when empty */
  groupId?: string;
  date: string;
  location: string;
  description: string;
}

/* ------------------------------ Content --------------------------------- */

export interface Resource {
  id: string;
  kind: "article" | "exercise";
  title: string;
  summary: string;
  body: string;
  minutes: number;
  topic: string;
  published: boolean;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  /** e.g. "24, Kigali" */
  detail: string;
  quote: string;
  approved: boolean;
  pinned: boolean;
  /** Demo sample story, to be replaced with real, consented stories */
  sample: boolean;
  createdAt: string;
}

/** Homepage copy the organizer can override. Empty fields use the translated defaults. */
export interface SiteContent {
  heroTitle?: string;
  heroBody?: string;
}

/* -------------------------------- DB ------------------------------------ */

export interface DemoDatabase {
  version: number;
  /** When the sample data was generated; dates are relative to this. */
  seededAt: string;
  users: User[];
  journalEntries: JournalEntry[];
  dailyCheckins: DailyCheckin[];
  goals: Goal[];
  goalCheckins: GoalCheckin[];
  psychologists: Psychologist[];
  availabilitySlots: AvailabilitySlot[];
  appointments: Appointment[];
  sessionNotes: SessionNote[];
  groups: CommunityGroup[];
  groupMembers: GroupMember[];
  groupMessages: GroupMessage[];
  events: CommunityEvent[];
  resources: Resource[];
  testimonials: Testimonial[];
  siteContent: SiteContent;
}
