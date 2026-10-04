import { getDb, updateDb } from "./mock-store";
import type { DataSource } from "./source";
import type { Appointment, GoalCheckin } from "./types";

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);
const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Pinned first, then newest. */
const pinnedFirst = <T extends { pinned: boolean; createdAt: string }>(a: T, b: T) =>
  Number(b.pinned) - Number(a.pinned) || byNewest(a, b);

/** DataSource backed by browser localStorage (demo mode). */
export const mockSource: DataSource = {
  users: {
    async get(userId) {
      return getDb().users.find((u) => u.id === userId);
    },
    async update(userId, patch) {
      updateDb((d) => ({ ...d, users: d.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)) }));
      return getDb().users.find((u) => u.id === userId)!;
    },
  },

  journal: {
    async list(userId) {
      return getDb().journalEntries.filter((e) => e.userId === userId).sort(byNewest);
    },
    async create(entry) {
      const created = { ...entry, id: uid("j"), createdAt: new Date().toISOString() };
      updateDb((d) => ({ ...d, journalEntries: [created, ...d.journalEntries] }));
      return created;
    },
    async update(userId, id, patch) {
      updateDb((d) => ({
        ...d,
        journalEntries: d.journalEntries.map((e) => (e.id === id && e.userId === userId ? { ...e, ...patch } : e)),
      }));
    },
    async remove(userId, id) {
      updateDb((d) => ({
        ...d,
        journalEntries: d.journalEntries.filter((e) => !(e.id === id && e.userId === userId)),
      }));
    },
    async sharedWith(psychologistId) {
      return getDb()
        .journalEntries.filter((e) => e.sharedWith?.includes(psychologistId))
        .sort(byNewest);
    },
  },

  checkins: {
    async list(userId) {
      return getDb()
        .dailyCheckins.filter((c) => c.userId === userId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    async set(userId, date, mood) {
      updateDb((d) => ({
        ...d,
        dailyCheckins: [
          ...d.dailyCheckins.filter((c) => !(c.userId === userId && c.date === date)),
          { id: uid("dc"), userId, date, mood },
        ],
      }));
    },
  },

  goals: {
    async list(userId) {
      return getDb()
        .goals.filter((g) => g.userId === userId && !g.archived)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async create(goal) {
      const created = { ...goal, id: uid("g"), archived: false, createdAt: new Date().toISOString() };
      updateDb((d) => ({ ...d, goals: [...d.goals, created] }));
      return created;
    },
    async update(userId, id, patch) {
      updateDb((d) => ({
        ...d,
        goals: d.goals.map((g) => (g.id === id && g.userId === userId ? { ...g, ...patch } : g)),
      }));
    },
    async checkins(userId) {
      return getDb().goalCheckins.filter((c) => c.userId === userId);
    },
    async checkIn(userId, goalId, date, feeling, note) {
      const entry: GoalCheckin = { id: uid("gc"), goalId, userId, date, feeling, note };
      updateDb((d) => ({
        ...d,
        goalCheckins: [...d.goalCheckins.filter((c) => !(c.goalId === goalId && c.date === date)), entry],
      }));
    },
    async undoCheckIn(userId, goalId, date) {
      updateDb((d) => ({
        ...d,
        goalCheckins: d.goalCheckins.filter((c) => !(c.userId === userId && c.goalId === goalId && c.date === date)),
      }));
    },
  },

  psychologists: {
    async list(opts) {
      return getDb().psychologists.filter((p) => opts?.includeUnverified || p.verificationStatus === "verified");
    },
    async get(id) {
      return getDb().psychologists.find((p) => p.id === id);
    },
    async byUser(userId) {
      return getDb().psychologists.find((p) => p.userId === userId);
    },
    async create(p) {
      const id = uid("p");
      const created = { ...p, id, userId: `u-${id}`, initials: initialsOf(p.name) };
      updateDb((d) => ({ ...d, psychologists: [...d.psychologists, created] }));
      return created;
    },
    async update(id, patch) {
      updateDb((d) => ({
        ...d,
        psychologists: d.psychologists.map((p) =>
          p.id === id ? { ...p, ...patch, initials: patch.name ? initialsOf(patch.name) : p.initials } : p,
        ),
      }));
    },
  },

  availability: {
    async list(psychologistId, opts) {
      const now = Date.now();
      return getDb()
        .availabilitySlots.filter(
          (s) => s.psychologistId === psychologistId && new Date(s.start).getTime() > now && (!opts?.openOnly || !s.booked),
        )
        .sort((a, b) => a.start.localeCompare(b.start));
    },
    async add(psychologistId, start, durationMin) {
      updateDb((d) => ({
        ...d,
        availabilitySlots: [...d.availabilitySlots, { id: uid("slot"), psychologistId, start, durationMin, booked: false }],
      }));
    },
    async remove(psychologistId, slotId) {
      updateDb((d) => ({
        ...d,
        availabilitySlots: d.availabilitySlots.filter((s) => !(s.id === slotId && s.psychologistId === psychologistId && !s.booked)),
      }));
    },
  },

  appointments: {
    async listForMember(userId) {
      return getDb()
        .appointments.filter((a) => a.memberId === userId)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    async listForPsychologist(psychologistId) {
      return getDb()
        .appointments.filter((a) => a.psychologistId === psychologistId)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
    async listAll() {
      return [...getDb().appointments].sort((a, b) => a.time.localeCompare(b.time));
    },
    async request(req) {
      const d = getDb();
      const slot = d.availabilitySlots.find((s) => s.id === req.slotId && !s.booked);
      const member = d.users.find((u) => u.id === req.memberId);
      if (!slot || !member) throw new Error("Slot or member not found");
      const created: Appointment = {
        id: uid("a"),
        memberId: member.id,
        // Anonymous members are only ever shown by nickname
        memberName: member.isAnonymous ? member.nickname : (member.realName ?? member.nickname),
        memberAnonymous: member.isAnonymous,
        psychologistId: req.psychologistId,
        slotId: slot.id,
        mode: req.mode,
        time: slot.start,
        durationMin: slot.durationMin,
        status: "requested",
        message: req.message?.trim() || undefined,
      };
      updateDb((db) => ({
        ...db,
        appointments: [...db.appointments, created],
        availabilitySlots: db.availabilitySlots.map((s) => (s.id === slot.id ? { ...s, booked: true } : s)),
      }));
      return created;
    },
    async setStatus(id, status) {
      updateDb((d) => {
        const appt = d.appointments.find((a) => a.id === id);
        const freesSlot = status === "declined" || status === "cancelled";
        return {
          ...d,
          appointments: d.appointments.map((a) => (a.id === id ? { ...a, status } : a)),
          availabilitySlots: d.availabilitySlots.map((s) => (freesSlot && s.id === appt?.slotId ? { ...s, booked: false } : s)),
        };
      });
    },
  },

  notes: {
    async list(psychologistId) {
      return getDb().sessionNotes.filter((n) => n.psychologistId === psychologistId);
    },
    async save(psychologistId, appointmentId, body) {
      updateDb((d) => ({
        ...d,
        sessionNotes: [
          ...d.sessionNotes.filter((n) => !(n.psychologistId === psychologistId && n.appointmentId === appointmentId)),
          ...(body.trim()
            ? [{ id: uid("n"), psychologistId, appointmentId, body: body.trim(), updatedAt: new Date().toISOString() }]
            : []),
        ],
      }));
    },
  },

  community: {
    async forMember(userId) {
      const d = getDb();
      const membership = d.groupMembers.find((m) => m.userId === userId);
      const group = membership && d.groups.find((g) => g.id === membership.groupId);
      if (!group) return { memberCount: 0 };
      return {
        group,
        facilitator: d.psychologists.find((p) => p.id === group.facilitatorId),
        memberCount: d.groupMembers.filter((m) => m.groupId === group.id).length,
      };
    },
    async groups() {
      return [...getDb().groups].sort((a, b) => a.name.localeCompare(b.name));
    },
    async createGroup(g) {
      const created = { ...g, id: uid("grp"), createdAt: new Date().toISOString() };
      updateDb((d) => ({ ...d, groups: [...d.groups, created] }));
      return created;
    },
    async updateGroup(id, patch) {
      updateDb((d) => ({ ...d, groups: d.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) }));
    },
    async removeGroup(id) {
      updateDb((d) => ({
        ...d,
        groups: d.groups.filter((g) => g.id !== id),
        groupMembers: d.groupMembers.filter((m) => m.groupId !== id),
        groupMessages: d.groupMessages.filter((m) => m.groupId !== id),
        events: d.events.filter((e) => e.groupId !== id),
      }));
    },
    async members(groupId) {
      return getDb().groupMembers.filter((m) => !groupId || m.groupId === groupId);
    },
    async join(groupId, userId, displayName) {
      updateDb((d) => ({
        ...d,
        // One group at a time keeps things small and safe
        groupMembers: [
          ...d.groupMembers.filter((m) => m.userId !== userId),
          { groupId, userId, displayName, joinedAt: new Date().toISOString() },
        ],
      }));
    },
    async leave(groupId, userId) {
      updateDb((d) => ({
        ...d,
        groupMembers: d.groupMembers.filter((m) => !(m.groupId === groupId && m.userId === userId)),
      }));
    },
    async messages(groupId) {
      return getDb()
        .groupMessages.filter((m) => m.groupId === groupId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
    async post(groupId, authorName, body, isAnnouncement) {
      updateDb((d) => ({
        ...d,
        groupMessages: [
          ...d.groupMessages,
          { id: uid("m"), groupId, authorName, body, isAnnouncement, pinned: false, createdAt: new Date().toISOString() },
        ],
      }));
    },
  },

  events: {
    async list() {
      const now = Date.now() - 3 * 3_600_000;
      return getDb()
        .events.filter((e) => new Date(e.date).getTime() > now)
        .sort((a, b) => a.date.localeCompare(b.date));
    },
    async create(e) {
      updateDb((d) => ({ ...d, events: [...d.events, { ...e, id: uid("e") }] }));
    },
    async remove(id) {
      updateDb((d) => ({ ...d, events: d.events.filter((e) => e.id !== id) }));
    },
  },

  resources: {
    async list(opts) {
      return getDb()
        .resources.filter((r) => opts?.includeDrafts || r.published)
        .sort(byNewest);
    },
    async create(r) {
      updateDb((d) => ({ ...d, resources: [{ ...r, id: uid("r"), createdAt: new Date().toISOString() }, ...d.resources] }));
    },
    async update(id, patch) {
      updateDb((d) => ({ ...d, resources: d.resources.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
    },
    async remove(id) {
      updateDb((d) => ({ ...d, resources: d.resources.filter((r) => r.id !== id) }));
    },
  },

  testimonials: {
    async list(opts) {
      return getDb()
        .testimonials.filter((t) => opts?.includeUnapproved || t.approved)
        .sort(pinnedFirst);
    },
    async create(t) {
      updateDb((d) => ({ ...d, testimonials: [...d.testimonials, { ...t, id: uid("t"), createdAt: new Date().toISOString() }] }));
    },
    async update(id, patch) {
      updateDb((d) => ({ ...d, testimonials: d.testimonials.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    },
    async remove(id) {
      updateDb((d) => ({ ...d, testimonials: d.testimonials.filter((t) => t.id !== id) }));
    },
  },

  content: {
    async get() {
      return getDb().siteContent;
    },
    async update(patch) {
      updateDb((d) => ({ ...d, siteContent: { ...d.siteContent, ...patch } }));
    },
  },

  stats: {
    async overview() {
      const d = getDb();
      const members = d.users.filter((u) => u.role === "anonymous" || u.role === "identified");
      // Sample community members who only exist as group rows still count as members
      const memberIds = new Set([...members.map((u) => u.id), ...d.groupMembers.map((m) => m.userId)]);
      const now = Date.now();
      return {
        members: memberIds.size,
        anonymousMembers: members.filter((u) => u.isAnonymous).length,
        bookings: d.appointments.filter((a) => a.status !== "declined" && a.status !== "cancelled").length,
        upcomingBookings: d.appointments.filter(
          (a) => (a.status === "upcoming" || a.status === "requested") && new Date(a.time).getTime() > now,
        ).length,
        activeGroups: new Set(d.groupMembers.map((m) => m.groupId)).size,
        verifiedTherapists: d.psychologists.filter((p) => p.verificationStatus === "verified").length,
        pendingTherapists: d.psychologists.filter((p) => p.verificationStatus === "pending").length,
      };
    },
  },
};
