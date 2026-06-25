"use client";

import { ErrorView } from "@/components/app/ErrorView";

// Catches render errors anywhere under app/ (dashboard, diet, login, …) and
// shows a branded fallback + retry instead of the default error page.
export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorView reset={reset} />;
}
