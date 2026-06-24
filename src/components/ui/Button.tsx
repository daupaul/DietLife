import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

// All touch targets >= 44px tall (mobile-first guideline).
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-white shadow-card active:brightness-95",
  secondary:
    "bg-card text-foreground border border-line shadow-card active:bg-background",
  ghost: "bg-transparent text-accent active:bg-accent-soft",
  danger: "bg-danger text-white shadow-card active:brightness-95",
};

const SIZES: Record<Size, string> = {
  sm: "h-11 px-4 type-caption",
  md: "h-12 px-5 type-body-strong",
  lg: "h-14 px-6 type-body-strong",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-control inline-flex items-center justify-center gap-2 whitespace-nowrap transition active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
