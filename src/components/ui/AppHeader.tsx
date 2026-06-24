import { Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

export type SyncState = "synced" | "syncing" | "offline" | "error";

const SYNC: Record<SyncState, { label: string; dot: string; pulse?: boolean }> =
  {
    synced: { label: "已同步", dot: "bg-success" },
    syncing: { label: "同步中", dot: "bg-accent", pulse: true },
    offline: { label: "離線", dot: "bg-subtle" },
    error: { label: "同步失敗", dot: "bg-danger" },
  };

export interface AppHeaderProps {
  /** Serif wordmark. */
  title?: string;
  /** Small uppercase eyebrow above the wordmark. */
  subtitle?: string;
  sync?: SyncState;
}

/**
 * Quiet editorial header on the warm canvas (no gradient chrome): a small
 * app mark, an eyebrow + serif wordmark, and an understated sync indicator.
 */
export function AppHeader({
  title = "DietLife",
  subtitle = "飲控生活",
  sync = "synced",
}: AppHeaderProps) {
  const { label, dot, pulse } = SYNC[sync];
  return (
    <header className="px-5 pt-5 pb-2">
      <div className="mx-auto flex max-w-md items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="bg-accent-soft text-accent flex size-9 items-center justify-center rounded-xl"
            aria-hidden
          >
            <Leaf className="size-5" strokeWidth={2} />
          </span>
          <div className="leading-none">
            {subtitle && (
              <p className="type-overline text-accent mb-0.5">{subtitle}</p>
            )}
            <h1 className="type-h1 text-foreground">{title}</h1>
          </div>
        </div>

        <div
          className="text-muted flex items-center gap-1.5"
          role="status"
          aria-label={`雲端同步狀態：${label}`}
        >
          <span
            className={cn(
              "rounded-pill size-1.5",
              dot,
              pulse && "animate-pulse",
            )}
            aria-hidden
          />
          <span className="type-caption">{label}</span>
        </div>
      </div>
    </header>
  );
}
