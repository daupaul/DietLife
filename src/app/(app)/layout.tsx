import { AppTabNav } from "@/components/app/AppTabNav";
import { AppHeader, ToastProvider } from "@/components/ui";
import { requireUser } from "@/lib/auth/user";

// Shared shell for the five authenticated tabs.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();

  return (
    <ToastProvider>
      <div className="flex min-h-dvh flex-col">
        <AppHeader sync="synced" />
        <AppTabNav />
        <main className="mx-auto w-full max-w-md flex-1 px-4 py-4">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
