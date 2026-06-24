import { Cloud, CloudOff, RefreshCw, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type SyncState = "synced" | "syncing" | "offline" | "error";

const SYNC: Record<
  SyncState,
  { icon: typeof Cloud; label: string; dot: string; spin?: boolean }
> = {
  synced: { icon: Cloud, label: "已同步", dot: "bg-success-soft" },
  syncing: { icon: RefreshCw, label: "同步中", dot: "bg-white", spin: true },
  offline: { icon: CloudOff, label: "離線", dot: "bg-white/50" },
  error: { icon: TriangleAlert, label: "同步失敗", dot: "bg-danger" },
};

export interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  sync?: SyncState;
}

/** Top app header: indigo→violet→blue gradient, 🐟 mark, cloud-sync light. */
export function GradientHeader({
  title,
  subtitle,
  sync = "synced",
}: GradientHeaderProps) {
  const { icon: Icon, label, dot, spin } = SYNC[sync];
  return (
    <header className="bg-brand-gradient rounded-b-card-lg px-5 py-5 text-white">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            🐟
          </span>
          <div>
            <h1 className="type-h1">{title}</h1>
            {subtitle && (
              <p className="type-caption text-white/80">{subtitle}</p>
            )}
          </div>
        </div>
        <div
          className="rounded-pill flex items-center gap-1.5 bg-white/15 px-2.5 py-1"
          role="status"
          aria-label={`雲端同步狀態：${label}`}
        >
          <span className={cn("rounded-pill size-1.5", dot)} aria-hidden />
          <Icon
            className={cn("size-4", spin && "animate-spin")}
            strokeWidth={2.5}
            aria-hidden
          />
          <span className="type-caption">{label}</span>
        </div>
      </div>
    </header>
  );
}
