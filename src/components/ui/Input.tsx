import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  /** Trailing unit, e.g. "kg" / "kcal". */
  suffix?: string;
}

export function Input({
  label,
  hint,
  error,
  suffix,
  className,
  ...props
}: InputProps) {
  return (
    <label className="block">
      {label && (
        <span className="type-caption text-muted mb-1 block">{label}</span>
      )}
      <span className="relative flex items-center">
        <input
          className={cn(
            "bg-card border-line rounded-control type-body h-12 w-full border px-3",
            "placeholder:text-subtle",
            "focus:border-indigo focus:ring-indigo/30 focus:ring-2 focus-visible:outline-none",
            error && "border-danger focus:border-danger focus:ring-danger/30",
            suffix && "pr-12",
            className,
          )}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {suffix && (
          <span className="text-muted type-caption pointer-events-none absolute right-3">
            {suffix}
          </span>
        )}
      </span>
      {error ? (
        <span className="text-danger type-caption mt-1 block">{error}</span>
      ) : hint ? (
        <span className="text-subtle type-caption mt-1 block">{hint}</span>
      ) : null}
    </label>
  );
}
