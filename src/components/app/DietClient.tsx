"use client";

import { useRef, useState, useTransition } from "react";
import { Camera } from "lucide-react";
import {
  AnimatedCheckbox,
  Button,
  Card,
  CustomDateTimePicker,
  FavoriteFoodItem,
  Input,
  SectionHeader,
  Select,
  useToast,
} from "@/components/ui";
import { addDietLog, addFavoriteFood } from "@/lib/data/actions";
import {
  estimateFoodFromImage,
  estimateFoodFromText,
} from "@/lib/data/gemini.actions";
import { MEAL_CATEGORIES } from "@/lib/constants";
import { taipeiNowInput } from "@/lib/datetime";
import { useDatetimeField } from "@/lib/useDatetimeField";
import type { ActionResult } from "@/lib/data/types";
import type { NutritionEstimate } from "@/lib/gemini/estimate";
import type { FavoriteFood } from "@/types/db";

const EMPTY = {
  name: "",
  category: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fiber: "",
  sodium: "",
};
type FormState = typeof EMPTY;

const num = (v: string) => (v === "" ? 0 : v);

/** Load an image file, downscale to maxDim, return JPEG base64 (no prefix). */
function resizeToBase64(
  file: File,
  maxDim: number,
  quality: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no canvas context"));
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image load failed"));
    };
    img.src = url;
  });
}

export function DietClient({ favorites }: { favorites: FavoriteFood[] }) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const {
    value: datetime,
    setValue: setDatetime,
    reset: resetDatetime,
  } = useDatetimeField();
  const [saveFav, setSaveFav] = useState(false);
  const [favCategory, setFavCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [pending, start] = useTransition();

  // AI estimate
  const [aiText, setAiText] = useState("");
  const [aiPending, startAi] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const fillFromEstimate = (est: NutritionEstimate) => {
    const n = (v: number) => String(Math.round(v));
    setForm({
      name: est.name ?? "",
      category: "",
      calories: n(est.calories),
      protein: n(est.protein),
      carbs: n(est.carbs),
      fat: n(est.fat),
      fiber: n(est.fiber),
      sodium: n(est.sodium),
    });
  };

  const handleEstimate = (res: ActionResult<NutritionEstimate>) => {
    if (res.ok && res.data) {
      fillFromEstimate(res.data);
      toast({ type: "success", message: `已估算：${res.data.name}` });
    } else {
      toast({ type: "error", message: res.ok ? "估算失敗" : res.error });
    }
  };

  const estimateText = () =>
    startAi(async () =>
      handleEstimate(await estimateFoodFromText({ description: aiText })),
    );

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ type: "error", message: "請選擇圖片檔" });
      return;
    }
    startAi(async () => {
      try {
        // Downscale in the browser so the payload stays well under the Server
        // Action body limit (and Gemini gets a cheaper, sufficient image).
        const base64 = await resizeToBase64(file, 1024, 0.8);
        handleEstimate(
          await estimateFoodFromImage({ mimeType: "image/jpeg", base64 }),
        );
      } catch {
        toast({ type: "error", message: "圖片處理失敗，請換一張試試" });
      }
    });
  };

  const set =
    (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const nutrients = (f: FormState) => ({
    calories: num(f.calories),
    protein: num(f.protein),
    carbs: num(f.carbs),
    fat: num(f.fat),
    fiber: num(f.fiber),
    sodium: num(f.sodium),
  });

  const submit = () =>
    start(async () => {
      const res = await addDietLog({
        datetime,
        name: form.name,
        category: form.category || null,
        ...nutrients(form),
      });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      if (saveFav) {
        const favRes = await addFavoriteFood({
          name: form.name,
          category: favCategory || null,
          ...nutrients(form),
        });
        if (!favRes.ok)
          toast({ type: "error", message: "紀錄已存，但常用食物儲存失敗" });
      }
      toast({
        type: "success",
        message: saveFav ? "已記錄並存為常用食物" : "已記錄飲食",
      });
      setForm(EMPTY);
      setSaveFav(false);
      setFavCategory("");
      resetDatetime();
    });

  const fill = (fav: FavoriteFood) => {
    setForm({
      name: fav.name,
      category: fav.category ?? "",
      calories: String(fav.calories),
      protein: String(fav.protein),
      carbs: String(fav.carbs),
      fat: String(fav.fat),
      fiber: String(fav.fiber),
      sodium: String(fav.sodium),
    });
    toast({ type: "info", message: `已填入「${fav.name}」` });
  };

  const quickAdd = (fav: FavoriteFood) =>
    start(async () => {
      const res = await addDietLog({
        datetime: taipeiNowInput(),
        name: fav.name,
        category: fav.category,
        calories: fav.calories,
        protein: fav.protein,
        carbs: fav.carbs,
        fat: fav.fat,
        fiber: fav.fiber,
        sodium: fav.sodium,
      });
      if (!res.ok) {
        toast({ type: "error", message: res.error });
        return;
      }
      toast({ type: "success", message: `已帶入「${fav.name}」一筆` });
    });

  const filtered = favorites.filter(
    (f) =>
      (!keyword || f.name.includes(keyword)) &&
      (!filterCat || f.category === filterCat),
  );

  return (
    <div className="space-y-4">
      {/* AI estimate */}
      <Card>
        <SectionHeader title="智慧估算" />
        <p className="type-caption text-muted mt-1">
          用文字描述或拍照，自動估算營養並填入下方表單。
        </p>
        <div className="mt-3 space-y-3">
          <Input
            placeholder="例如：一個滷雞腿便當"
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={estimateText}
              disabled={aiPending || !aiText.trim()}
            >
              {aiPending ? "估算中…" : "文字估算"}
            </Button>
            <Button
              variant="secondary"
              className="shrink-0"
              onClick={() => fileRef.current?.click()}
              disabled={aiPending}
            >
              <Camera className="size-4" strokeWidth={2.5} />
              照片
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPhoto}
          />
        </div>
      </Card>

      {/* Add form */}
      <Card>
        <SectionHeader title="新增飲食" />
        <div className="mt-3 space-y-3">
          <Input
            label="名稱"
            placeholder="例如：雞胸肉便當"
            value={form.name}
            onChange={set("name")}
          />
          <Select label="類別" value={form.category} onChange={set("category")}>
            <option value="">未分類</option>
            {MEAL_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <CustomDateTimePicker
            label="時間"
            value={datetime}
            onChange={setDatetime}
          />
          <Input
            label="熱量"
            type="number"
            inputMode="decimal"
            placeholder="0"
            suffix="kcal"
            value={form.calories}
            onChange={set("calories")}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="蛋白質"
              type="number"
              inputMode="decimal"
              suffix="g"
              value={form.protein}
              onChange={set("protein")}
            />
            <Input
              label="碳水"
              type="number"
              inputMode="decimal"
              suffix="g"
              value={form.carbs}
              onChange={set("carbs")}
            />
            <Input
              label="脂肪"
              type="number"
              inputMode="decimal"
              suffix="g"
              value={form.fat}
              onChange={set("fat")}
            />
            <Input
              label="纖維"
              type="number"
              inputMode="decimal"
              suffix="g"
              value={form.fiber}
              onChange={set("fiber")}
            />
          </div>
          <Input
            label="鈉"
            type="number"
            inputMode="decimal"
            placeholder="0"
            suffix="mg"
            value={form.sodium}
            onChange={set("sodium")}
          />

          <AnimatedCheckbox
            checked={saveFav}
            onCheckedChange={setSaveFav}
            label="同步存為常用食物"
          >
            <Select
              label="歸類到"
              value={favCategory}
              onChange={(e) => setFavCategory(e.target.value)}
            >
              <option value="">未分類</option>
              {MEAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </AnimatedCheckbox>

          <Button fullWidth onClick={submit} disabled={pending || !form.name}>
            {pending ? "儲存中…" : "記錄飲食"}
          </Button>
        </div>
      </Card>

      {/* Favorites */}
      <Card>
        <SectionHeader title="常用食物" />
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="搜尋名稱"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
            >
              <option value="">全部類別</option>
              {MEAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="type-caption text-muted py-4 text-center">
              {favorites.length === 0
                ? "還沒有常用食物，記錄時勾選「同步存常用食物」即可建立。"
                : "沒有符合的常用食物。"}
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((f) => (
                <FavoriteFoodItem
                  key={f.id}
                  food={{
                    name: f.name,
                    category: f.category ?? "未分類",
                    calories: f.calories,
                  }}
                  onFill={() => fill(f)}
                  onQuickAdd={() => quickAdd(f)}
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
