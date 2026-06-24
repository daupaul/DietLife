// Placeholder home — real five-tab screens (儀表/體重/飲食/運動/設定) are built
// in Phase 3. This only confirms the Phase 0 skeleton renders.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-5xl" aria-hidden>
        🐟
      </span>
      <h1 className="text-2xl font-bold tracking-tight">DietLife 飲控生活</h1>
      <p className="text-sm text-slate-500">
        Phase 0 骨架就緒。設計系統與功能畫面將於後續階段建置。
      </p>
      <p className="font-mono text-xs text-slate-400">
        Next.js 16 · TypeScript · Tailwind v4 · Supabase
      </p>
    </main>
  );
}
