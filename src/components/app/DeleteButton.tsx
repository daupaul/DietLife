"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui";
import type { ActionResult } from "@/lib/data/types";

export interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<ActionResult>;
  confirmText?: string;
  label?: string;
}

/** Reusable delete control for log rows. Confirms, then toasts result. */
export function DeleteButton({
  id,
  action,
  confirmText = "確定要刪除這筆紀錄嗎？",
  label = "刪除",
}: DeleteButtonProps) {
  const { toast } = useToast();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      aria-label={label}
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmText)) return;
        start(async () => {
          const res = await action(id);
          if (!res.ok) toast({ type: "error", message: res.error });
          else toast({ type: "success", message: "已刪除" });
        });
      }}
      className="text-subtle hover:text-danger rounded-control flex size-11 shrink-0 items-center justify-center transition disabled:opacity-50"
    >
      <Trash2 className="size-5" strokeWidth={2.5} />
    </button>
  );
}
