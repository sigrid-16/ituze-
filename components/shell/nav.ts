import {
  BookOpen,
  CalendarDays,
  HeartHandshake,
  House,
  LayoutDashboard,
  Newspaper,
  NotebookPen,
  Quote,
  Settings,
  Stethoscope,
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
  /** Hide from the phone bottom tabs (still in the sidebar and account menu) */
  desktopOnly?: boolean;
}

const USER_NAV: NavItem[] = [
  { href: "/app", labelKey: "nav.home", icon: House, exact: true },
  { href: "/app/journal", labelKey: "nav.journal", icon: NotebookPen },
  { href: "/app/community", labelKey: "nav.community", icon: UsersRound },
  { href: "/app/support", labelKey: "nav.support", icon: HeartHandshake },
  { href: "/app/resources", labelKey: "nav.resources", icon: BookOpen },
  { href: "/app/me", labelKey: "nav.me", icon: Settings, desktopOnly: true },
];

const THERAPIST_NAV: NavItem[] = [
  { href: "/app/psychologist", labelKey: "nav.dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/psychologist/schedule", labelKey: "nav.schedule", icon: CalendarDays },
  { href: "/app/psychologist/profile", labelKey: "nav.profile", icon: UserRound },
  { href: "/app/me", labelKey: "nav.me", icon: Settings },
];

const ORGANIZER_NAV: NavItem[] = [
  { href: "/app/admin", labelKey: "nav.overview", icon: LayoutDashboard, exact: true },
  { href: "/app/admin/community", labelKey: "nav.community", icon: UsersRound },
  { href: "/app/admin/content", labelKey: "nav.content", icon: Newspaper },
  { href: "/app/admin/testimonials", labelKey: "nav.testimonials", icon: Quote },
  { href: "/app/admin/therapists", labelKey: "nav.therapists", icon: Stethoscope },
  { href: "/app/me", labelKey: "nav.me", icon: Settings, desktopOnly: true },
];

export function navFor(role: Role): NavItem[] {
  if (role === "psychologist") return THERAPIST_NAV;
  if (role === "admin") return ORGANIZER_NAV;
  return USER_NAV;
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
