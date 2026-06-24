"use client";

import { useState } from "react";
import {
  Dumbbell,
  Flame,
  LayoutDashboard,
  Scale,
  Settings,
  Smartphone,
  Utensils,
} from "lucide-react";
import {
  AnimatedCheckbox,
  Badge,
  Button,
  Card,
  CustomDateTimePicker,
  FavoriteFoodItem,
  GradientHeader,
  Input,
  MacroBar,
  MicroBar,
  ProgressBar,
  Select,
  StatCard,
  TabNav,
  ToastProvider,
  useToast,
  type SyncState,
  type TabItem,
} from "@/components/ui";
import { cn } from "@/lib/cn";

// ── reference data ──────────────────────────────────────────────
const COLORS: { name: string; cls: string; dark?: boolean }[] = [
  { name: "background", cls: "bg-background" },
  { name: "card", cls: "bg-card" },
  { name: "foreground", cls: "bg-foreground", dark: true },
  { name: "muted", cls: "bg-muted", dark: true },
  { name: "subtle", cls: "bg-subtle", dark: true },
  { name: "line", cls: "bg-line" },
  { name: "indigo", cls: "bg-indigo", dark: true },
  { name: "violet", cls: "bg-violet", dark: true },
  { name: "blue", cls: "bg-blue", dark: true },
  { name: "success", cls: "bg-success", dark: true },
  { name: "success-soft", cls: "bg-success-soft" },
  { name: "sport", cls: "bg-sport", dark: true },
  { name: "danger", cls: "bg-danger", dark: true },
  { name: "carbs", cls: "bg-carbs", dark: true },
  { name: "fat", cls: "bg-fat", dark: true },
  { name: "indigo-bg", cls: "bg-indigo-bg" },
  { name: "violet-bg", cls: "bg-violet-bg" },
  { name: "blue-bg", cls: "bg-blue-bg" },
  { name: "success-bg", cls: "bg-success-bg" },
  { name: "sport-bg", cls: "bg-sport-bg" },
  { name: "danger-bg", cls: "bg-danger-bg" },
];

const TYPES: { name: string; cls: string }[] = [
  { name: "type-display", cls: "type-display" },
  { name: "type-h1", cls: "type-h1" },
  { name: "type-h2", cls: "type-h2" },
  { name: "type-title", cls: "type-title" },
  { name: "type-body", cls: "type-body" },
  { name: "type-body-strong", cls: "type-body-strong" },
  { name: "type-caption", cls: "type-caption" },
  { name: "type-nav", cls: "type-nav" },
];

const DATA_TYPES: { name: string; cls: string }[] = [
  { name: "type-data-lg", cls: "type-data-lg" },
  { name: "type-data-md", cls: "type-data-md" },
  { name: "type-data-sm", cls: "type-data-sm" },
];

const RADII: { name: string; cls: string }[] = [
  { name: "rounded-control (12)", cls: "rounded-control" },
  { name: "rounded-card (16)", cls: "rounded-card" },
  { name: "rounded-card-lg (24)", cls: "rounded-card-lg" },
  { name: "rounded-pill", cls: "rounded-pill" },
];

const SHADOWS: { name: string; cls: string }[] = [
  { name: "shadow-card", cls: "shadow-card" },
  { name: "shadow-float", cls: "shadow-float" },
  { name: "shadow-nav", cls: "shadow-nav" },
];

const TABS: TabItem[] = [
  { href: "/dashboard", label: "儀表", icon: LayoutDashboard },
  { href: "/weight", label: "體重", icon: Scale },
  { href: "/diet", label: "飲食", icon: Utensils },
  { href: "/exercise", label: "運動", icon: Dumbbell },
  { href: "/settings", label: "設定", icon: Settings },
];

const SYNC_STATES: SyncState[] = ["synced", "syncing", "offline", "error"];

// ── small layout helpers ────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="type-h2 text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// ── component showcase (inside ToastProvider) ───────────────────
function Showcase() {
  const { toast } = useToast();
  const [sync, setSync] = useState(0);
  const [activeTab, setActiveTab] = useState("/dashboard");
  const [when, setWhen] = useState("2026-01-01T08:00");
  const [saveFav, setSaveFav] = useState(false);

  return (
    <div className="pb-16">
      <GradientHeader
        title="DietLife 飲控生活"
        subtitle="設計系統活文件 · Styleguide"
        sync={SYNC_STATES[sync]}
      />

      <div className="px-4">
        <Section title="GradientHeader · 同步指示燈">
          <div className="flex flex-wrap gap-2">
            {SYNC_STATES.map((s, i) => (
              <Button
                key={s}
                variant={i === sync ? "primary" : "secondary"}
                size="sm"
                onClick={() => setSync(i)}
              >
                {s}
              </Button>
            ))}
          </div>
        </Section>

        <Section title="TabNav（置頂毛玻璃 · 五頁等寬）">
          <TabNav items={TABS} activeOverride={activeTab} />
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <Button
                key={t.href}
                variant={activeTab === t.href ? "primary" : "secondary"}
                size="sm"
                onClick={() => setActiveTab(t.href)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        </Section>

        <Section title="顏色 Tokens">
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => (
              <div key={c.name}>
                <div
                  className={cn(
                    "border-line rounded-control h-12 w-full border",
                    c.cls,
                  )}
                />
                <span className="type-caption text-muted mt-1 block break-all">
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="字級 Type Scale">
          <Card>
            <div className="space-y-2">
              {TYPES.map((t) => (
                <div key={t.name} className="flex items-baseline gap-3">
                  <span className={cn(t.cls, "text-foreground")}>
                    飲控生活 Aa 123
                  </span>
                  <span className="type-caption text-subtle font-mono">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              {DATA_TYPES.map((t) => (
                <div key={t.name} className="flex items-baseline gap-3">
                  <span className={cn(t.cls, "text-foreground")}>1,850</span>
                  <span className="type-caption text-subtle font-mono">
                    {t.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section title="圓角 Radii">
          <div className="grid grid-cols-2 gap-3">
            {RADII.map((r) => (
              <div key={r.name}>
                <div className={cn("bg-indigo-bg h-16 w-full", r.cls)} />
                <span className="type-caption text-muted mt-1 block">
                  {r.name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="陰影 Shadows">
          <div className="grid grid-cols-3 gap-3">
            {SHADOWS.map((s) => (
              <div key={s.name}>
                <div
                  className={cn("bg-card rounded-card h-16 w-full", s.cls)}
                />
                <span className="type-caption text-muted mt-1 block">
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Button">
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">主要</Button>
            <Button variant="secondary">次要</Button>
            <Button variant="ghost">幽靈</Button>
            <Button variant="danger">刪除</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">小</Button>
            <Button size="md">中</Button>
            <Button size="lg">大</Button>
            <Button disabled>停用</Button>
          </div>
          <Button fullWidth>整寬按鈕</Button>
        </Section>

        <Section title="StatCard（四底色變體）">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              variant="bmr"
              label="BMR"
              value={1480}
              unit="kcal"
              icon={<Flame className="size-4" strokeWidth={2.5} />}
            />
            <StatCard
              variant="tdee"
              label="動態 TDEE"
              value={2290}
              unit="kcal"
            />
            <StatCard
              variant="intake"
              label="今日攝取"
              value={1850}
              unit="kcal"
            />
            <StatCard
              variant="exercise"
              label="運動消耗"
              value={320}
              unit="kcal"
            />
          </div>
        </Section>

        <Section title="ProgressBar（漸層 + 鈉超標警示）">
          <Card>
            <div className="space-y-4">
              <ProgressBar
                label="今日熱量"
                value={1850}
                max={2290}
                readout="1850 / 2290 kcal"
              />
              <ProgressBar
                label="鈉"
                value={2600}
                max={2000}
                readout="2600 / 2000 mg"
                warnText="鈉已超標，請留意"
              />
            </div>
          </Card>
        </Section>

        <Section title="MacroBar / MicroBar">
          <Card>
            <div className="space-y-3">
              <MacroBar macro="protein" value={88} max={120} />
              <MacroBar macro="carbs" value={210} max={250} />
              <MacroBar macro="fat" value={55} max={65} />
              <MacroBar macro="fiber" value={18} max={30} />
              <div className="border-line mt-2 border-t pt-3">
                <MicroBar
                  label="纖維"
                  value={18}
                  max={30}
                  unit="g"
                  tone="success"
                />
              </div>
              <MicroBar label="鈉" value={2600} max={2000} unit="mg" warn />
            </div>
          </Card>
        </Section>

        <Section title="Input / Select">
          <Card>
            <div className="space-y-3">
              <Input label="食物名稱" placeholder="例如：雞胸肉便當" />
              <Input
                label="熱量"
                type="number"
                inputMode="decimal"
                placeholder="0"
                suffix="kcal"
                hint="數值欄位使用 decimal 鍵盤"
              />
              <Input
                label="體重"
                value="不合理"
                error="請輸入有效數字"
                readOnly
              />
              <Select label="類別" defaultValue="">
                <option value="" disabled>
                  選擇類別
                </option>
                <option>早餐</option>
                <option>午餐</option>
                <option>晚餐</option>
                <option>點心</option>
              </Select>
            </div>
          </Card>
        </Section>

        <Section title="CustomDateTimePicker（年月日時分 · h-12 對齊）">
          <Card>
            <CustomDateTimePicker
              label="記錄時間"
              value={when}
              onChange={setWhen}
            />
            <p className="type-caption text-subtle mt-2 font-mono">{when}</p>
          </Card>
        </Section>

        <Section title="AnimatedCheckbox（勾選滑動展開下拉）">
          <Card>
            <AnimatedCheckbox
              checked={saveFav}
              onCheckedChange={setSaveFav}
              label="⭐ 同步存常用食物"
            >
              <Select label="歸類到" defaultValue="">
                <option value="" disabled>
                  選擇類別
                </option>
                <option>早餐</option>
                <option>午餐</option>
                <option>晚餐</option>
                <option>點心</option>
              </Select>
            </AnimatedCheckbox>
          </Card>
        </Section>

        <Section title="Badge / Pill">
          <div className="flex flex-wrap gap-2">
            <Badge tone="neutral">中性</Badge>
            <Badge tone="indigo">早餐</Badge>
            <Badge tone="success">達標</Badge>
            <Badge tone="sport">運動</Badge>
            <Badge tone="danger">超標</Badge>
          </div>
        </Section>

        <Section title="FavoriteFoodItem（填入 / ⚡帶入）">
          <FavoriteFoodItem
            food={{ name: "雞胸肉便當", category: "午餐", calories: 620 }}
            onFill={() => toast({ type: "info", message: "已填入表單" })}
            onQuickAdd={() =>
              toast({ type: "success", message: "已新增一筆飲食紀錄" })
            }
          />
        </Section>

        <Section title="Toast（loading / success / error / info）">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ type: "success", message: "儲存成功" })}
            >
              success
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({ type: "error", message: "儲存失敗，請重試" })
              }
            >
              error
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast({ type: "info", message: "這是一則提示" })}
            >
              info
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const id = toast({ type: "loading", message: "同步中…" });
                setTimeout(() => {
                  // demo: replace loading with success after a beat
                  toast({ type: "success", message: "同步完成" });
                }, 1200);
                void id;
              }}
            >
              loading
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default function StyleguidePage() {
  // Mobile-first acceptance: default to a 375px (iPhone SE) frame.
  const [mobile, setMobile] = useState(true);

  return (
    <div className="min-h-dvh">
      <div className="border-line bg-card sticky top-0 z-50 flex items-center justify-between border-b px-4 py-3">
        <span className="type-title text-foreground">Styleguide</span>
        <Button
          size="sm"
          variant={mobile ? "primary" : "secondary"}
          onClick={() => setMobile((m) => !m)}
        >
          <Smartphone className="size-4" strokeWidth={2.5} />
          {mobile ? "375px 檢視" : "全寬檢視"}
        </Button>
      </div>

      <div
        className={cn(
          "mx-auto",
          mobile
            ? "border-line rounded-card-lg shadow-float my-6 w-[375px] overflow-hidden border"
            : "w-full max-w-md",
        )}
      >
        <ToastProvider>
          <Showcase />
        </ToastProvider>
      </div>
    </div>
  );
}
