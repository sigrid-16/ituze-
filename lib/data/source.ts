/**
 * The data-access contract for Ituze.
 *
 * The UI only depends on this interface. Today it is implemented by
 * `mockSource` (browser localStorage). Later, a `supabaseSource` implements
 * the same methods, with Row Level Security enforcing:
 *   - journal entries readable only by their owner (and, per entry, by a
 *     therapist the owner explicitly shared it with)
 *   - session notes readable only by the therapist who wrote them
 *   - group messages readable only by group members + facilitator
 *   - organizer analytics only through aggregated counts
 *
 * All methods are async on purpose, so a network backend drops in cleanly.
 */
import type {
  Appointment,
  AppointmentStatus,
  AvailabilitySlot,
  CheckinFeeling,
  CheckinMood,
  CommunityEvent,
  CommunityGroup,
  DailyCheckin,
  Goal,
  GoalCheckin,
  GroupMember,
  GroupMessage,
  JournalEntry,
  Psychologist,
  Resource,
  SessionMode,
  SessionNote,
  SiteContent,
  Testimonial,
  User,
} from "./types";

export type NewJournalEntry = Omit<JournalEntry, "id" | "createdAt">;
export type NewGoal = Omit<Goal, "id" | "createdAt" | "archived">;
export type NewPsychologist = Omit<Psychologist, "id" | "userId" | "initials">;

export interface MemberCommunityInfo {
  group?: CommunityGroup;
  facilitator?: Psychologist;
  memberCount: number;
}

export interface BookingRequest {
  memberId: string;
  psychologistId: string;
  slotId: string;
  mode: SessionMode;
  message?: string;
}

/** Counts only. Never journal content or anything that identifies a person. */
export interface PlatformStats {
  members: number;
  anonymousMembers: number;
  bookings: number;
  upcomingBookings: number;
  activeGroups: number;
  verifiedTherapists: number;
  pendingTherapists: number;
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
    update(userId: string, id: string, patch: Partial<Pick<JournalEntry, "content" | "mood" | "sharedWith">>): Promise<void>;
    remove(userId: string, id: string): Promise<void>;
    /** Only entries a member explicitly shared with this therapist. */
    sharedWith(psychologistId: string): Promise<JournalEntry[]>;
  };
  checkins: {
    list(userId: string): Promise<DailyCheckin[]>;
    set(userId: string, date: string, mood: CheckinMood): Promise<void>;
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
    byUser(userId: string): Promise<Psychologist | undefined>;
    /** Organizer only: therapist accounts are never created publicly. */
    create(p: NewPsychologist): Promise<Psychologist>;
    update(id: string, patch: Partial<Omit<Psychologist, "id" | "userId">>): Promise<void>;
  };
  availability: {
    list(psychologistId: string, opts?: { openOnly?: boolean }): Promise<AvailabilitySlot[]>;
    add(psychologistId: string, start: string, durationMin: number): Promise<void>;
    remove(psychologistId: string, slotId: string): Promise<void>;
  };
  appointments: {
    listForMember(userId: string): Promise<Appointment[]>;
    listForPsychologist(psychologistId: string): Promise<Appointment[]>;
    listAll(): Promise<Appointment[]>;
    request(req: BookingRequest): Promise<Appointment>;
    setStatus(id: string, status: AppointmentStatus): Promise<void>;
  };
  notes: {
    /** Only the author's notes. */
    list(psychologistId: string): Promise<SessionNote[]>;
    save(psychologistId: string, appointmentId: string, body: string): Promise<void>;
  };
  community: {
    forMember(userId: string): Promise<MemberCommunityInfo>;
    groups(): Promise<CommunityGroup[]>;
    createGroup(g: Omit<CommunityGroup, "id" | "createdAt">): Promise<CommunityGroup>;
    updateGroup(id: string, patch: Partial<Omit<CommunityGroup, "id">>): Promise<void>;
    removeGroup(id: string): Promise<void>;
    members(groupId?: string): Promise<GroupMember[]>;
    join(groupId: string, userId: string, displayName: string): Promise<void>;
    leave(groupId: string, userId: string): Promise<void>;
    /** Members + facilitator only. */
    messages(groupId: string): Promise<GroupMessage[]>;
    post(groupId: string, authorName: string, body: string, isAnnouncement: boolean): Promise<void>;
  };
  events: {
    list(): Promise<CommunityEvent[]>;
    create(e: Omit<CommunityEvent, "id">): Promise<void>;
    remove(id: string): Promise<void>;
  };
  resources: {
    list(opts?: { includeDrafts?: boolean }): Promise<Resource[]>;
    create(r: Omit<Resource, "id" | "createdAt">): Promise<void>;
    update(id: string, patch: Partial<Omit<Resource, "id">>): Promise<void>;
    remove(id: string): Promise<void>;
  };
  testimonials: {
    list(opts?: { includeUnapproved?: boolean }): Promise<Testimonial[]>;
    create(t: Omit<Testimonial, "id" | "createdAt">): Promise<void>;
    update(id: string, patch: Partial<Omit<Testimonial, "id">>): Promise<void>;
    remove(id: string): Promise<void>;
  };
  content: {
    get(): Promise<SiteContent>;
    update(patch: SiteContent): Promise<void>;
  };
  stats: {
    overview(): Promise<PlatformStats>;
  };
}
