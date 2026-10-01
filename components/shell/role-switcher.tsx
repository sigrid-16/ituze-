"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Check, EyeOff, Home, RotateCcw, ShieldCheck, Sparkles, Stethoscope, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/brand/avatar";
import { resetDemoData } from "@/lib/data";
import { displayName, ROLE_HOME, switchRole, useCurrentUser } from "@/lib/demo";
import type { Role } from "@/lib/data/types";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const ROLE_META: Record<Role, { icon: typeof UserRound; tone: string }> = {
  anonymous: { icon: EyeOff, tone: "bg-primary-soft text-primary" },
  identified: { icon: UserRound, tone: "bg-accent-soft text-accent-strong" },
  psychologist: { icon: Stethoscope, tone: "bg-primary-soft text-primary" },
  admin: { icon: ShieldCheck, tone: "bg-accent-soft text-accent-strong" },
};

export const ROLES: Role[] = ["anonymous", "identified", "psychologist", "admin"];

export function RoleSwitcher({ className, variant = "pill" }: { className?: string; variant?: "pill" | "card" }) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, role } = useCurrentUser();
  const Icon = ROLE_META[role].icon;

  const choose = (r: Role) => {
    switchRole(r);
    router.push(ROLE_HOME[r]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex cursor-pointer items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
          variant === "pill"
            ? "h-10 rounded-full border border-border bg-surface pl-1 pr-2.5 hover:bg-primary-soft/50"
            : "w-full rounded-2xl border border-border bg-surface p-2.5 hover:bg-primary-soft/40",
          className,
        )}
        aria-label={t("roles.switchRole")}
      >
        {user ? (
          <Avatar name={displayName(user)} color={user.avatarColor} className={variant === "pill" ? "size-8 text-xs" : "size-9 text-xs"} />
        ) : (
          <span className="size-8 rounded-full bg-border" />
        )}
        <span className={cn("min-w-0 flex-1", variant === "pill" && "hidden md:block")}>
          <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{t("roles.viewingAs")}</span>
          <span className="flex items-center gap-1 text-sm font-bold leading-tight">
            <Icon className="size-3.5 shrink-0" />
            {t(`roles.${role}`)}
          </span>
        </span>
        <ChevronDown className="size-4 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center gap-1.5">
          <Sparkles className="size-3.5" /> {t("roles.switchRole")}
        </DropdownMenuLabel>
        {ROLES.map((r) => {
          const M = ROLE_META[r];
          return (
            <DropdownMenuItem key={r} onSelect={() => choose(r)} className="items-start py-2.5">
              <span className={cn("mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full", M.tone)}>
                <M.icon className="!size-4" />
              </span>
              <span className="flex-1">
                <span className="block font-bold">{t(`roles.${r}`)}</span>
                <span className="block text-xs text-muted">{t(`roles.${r}Desc`)}</span>
              </span>
              {r === role && <Check className="mt-1 text-primary" />}
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding">
            <Sparkles /> {t("demo.startOnboarding")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            if (window.confirm(`${t("demo.reset")}?`)) resetDemoData();
          }}
        >
          <RotateCcw /> {t("demo.reset")}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <Home /> {t("demo.backToSite")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
