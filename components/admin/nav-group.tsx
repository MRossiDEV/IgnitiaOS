"use client";

// ======================================================
// Collapsible nav group
// components/admin/nav-group.tsx
// ======================================================
// The admin sidebar nav (app/admin/layout.tsx) was a flat NavItem
// list with no grouping — this wraps @radix-ui/react-collapsible
// (already a dependency, previously unused) around a set of
// NavItems, matching NavItem's own styling conventions.

import * as React from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroupProps {
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function NavGroup({ icon, label, collapsed = false, defaultOpen = false, children }: NavGroupProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  if (collapsed) {
    return <div className="flex items-center justify-center py-1.5 text-zinc-400">{icon}</div>;
  }

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-all",
            "hover:bg-white/5 hover:text-white text-zinc-400"
          )}
        >
          <div className="flex items-center justify-center transition-all group-hover:text-white">{icon}</div>
          <span className="truncate">{label}</span>
          <ChevronDown size={14} className={cn("ml-auto transition-transform", open && "rotate-180")} />
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content className="space-y-1 pl-6 pt-0.5">{children}</Collapsible.Content>
    </Collapsible.Root>
  );
}
