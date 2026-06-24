"use client";

import { useState, useTransition } from "react";
import {
  Badge,
  Button,
  Card,
  Input,
  SectionHeader,
  Select,
  useToast,
} from "@/components/ui";
import { signOut } from "@/lib/auth/actions";
import {
  clearGeminiApiKey,
  setGeminiApiKey,
  updateProfile,
} from "@/lib/data/actions";
import type { Profile } from "@/types/db";

const ACTIVITY = [
  { label: "久坐（很少運動）", value: "1.2" },
  { label: "輕度活動（每週 1-3 天）", value: "1.375" },
  { label: "中度活動（每週 3-5 天）", value: "1.55" },
  { label: "高度活動（每週 6-7 天）", value: "1.725" },
  { label: "非常高度（體力勞動/運動員）", value: "1.9" },
];

const s = (v: number | null | undefined) => (v == null ? "" : String(v));

export function SettingsClient({
  profile,
  hasGeminiKey,
}: {
  profile: Profile | null;
  hasGeminiKey: boolean;
}) {
  const { toast } = useToast();
  const [pending, start] = useTransition();

  const [form, setForm] = useState({
    gender: profile?.gender ?? "",
    age: s(profile?.age),
    height: s(profile?.height),
    weight: s(profile?.weight),
    activity_level: s(profile?.activity_level),
    daily_calorie_goal: s(profile?.daily_calorie_goal),
    protein_goal: s(profile?.protein_goal),
    carbs_goal: s(profile?.carbs_goal),
    fat_goal: s(profile?.fat_goal),
    fiber_goal: s(profile?.fiber_goal),
    sodium_goal: s(profile?.sodium_goal),
  });
  const [apiKey, setApiKey] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const saveProfile = () =>
    start(async () => {
      // Only send filled fields (empty string → leave unchanged).
      const payload: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(form)) if (v !== "") payload[k] = v;
      const res = await updateProfile(payload);
      toast(
        res.ok
          ? { type: "success", message: "已儲存個人設定" }
          : { type: "error", message: res.error },
      );
    });

  const saveKey = () =>
    start(async () => {
      const res = await setGeminiApiKey({ apiKey });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      toast({ type: "success", message: "已儲存 Gemini 金鑰" });
      setApiKey("");
    });

  const clearKey = () =>
    start(async () => {
      const res = await clearGeminiApiKey();
      toast(
        res.ok
          ? { type: "success", message: "已移除 Gemini 金鑰" }
          : { type: "error", message: res.error },
      );
    });

  return (
    <div className="space-y-4">
      {/* Profile */}
      <Card>
        <SectionHeader title="個人資料" />
        <div className="mt-3 space-y-3">
          <Select label="性別" value={form.gender} onChange={set("gender")}>
            <option value="">未設定</option>
            <option value="male">男</option>
            <option value="female">女</option>
          </Select>
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="年齡"
              type="number"
              inputMode="numeric"
              value={form.age}
              onChange={set("age")}
            />
            <Input
              label="身高"
              type="number"
              inputMode="decimal"
              suffix="cm"
              value={form.height}
              onChange={set("height")}
            />
            <Input
              label="體重"
              type="number"
              inputMode="decimal"
              suffix="kg"
              value={form.weight}
              onChange={set("weight")}
            />
          </div>
          <Select
            label="活動量"
            value={form.activity_level}
            onChange={set("activity_level")}
          >
            <option value="">未設定</option>
            {ACTIVITY.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Goals */}
      <Card>
        <SectionHeader title="每日目標" />
        <div className="mt-3 space-y-3">
          <Input
            label="熱量目標"
            type="number"
            inputMode="numeric"
            suffix="kcal"
            value={form.daily_calorie_goal}
            onChange={set("daily_calorie_goal")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="蛋白質"
              type="number"
              inputMode="numeric"
              suffix="g"
              value={form.protein_goal}
              onChange={set("protein_goal")}
            />
            <Input
              label="碳水"
              type="number"
              inputMode="numeric"
              suffix="g"
              value={form.carbs_goal}
              onChange={set("carbs_goal")}
            />
            <Input
              label="脂肪"
              type="number"
              inputMode="numeric"
              suffix="g"
              value={form.fat_goal}
              onChange={set("fat_goal")}
            />
            <Input
              label="纖維"
              type="number"
              inputMode="numeric"
              suffix="g"
              value={form.fiber_goal}
              onChange={set("fiber_goal")}
            />
          </div>
          <Input
            label="鈉上限"
            type="number"
            inputMode="numeric"
            suffix="mg"
            value={form.sodium_goal}
            onChange={set("sodium_goal")}
          />
        </div>
        <Button
          fullWidth
          className="mt-4"
          onClick={saveProfile}
          disabled={pending}
        >
          {pending ? "儲存中…" : "儲存設定"}
        </Button>
      </Card>

      {/* Gemini key */}
      <Card>
        <div className="flex items-center justify-between">
          <SectionHeader title="Gemini API 金鑰" />
          <Badge tone={hasGeminiKey ? "success" : "neutral"}>
            {hasGeminiKey ? "已設定" : "未設定"}
          </Badge>
        </div>
        <p className="type-caption text-muted mt-2">
          用於拍照/文字估算營養素。金鑰只存在伺服器端，不會出現在前端。
        </p>
        <div className="mt-3 space-y-3">
          <Input
            label="金鑰"
            type="password"
            autoComplete="off"
            placeholder="貼上你的 Gemini API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={saveKey} disabled={pending || !apiKey} fullWidth>
              儲存金鑰
            </Button>
            {hasGeminiKey && (
              <Button variant="secondary" onClick={clearKey} disabled={pending}>
                移除
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Sign out */}
      <form action={signOut}>
        <Button type="submit" variant="ghost" fullWidth>
          登出
        </Button>
      </form>
    </div>
  );
}
