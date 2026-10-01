/**
 * Domain types for Ituze.
 *
 * These mirror the planned Supabase tables (see README "Data model") so the
 * mock data source can be swapped for a real backend without touching the UI.
 */

export type Role = "anonymous" | "identified" | "psychologist" | "admin";
export type Locale = "en" | "rw" | "fr";

export interface User {
  id: string;
  role: Role;
  nickname: string;
  realName: string | null;
  isAnonymous: boolean;
  language: Locale;
  avatarColor?: string;
  /** Goals picked during onboarding, optional */
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
  createdAt: string;
}

export interface ReflectionPrompt {
  id: string;
  /** i18n key, so prompts are translated */
  key: string;
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

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  memberId: string;
  psychologistId: string;
  mode: SessionMode;
  time: string;
  durationMin: number;
  status: AppointmentStatus;
}

/* ------------------------------ Cohorts --------------------------------- */

export type CohortStatus = "forming" | "active" | "graduated";
export type MemberCohortStatus = "none" | "waiting" | "assigned" | "active" | "graduated";

export interface Cohort {
  id: string;
  name: string;
  facilitatorId: string; // psychologist id
  location: string;
  /** Time of day, e.g. "17:30–19:30". The weekday follows from startDate. */
  timeSlot: string;
  startDate: string;
  status: CohortStatus;
  capacity: number; // 7–10
  /** 1–12 for active cohorts */
  currentWeek: number;
}

export interface CohortMember {
  cohortId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  preferredLocation: string;
  preferredSlot: string;
  createdAt: string;
}

export interface CohortMessage {
  id: string;
  cohortId: string;
  authorId: string;
  authorName: string;
  isFacilitator: boolean;
  body: string;
  pinned: boolean;
  isAnnouncement: boolean;
  createdAt: string;
}

export interface JourneyWeek {
  week: number;
  phase: 1 | 2 | 3 | 4;
  /** i18n key for theme */
  themeKey: string;
  promptKey: string;
}

/* ------------------------------ Alumni ---------------------------------- */

export interface CommunityEvent {
  id: string;
  title: string;
  kind: "gathering" | "creative" | "project" | "volunteer" | "program";
  date: string;
  location: string;
  description: string;
}

/* -------------------------------- DB ------------------------------------ */

export interface DemoDatabase {
  version: number;
  /** When the sample data was generated; dates are relative to this. */
  seededAt: string;
  users: User[];
  journalEntries: JournalEntry[];
  goals: Goal[];
  goalCheckins: GoalCheckin[];
  psychologists: Psychologist[];
  availabilitySlots: AvailabilitySlot[];
  appointments: Appointment[];
  cohorts: Cohort[];
  cohortMembers: CohortMember[];
  waitlistEntries: WaitlistEntry[];
  cohortMessages: CohortMessage[];
  events: CommunityEvent[];
}
