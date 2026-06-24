"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DayNavProps {
  label: string;
  prevDate: string;
  nextDate: string;
  isToday: boolean;
}

/** Day browser for history (← date →). Future days are disabled. */
export function DayNav({ label, prevDate, nextDate, isToday }: DayNavProps) {
  const path = usePathname();
  const href = (d: string) => `${path}?date=${d}`;

  return (
    <div className="bg-card border-line rounded-control flex items-center justify-between border px-2 py-1">
      <Link
        href={href(prevDate)}
        scroll={false}
        aria-label="前一天"
        className="text-muted hover:text-accent flex size-10 items-center justify-center"
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
      </Link>

      <div className="flex items-center gap-3">
        {!isToday && (
          <Link href={path} scroll={false} className="type-caption text-accent">
            回今天
          </Link>
        )}
        <span className="type-body-strong text-foreground">{label}</span>
      </div>

      {isToday ? (
        <span
          aria-disabled
          className="text-subtle flex size-10 cursor-not-allowed items-center justify-center opacity-40"
        >
          <ChevronRight className="size-5" strokeWidth={2.5} />
        </span>
      ) : (
        <Link
          href={href(nextDate)}
          scroll={false}
          aria-label="後一天"
          className={cn(
            "text-muted hover:text-accent flex size-10 items-center justify-center",
          )}
        >
          <ChevronRight className="size-5" strokeWidth={2.5} />
        </Link>
      )}
    </div>
  );
}
