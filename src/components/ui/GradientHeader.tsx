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
    <header className="bg-brand-gradient rounded-b-card-lg shadow-float relative overflow-hidden px-5 pt-6 pb-7 text-white">
      {/* soft light sheen */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_-10%,rgba(255,255,255,0.28),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25 backdrop-blur-sm"
            aria-hidden
          >
            🐟
          </span>
          <div>
            <h1 className="type-h1">{title}</h1>
            {subtitle && (
              <p className="type-caption text-white/75">{subtitle}</p>
            )}
          </div>
        </div>
        <div
          className="rounded-pill flex items-center gap-1.5 bg-white/15 px-2.5 py-1 ring-1 ring-white/20 backdrop-blur-sm"
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
