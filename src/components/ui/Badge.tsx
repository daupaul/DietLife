import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "indigo" | "success" | "sport" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-background text-muted",
  indigo: "bg-indigo-bg text-indigo",
  success: "bg-success-bg text-success",
  sport: "bg-sport-bg text-sport",
  danger: "bg-danger-bg text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "type-caption rounded-pill inline-flex items-center gap-1 px-2.5 py-0.5",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
