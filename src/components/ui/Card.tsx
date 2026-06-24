import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** `lg` uses the 24px radius + roomier padding for feature cards. */
  size?: "default" | "lg";
}

export function Card({ size = "default", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card shadow-card",
        size === "lg" ? "rounded-card-lg p-6" : "rounded-card p-4",
        className,
      )}
      {...props}
    />
  );
}
