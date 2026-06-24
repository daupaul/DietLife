"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  CustomDateTimePicker,
  Input,
  SectionHeader,
  useToast,
} from "@/components/ui";
import { addExerciseLog } from "@/lib/data/actions";
import { useDatetimeField } from "@/lib/useDatetimeField";

export function ExerciseForm() {
  const { toast } = useToast();
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");
  const [calories, setCalories] = useState("");
  const {
    value: datetime,
    setValue: setDatetime,
    reset: resetDatetime,
  } = useDatetimeField();
  const [pending, start] = useTransition();

  const submit = () =>
    start(async () => {
      const res = await addExerciseLog({
        datetime,
        type,
        duration: duration === "" ? null : duration,
        calories_burned: calories === "" ? 0 : calories,
      });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      toast({ type: "success", message: "已記錄運動" });
      setType("");
      setDuration("");
      setCalories("");
      resetDatetime();
    });

  return (
    <Card>
      <SectionHeader title="新增運動" />
      <div className="mt-3 space-y-3">
        <Input
          label="運動類型"
          placeholder="例如：跑步、重訓"
          value={type}
          onChange={(e) => setType(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="時長"
            type="number"
            inputMode="decimal"
            suffix="分"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
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
        <CustomDateTimePicker
          label="時間"
          value={datetime}
          onChange={setDatetime}
        />
        <Button
          fullWidth
          onClick={submit}
          disabled={pending || !type || !calories}
        >
          {pending ? "儲存中…" : "記錄運動"}
        </Button>
      </div>
    </Card>
  );
}
