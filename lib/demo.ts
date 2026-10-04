"use client";

import { DEMO_USER_IDS } from "@/data/seed";
import { data, useQuery, type Role, type User } from "@/lib/data";
import { useSettings } from "@/lib/settings";

export { DEMO_USER_IDS };

export const isMemberRole = (r: Role) => r === "anonymous" || r === "identified";

/** The demo account that is currently signed in. */
export function useCurrentUser(): { user: User | undefined; role: Role; userId: string } {
  const { role } = useSettings();
  const userId = DEMO_USER_IDS[role];
  const { data: user } = useQuery(`user:${userId}`, () => data.users.get(userId));
  return { user, role, userId };
}

/** Display name respects anonymity: nickname unless the member chose to be identified. */
export function displayName(user: User | undefined): string {
  if (!user) return "";
  return user.isAnonymous ? user.nickname : (user.realName ?? user.nickname);
}

export function firstName(user: User | undefined): string {
  if (!user) return "";
  if (user.isAnonymous || !user.realName) return user.nickname;
  return user.realName.replace(/^Dr\.?\s+/, "").split(" ")[0];
}
