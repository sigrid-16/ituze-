"use client";

/**
 * Authentication boundary.
 *
 * Demo mode: there are no passwords. Each Log In card signs straight into a
 * demo account for that access type, filled with sample data.
 *
 * To add real authentication later (e.g. Supabase Auth), implement
 * `AuthAdapter` with real credentials and export it as `auth` below. The UI
 * only uses `auth.signIn`, `auth.signOut` and `useSession`, so no page needs
 * to change. Therapist and organizer accounts are created by an organizer;
 * only users can sign up publicly.
 */
import { DEMO_USER_IDS } from "@/data/seed";
import type { Role } from "@/lib/data/types";
import { updateSettings, useHydrated, useSettings } from "@/lib/settings";

/** The three doors on the Log In page. */
export type AccessType = "user" | "therapist" | "organizer";

export interface Session {
  userId: string;
  role: Role;
  access: AccessType;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface AuthAdapter {
  /** Demo mode ignores credentials; a real adapter verifies them. */
  signIn(access: AccessType, credentials?: Credentials): Promise<Session>;
  /** Public sign-up is for users only. */
  signUpUser(opts: { anonymous: boolean }): Promise<Session>;
  signOut(): Promise<void>;
}

export const ACCESS_ROLE: Record<AccessType, Role> = {
  user: "identified",
  therapist: "psychologist",
  organizer: "admin",
};

export function accessOf(role: Role): AccessType {
  return role === "psychologist" ? "therapist" : role === "admin" ? "organizer" : "user";
}

/** Where each access type lands after signing in. */
export const ACCESS_HOME: Record<AccessType, string> = {
  user: "/app",
  therapist: "/app/psychologist",
  organizer: "/app/admin",
};

function sessionFor(role: Role): Session {
  return { userId: DEMO_USER_IDS[role], role, access: accessOf(role) };
}

const demoAuth: AuthAdapter = {
  async signIn(access) {
    const role = ACCESS_ROLE[access];
    updateSettings({ role, signedIn: true });
    return sessionFor(role);
  },
  async signUpUser({ anonymous }) {
    const role: Role = anonymous ? "anonymous" : "identified";
    updateSettings({ role, signedIn: true });
    return sessionFor(role);
  },
  async signOut() {
    updateSettings({ signedIn: false });
  },
};

export const auth: AuthAdapter = demoAuth;

/** Current session, or null when signed out. `ready` is false until hydrated. */
export function useSession(): { session: Session | null; ready: boolean } {
  const { role, signedIn } = useSettings();
  const ready = useHydrated();
  return { session: ready && signedIn ? sessionFor(role) : null, ready };
}
