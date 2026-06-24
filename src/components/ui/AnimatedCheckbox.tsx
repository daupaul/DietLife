"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AnimatedCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  /** Revealed (slides open) only while checked — e.g. a category Select. */
  children?: ReactNode;
}

/**
 * Checkbox whose children slide open when checked (grid-rows 0fr→1fr trick,
 * so no fixed height needed). Used for "⭐同步存常用食物" → category dropdown.
 */
export function AnimatedCheckbox({
  checked,
  onCheckedChange,
  label,
  children,
}: AnimatedCheckboxProps) {
  return (
    <div>
      <label className="flex min-h-11 cursor-pointer items-center gap-2.5">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md border transition",
            checked
              ? "bg-brand-gradient border-transparent text-white"
              : "border-line bg-card text-transparent",
          )}
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="sr-only"
        />
        <span className="type-body text-foreground">{label}</span>
      </label>

      {children != null && (
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            checked
              ? "mt-2 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">{children}</div>
        </div>
      )}
    </div>
  );
}
