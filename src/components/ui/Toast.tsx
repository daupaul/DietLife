"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastType = "success" | "error" | "info" | "loading";

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

const STYLE: Record<
  ToastType,
  { icon: typeof Info; ring: string; accent: string; spin?: boolean }
> = {
  success: {
    icon: CheckCircle2,
    ring: "border-success/30",
    accent: "text-success",
  },
  error: { icon: XCircle, ring: "border-danger/30", accent: "text-danger" },
  info: { icon: Info, ring: "border-line", accent: "text-accent" },
  loading: {
    icon: Loader2,
    ring: "border-line",
    accent: "text-accent",
    spin: true,
  },
};

interface ToastContextValue {
  toast: (input: {
    type?: ToastType;
    message: string;
    duration?: number;
  }) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ type = "info", message, duration = 3000 }) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      // loading toasts persist until explicitly dismissed.
      if (type !== "loading" && duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
      return id;
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        role="region"
        aria-label="通知"
      >
        {toasts.map(({ id, type, message }) => {
          const { icon: Icon, ring, accent, spin } = STYLE[type];
          return (
            <div
              key={id}
              role="status"
              className={cn(
                "bg-card rounded-card shadow-float pointer-events-auto flex w-full max-w-md items-center gap-2.5 border px-4 py-3",
                ring,
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  accent,
                  spin && "animate-spin",
                )}
                strokeWidth={2.5}
                aria-hidden
              />
              <span className="type-body text-foreground flex-1">
                {message}
              </span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
