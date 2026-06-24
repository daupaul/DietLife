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
import { addWeightLog } from "@/lib/data/actions";
import { useDatetimeField } from "@/lib/useDatetimeField";

export function WeightForm() {
  const { toast } = useToast();
  const {
    value: datetime,
    setValue: setDatetime,
    reset: resetDatetime,
  } = useDatetimeField();
  const [weight, setWeight] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    start(async () => {
      const res = await addWeightLog({ datetime, weight });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      toast({ type: "success", message: "已記錄體重" });
      setWeight("");
      resetDatetime();
    });
  };

  return (
    <Card>
      <SectionHeader title="新增體重" />
      <div className="mt-3 space-y-3">
        <CustomDateTimePicker
          label="時間"
          value={datetime}
          onChange={setDatetime}
        />
        <Input
          label="體重"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="0.0"
          suffix="kg"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <Button fullWidth onClick={submit} disabled={pending || !weight}>
          {pending ? "儲存中…" : "記錄"}
        </Button>
      </div>
    </Card>
  );
}
