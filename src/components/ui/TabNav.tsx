"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TabItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface TabNavProps {
  items: TabItem[];
  /** Force an active href (for the styleguide / previews). */
  activeOverride?: string;
}

/** Sticky frosted top nav: five equal-width tabs, 2.5px icons + 11px labels. */
export function TabNav({ items, activeOverride }: TabNavProps) {
  const pathname = usePathname();
  const active = activeOverride ?? pathname;

  return (
    <nav className="border-line bg-card/80 sticky top-0 z-40 border-b backdrop-blur-lg">
      <ul className="mx-auto flex max-w-md">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = active === href || active.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-1 py-2 transition-colors",
                  isActive ? "text-accent" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "rounded-pill flex h-7 w-12 items-center justify-center transition-colors",
                    isActive && "bg-accent-soft",
                  )}
                >
                  <Icon className="size-5" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="type-nav">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
