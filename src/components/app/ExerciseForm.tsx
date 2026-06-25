"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import {
  Button,
  Card,
  CustomDateTimePicker,
  Input,
  SectionHeader,
  Select,
  useToast,
} from "@/components/ui";
import { addExerciseLog } from "@/lib/data/actions";
import { estimateExerciseMets } from "@/lib/data/gemini.actions";
import { caloriesBurned } from "@/lib/calc/nutrition";
import { EXERCISE_METS, EXERCISE_OTHER, EXERCISE_TYPES } from "@/lib/constants";
import { useDatetimeField } from "@/lib/useDatetimeField";

const r = Math.round;

export function ExerciseForm({ weightKg }: { weightKg: number | null }) {
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [customName, setCustomName] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const {
    value: datetime,
    setValue: setDatetime,
    reset: resetDatetime,
  } = useDatetimeField();
  const [pending, start] = useTransition();
  const [aiPending, startAi] = useTransition();

  const isOther = type === EXERCISE_OTHER;

  // Auto-fill calories for known types when type/duration change (kcal = METs×kg×hr).
  const recalc = (t: string, durStr: string) => {
    const mets = EXERCISE_METS[t];
    const dur = Number(durStr);
    if (mets && weightKg && dur > 0) {
      setCalories(String(r(caloriesBurned(mets, weightKg, dur))));
    }
  };

  const onType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const t = e.target.value;
    setType(t);
    if (t in EXERCISE_METS) recalc(t, duration);
  };
  const onDuration = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = e.target.value;
    setDuration(d);
    if (type in EXERCISE_METS) recalc(type, d);
  };

  const estimateOther = () =>
    startAi(async () => {
      if (!customName.trim()) {
        toast({ type: "error", message: "請先輸入運動項目" });
        return;
      }
      if (!weightKg) {
        toast({ type: "error", message: "請先到設定填入體重" });
        return;
      }
      if (!(Number(duration) > 0)) {
        toast({ type: "error", message: "請先輸入時長" });
        return;
      }
      const res = await estimateExerciseMets({ activity: customName });
      if (!res.ok || !res.data) {
        toast({ type: "error", message: res.ok ? "估算失敗" : res.error });
        return;
      }
      const kcal = r(caloriesBurned(res.data.mets, weightKg, Number(duration)));
      setCalories(String(kcal));
      toast({
        type: "success",
        message: `估算 METs ${res.data.mets} → ${kcal} kcal`,
      });
    });

  const submit = () =>
    start(async () => {
      const finalType = isOther ? customName.trim() : type;
      if (!finalType) {
        toast({ type: "error", message: "請選擇或輸入運動項目" });
        return;
      }
      const res = await addExerciseLog({
        datetime,
        type: finalType,
        duration: duration === "" ? null : duration,
        calories_burned: calories === "" ? 0 : calories,
      });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      toast({ type: "success", message: "已記錄運動" });
      setType("");
      setCustomName("");
      setDuration("");
      setCalories("");
      resetDatetime();
    });

  return (
    <Card>
      <SectionHeader title="新增運動" />
      <div className="mt-3 space-y-3">
        <Select label="運動項目" value={type} onChange={onType}>
          <option value="">選擇運動</option>
          {EXERCISE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}（METs {EXERCISE_METS[t]}）
            </option>
          ))}
          <option value={EXERCISE_OTHER}>{EXERCISE_OTHER}</option>
        </Select>

        {isOther && (
          <div className="space-y-2">
            <Input
              label="自訂項目"
              placeholder="例如：拳擊、登山"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Button
              variant="secondary"
              fullWidth
              onClick={estimateOther}
              disabled={aiPending}
            >
              <Sparkles className="size-4" strokeWidth={2.5} />
              {aiPending ? "AI 估算中…" : "用 AI 估算消耗"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="時長"
            type="number"
            inputMode="decimal"
            suffix="分"
            value={duration}
            onChange={onDuration}
          />
          <Input
            label="消耗"
            type="number"
            inputMode="decimal"
            suffix="kcal"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
          />
        </div>
        {!weightKg && (
          <p className="type-caption text-muted">
            提示：到「設定」填體重後，選項目+時長會自動算消耗。
          </p>
        )}

        <CustomDateTimePicker
          label="時間"
          value={datetime}
          onChange={setDatetime}
        />
        <Button fullWidth onClick={submit} disabled={pending || !calories}>
          {pending ? "儲存中…" : "記錄運動"}
        </Button>
      </div>
    </Card>
  );
}
