import { getDb, updateDb } from "./mock-store";
import type { DataSource } from "./source";
import type { GoalCheckin } from "./types";

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
const byNewest = <T extends { createdAt: string }>(a: T, b: T) => b.createdAt.localeCompare(a.createdAt);

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
  },

  appointments: {
    async listForMember(userId) {
      return getDb()
        .appointments.filter((a) => a.memberId === userId)
        .sort((a, b) => a.time.localeCompare(b.time));
    },
  },

  cohorts: {
    async forMember(userId) {
      const d = getDb();
      const membership = d.cohortMembers.find((m) => m.userId === userId);
      if (membership) {
        const cohort = d.cohorts.find((c) => c.id === membership.cohortId)!;
        const facilitator = d.psychologists.find((p) => p.id === cohort.facilitatorId);
        const status = cohort.status === "forming" ? "assigned" : cohort.status === "active" ? "active" : "graduated";
        return { status, cohort, facilitator };
      }
      const waitlist = d.waitlistEntries.find((w) => w.userId === userId);
      return waitlist ? { status: "waiting", waitlist } : { status: "none" };
    },
    async messages(cohortId) {
      return getDb()
        .cohortMessages.filter((m) => m.cohortId === cohortId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  },
};
