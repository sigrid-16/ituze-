/**
 * The data-access contract for Ituze.
 *
 * The UI only depends on this interface. Today it is implemented by
 * `mockSource` (browser localStorage). Later, a `supabaseSource` implements
 * the same methods, with Row Level Security enforcing:
 *   - journal entries readable only by their owner
 *   - cohort messages readable only by cohort members + facilitator
 *   - admin analytics only through aggregated views
 *
 * All methods are async on purpose, so a network backend drops in cleanly.
 */
import type {
  Appointment,
  CheckinFeeling,
  Cohort,
  CohortMessage,
  Goal,
  GoalCheckin,
  JournalEntry,
  MemberCohortStatus,
  Psychologist,
  User,
  WaitlistEntry,
} from "./types";

export type NewJournalEntry = Omit<JournalEntry, "id" | "createdAt">;
export type NewGoal = Omit<Goal, "id" | "createdAt" | "archived">;

export interface MemberCohortInfo {
  status: MemberCohortStatus;
  cohort?: Cohort;
  waitlist?: WaitlistEntry;
  facilitator?: Psychologist;
}

export interface DataSource {
  users: {
    get(userId: string): Promise<User | undefined>;
    update(userId: string, patch: Partial<Omit<User, "id">>): Promise<User>;
  };
  journal: {
    /** Owner-only: returns entries for `userId` only. */
    list(userId: string): Promise<JournalEntry[]>;
    create(entry: NewJournalEntry): Promise<JournalEntry>;
    update(userId: string, id: string, patch: Partial<Pick<JournalEntry, "content" | "mood">>): Promise<void>;
    remove(userId: string, id: string): Promise<void>;
  };
  goals: {
    list(userId: string): Promise<Goal[]>;
    create(goal: NewGoal): Promise<Goal>;
    update(userId: string, id: string, patch: Partial<Omit<Goal, "id" | "userId">>): Promise<void>;
    checkins(userId: string): Promise<GoalCheckin[]>;
    checkIn(userId: string, goalId: string, date: string, feeling: CheckinFeeling, note?: string): Promise<void>;
    undoCheckIn(userId: string, goalId: string, date: string): Promise<void>;
  };
  psychologists: {
    list(opts?: { includeUnverified?: boolean }): Promise<Psychologist[]>;
    get(id: string): Promise<Psychologist | undefined>;
  };
  appointments: {
    listForMember(userId: string): Promise<Appointment[]>;
  };
  cohorts: {
    forMember(userId: string): Promise<MemberCohortInfo>;
    /** Members + facilitator only. */
    messages(cohortId: string): Promise<CohortMessage[]>;
  };
}
