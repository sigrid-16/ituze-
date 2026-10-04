"use client";

import * as React from "react";
import { DropdownMenu as M } from "radix-ui";
import { cn } from "@/lib/utils";

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuRadioGroup = M.RadioGroup;

export function DropdownMenuContent({ className, sideOffset = 8, ...props }: React.ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        sideOffset={sideOffset}
        className={cn("z-50 min-w-56 rounded-2xl border border-border bg-surface p-1.5 shadow-lg animate-rise", className)}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }: React.ComponentProps<typeof M.Item>) {
  return (
    <M.Item
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-primary-soft [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof M.RadioItem>) {
  return (
    <M.RadioItem
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none data-[highlighted]:bg-primary-soft data-[state=checked]:font-bold data-[state=checked]:text-primary",
        className,
      )}
      {...props}
    >
      {children}
    </M.RadioItem>
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof M.Label>) {
  return <M.Label className={cn("px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wider text-muted", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn("my-1 h-px bg-border", className)} {...props} />;
}
