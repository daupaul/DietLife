import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Select({
  label,
  hint,
  error,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <label className="block">
      {label && (
        <span className="type-caption text-muted mb-1 block">{label}</span>
      )}
      <span className="relative flex items-center">
        <select
          className={cn(
            "bg-card border-line rounded-control type-body h-12 w-full appearance-none border px-3 pr-10",
            "focus:border-accent focus:ring-accent/30 focus:ring-2 focus-visible:outline-none",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="text-muted pointer-events-none absolute right-3 size-5"
          strokeWidth={2.5}
        />
      </span>
      {error ? (
        <span className="text-danger type-caption mt-1 block">{error}</span>
      ) : hint ? (
        <span className="text-subtle type-caption mt-1 block">{hint}</span>
      ) : null}
    </label>
  );
}
