"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  collapsed?: boolean;
  active?: boolean;
  onClick?: () => void;
};

export function NavItem({
  href,
  icon,
  children,
  collapsed = false,
  active = false,
  onClick,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-sm transition-all",
        "hover:bg-white/5 hover:text-white",
        active ? "bg-white/10 text-white" : "text-zinc-400",
        collapsed && "justify-center px-1.5"
      )}
    >
      {/* ICON */}
      <div
        className={cn(
          "flex items-center justify-center transition-all",
          active && "text-cyan-400",
          "group-hover:text-white"
        )}
      >
        {icon}
      </div>

      {/* LABEL */}
      {!collapsed && (
        <span className="truncate">{children}</span>
      )}

      {/* ACTIVE DOT */}
      {active && !collapsed && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
      )}
    </Link>
  );
}