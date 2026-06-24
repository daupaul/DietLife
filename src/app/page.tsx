import Link from "next/link";
import { requireUser } from "@/lib/auth/user";
import { getProfile } from "@/lib/data/queries";
import { signOut } from "@/lib/auth/actions";
import { Button, Card } from "@/components/ui";

// Placeholder home — real five-tab screens (儀表/體重/飲食/運動/設定) are built
// in Phase 3. For now it proves the auth + RLS data loop works end to end.
export default async function Home() {
  const user = await requireUser();
  const profile = await getProfile();

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-5xl" aria-hidden>
          🐟
        </span>
        <h1 className="type-h1 text-foreground">DietLife 飲控生活</h1>
        <p className="type-caption text-muted">
          Phase 2 完成：認證 + 資料層就緒，功能畫面將於 Phase 3 建置。
        </p>
      </div>

      <Card>
        <div className="space-y-1">
          <p className="type-caption text-muted">已登入</p>
          <p className="type-body-strong text-foreground break-all">
            {user.email}
          </p>
          <p className="type-caption text-muted">
            個人檔案：{profile ? "已建立 ✓" : "尚未建立"}
          </p>
        </div>
      </Card>

      <div className="flex flex-col gap-2">
        <Link href="/styleguide">
          <Button variant="secondary" fullWidth>
            查看設計系統 /styleguide
          </Button>
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" fullWidth>
            登出
          </Button>
        </form>
      </div>
    </main>
  );
}
