import {
  BarChart3,
  CalendarDays,
  HeartHandshake,
  House,
  LayoutDashboard,
  NotebookPen,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/data/types";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  /** Match only the exact path (for index routes) */
  exact?: boolean;
}

const MEMBER_NAV: NavItem[] = [
  { href: "/app", labelKey: "nav.home", icon: House, exact: true },
  { href: "/app/journal", labelKey: "nav.journal", icon: NotebookPen },
  { href: "/app/support", labelKey: "nav.support", icon: HeartHandshake },
  { href: "/app/cohort", labelKey: "nav.cohort", icon: UsersRound },
  { href: "/app/me", labelKey: "nav.me", icon: UserRound },
];

const PSYCHOLOGIST_NAV: NavItem[] = [
  { href: "/app/psychologist", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/psychologist/schedule", labelKey: "nav.schedule", icon: CalendarDays },
  { href: "/app/psychologist/cohorts", labelKey: "nav.cohorts", icon: UsersRound },
  { href: "/app/me", labelKey: "nav.me", icon: UserRound },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/app/admin", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/admin/verification", labelKey: "nav.verification", icon: ShieldCheck },
  { href: "/app/admin/cohorts", labelKey: "nav.cohorts", icon: UsersRound },
  { href: "/app/admin/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/app/me", labelKey: "nav.me", icon: UserRound },
];

export function navFor(role: Role): NavItem[] {
  if (role === "psychologist") return PSYCHOLOGIST_NAV;
  if (role === "admin") return ADMIN_NAV;
  return MEMBER_NAV;
}

export function isActive(item: NavItem, pathname: string) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Which roles may open a given app path (demo-level access control). */
export function rolesForPath(pathname: string): Role[] | null {
  if (pathname.startsWith("/app/admin")) return ["admin"];
  if (pathname.startsWith("/app/psychologist")) return ["psychologist"];
  if (pathname === "/app/me") return null;
  return ["anonymous", "identified"];
}
