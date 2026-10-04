"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe, LogOut, RotateCcw, Settings } from "lucide-react";
import { Avatar } from "@/components/brand/avatar";
import { toast } from "@/components/common/toaster";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { resetDemoData } from "@/lib/data";
import { displayName, useCurrentUser } from "@/lib/demo";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Who is signed in, settings and log out. Replaces any public link to the dashboards. */
export function AccountMenu({ className, variant = "pill" }: { className?: string; variant?: "pill" | "card" }) {
  const { t } = useI18n();
  const router = useRouter();
  const { user, role } = useCurrentUser();
  const name = displayName(user);

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
        aria-label={`${t("roles.signedInAs")} ${name}`}
      >
        {user ? (
          <Avatar name={name} color={user.avatarColor} className={variant === "pill" ? "size-8 text-xs" : "size-9 text-xs"} />
        ) : (
          <span className="size-8 rounded-full bg-border" />
        )}
        <span className={cn("min-w-0 flex-1", variant === "pill" && "hidden md:block")}>
          <span className="block truncate text-sm font-bold leading-tight">{name}</span>
          <span className="block text-[0.7rem] font-semibold uppercase tracking-wider text-muted">{t(`roles.${role}`)}</span>
        </span>
        <ChevronDown className="size-4 text-muted" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          {t("roles.signedInAs")} <span className="font-bold text-text">{name}</span>
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/app/me">
            <Settings /> {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/">
            <Globe /> Ituze · {t("nav.home")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            if (window.confirm(`${t("me.resetDemo")}?`)) {
              resetDemoData();
              toast(t("me.resetDone"));
            }
          }}
        >
          <RotateCcw /> {t("me.resetDemo")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await auth.signOut();
            router.push("/login");
          }}
        >
          <LogOut /> {t("nav.logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
