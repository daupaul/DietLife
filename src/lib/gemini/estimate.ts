import "server-only";

export interface NutritionEstimate {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export type GeminiErrorCode = "invalid_key" | "unavailable" | "unknown";

export class GeminiError extends Error {
  constructor(
    public code: GeminiErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

const NUTRITION_SYSTEM =
  "你是專業營養估算助手。根據使用者提供的食物（文字描述或照片），估算「單份」的營養成分。" +
  "單位：calories=大卡(kcal)、protein/carbs/fat/fiber=公克(g)、sodium=毫克(mg)。" +
  "name 用簡短的中文食物名稱。數值用合理估計的整數或一位小數，不確定時給最佳估計，不要回 0。只輸出 JSON。";

const NUTRITION_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    calories: { type: "NUMBER" },
    protein: { type: "NUMBER" },
    carbs: { type: "NUMBER" },
    fat: { type: "NUMBER" },
    fiber: { type: "NUMBER" },
    sodium: { type: "NUMBER" },
  },
  required: ["name", "calories", "protein", "carbs", "fat", "fiber", "sodium"],
} as const;

const METS_SYSTEM =
  "你是運動生理專家。根據使用者描述的運動項目，估算其 METs（代謝當量）數值。" +
  "一般範圍 2–12（如散步約 3、慢跑約 7、高強度間歇約 10）。只輸出 JSON。";

const METS_SCHEMA = {
  type: "OBJECT",
  properties: { mets: { type: "NUMBER" } },
  required: ["mets"],
} as const;

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

type Part =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

type Schema = Record<string, unknown>;

async function call(
  apiKey: string,
  parts: Part[],
  system: string,
  schema: Schema,
): Promise<unknown> {
  const body = {
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.2,
    },
  };

  let lastErr: GeminiError = new GeminiError("unavailable", "暫時無法使用");

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    if (attempt > 0) await sleep(1000 * 2 ** (attempt - 1)); // 1s, 2s

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch {
      lastErr = new GeminiError("unavailable", "連線逾時，請稍後再試");
      continue;
    } finally {
      clearTimeout(timer);
    }

    // Transient → retry.
    if (res.status === 429 || res.status >= 500) {
      lastErr = new GeminiError("unavailable", "Gemini 暫時忙碌，請稍後再試");
      continue;
    }
    // Bad key / forbidden → not retryable.
    if (res.status === 400 || res.status === 401 || res.status === 403) {
      throw new GeminiError("invalid_key", "Gemini 金鑰無效或無權限");
    }
    if (!res.ok) throw new GeminiError("unknown", "估算失敗");

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new GeminiError("unknown", "無法解析回應");
    try {
      return JSON.parse(text);
    } catch {
      throw new GeminiError("unknown", "回應格式錯誤");
    }
  }

  throw lastErr;
}

export async function estimateFromText(
  apiKey: string,
  description: string,
): Promise<NutritionEstimate> {
  return (await call(
    apiKey,
    [{ text: `食物描述：${description}` }],
    NUTRITION_SYSTEM,
    NUTRITION_SCHEMA,
  )) as NutritionEstimate;
}

export async function estimateFromImage(
  apiKey: string,
  base64: string,
  mimeType: string,
): Promise<NutritionEstimate> {
  return (await call(
    apiKey,
    [
      { inline_data: { mime_type: mimeType, data: base64 } },
      { text: "請估算這張食物照片的單份營養成分。" },
    ],
    NUTRITION_SYSTEM,
    NUTRITION_SCHEMA,
  )) as NutritionEstimate;
}

/** Estimate METs for an arbitrary exercise description. */
export async function estimateMets(
  apiKey: string,
  activity: string,
): Promise<number> {
  const out = (await call(
    apiKey,
    [{ text: `運動項目：${activity}` }],
    METS_SYSTEM,
    METS_SCHEMA,
  )) as { mets?: number };
  return typeof out.mets === "number" ? out.mets : 0;
}
