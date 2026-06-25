"use client";

import { Button, Card } from "@/components/ui";

/** Friendly branded fallback for render errors (instead of the black page). */
export function ErrorView({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-6">
      <Card size="lg" className="w-full text-center">
        <h1 className="type-h1 text-foreground">出了點狀況</h1>
        <p className="type-body text-muted mt-2">
          頁面載入時發生問題，請再試一次。
        </p>
        <Button fullWidth className="mt-5" onClick={reset}>
          重新整理
        </Button>
      </Card>
    </main>
  );
}
