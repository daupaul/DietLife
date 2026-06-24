import type { ReactNode } from "react";

export interface SectionHeaderProps {
  title: string;
  /** Optional right-aligned action (button / link / badge). */
  action?: ReactNode;
}

export function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="type-h2 text-foreground">{title}</h2>
      {action}
    </div>
  );
}
