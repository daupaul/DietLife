# DietLife 飲控生活

雲端同步的飲食控制與體重追蹤 app，**手機優先**。本專案為既有 `index.html` 原型的正式重構版。

**線上版**：https://dietlife.vercel.app　·　部署細節見 [`DEPLOY.md`](./DEPLOY.md)

> **唯一真實來源（Source of Truth）**
> - 視覺、資料模型、計算邏輯、功能行為 → 交接規格書
> - 技術架構 → 重構 prompt（本 README 的架構章節即其落地）

---

## 技術棧（鎖定，不得替換）

| 層面     | 選用                                                       |
| -------- | ---------------------------------------------------------- |
| 框架     | Next.js 16（App Router）+ TypeScript（strict）             |
| 樣式     | Tailwind CSS v4 + CSS 變數做 design token                  |
| 後端/DB  | Supabase（Postgres，純資料庫）+ Row Level Security 防線     |
| 認證     | 自訂帳號密碼（`app_users`，scrypt 雜湊 + 簽章 JWT cookie）   |
| 部署     | Vercel                                                     |
| 套件管理 | pnpm（版本由 `pnpm-lock.yaml` 鎖定）                       |

### Serverless 2.0 架構原則

1. 不自架長駐 server（無 Express / 常駐 Node）。
2. 預設一切為 React Server Components；只有需互動的元件標 `'use client'`。
3. 寫入走 **Server Actions**；讀取在 Server Component 內直接查。只有第三方
   webhook / 真正需 REST 時才用 Route Handlers。
4. 商業邏輯（BMR/TDEE/各項計算、Gemini 呼叫）只在 server 端。
5. 資料安全靠 Supabase **RLS**：每個 table 都有 policy，使用者只能讀寫自己的
   資料（`auth.uid() = user_id`）。
6. `NEXT_PUBLIC_*` 只放可公開的 anon key；service role key 與使用者 Gemini key
   只在 server 端使用，絕不進 client bundle。

---

## 資料夾結構

```
src/
  app/                 # App Router：路由、layout、頁面（RSC 為主）
    layout.tsx         # 根 layout：字體、viewport（safe-area）、metadata
    globals.css        # Tailwind 入口 + design token 基底（完整 token 在 Phase 1）
    page.tsx           # 暫時首頁（正式五分頁於 Phase 3）
  components/
    ui/                # 可重用元件庫（Phase 1，全部吃 token、零 inline style）
  lib/
    supabase/          # Supabase client（client.ts 瀏覽器、server.ts 伺服器）
    calc/              # 純函式計算邏輯（BMR/TDEE/剩餘熱量…，Phase 3，可單測）
    validation/        # Zod schema（Server Action 入參驗證，Phase 2+）
    actions/           # Server Actions（資料寫入，Phase 2+）
  types/               # 共用型別
supabase/
  migrations/          # SQL migration（schema + RLS policy，Phase 2）
```

---

## 開發

```bash
pnpm install                 # 安裝相依（sharp 建置已於 pnpm-workspace.yaml 允許）
cp .env.example .env.local   # 填入 Supabase 連線資訊
pnpm dev                     # 本地開發（http://localhost:3000）
```

### 常用指令

| 指令                | 作用                                  |
| ------------------- | ------------------------------------- |
| `pnpm dev`          | 本地開發伺服器                        |
| `pnpm build`        | 正式建置                              |
| `pnpm lint`         | ESLint（含 strict、no-explicit-any）  |
| `pnpm typecheck`    | TypeScript 型別檢查（`tsc --noEmit`） |
| `pnpm format`       | Prettier 格式化                       |
| `pnpm format:check` | 檢查格式（CI 用）                     |

---

## 環境變數

見 `.env.example`。重點：

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 可公開，靠 RLS 保護。
- `SUPABASE_SERVICE_ROLE_KEY` — **僅 server 端**，繞過 RLS，絕不進 client。
- 使用者 Gemini API key 不放環境變數，存於 `profiles.gemini_api_key`，僅 server 端讀取。

`.env*` 已被 `.gitignore` 排除，機密不會進 git。

---

## 安裝為 App（PWA）

本站是 PWA，可加到主畫面像原生 app 一樣全螢幕開啟：

- **iPhone（Safari）**：開 https://dietlife.vercel.app → 分享鈕 􀈂 → 「加入主畫面」→ 加入。
- **Android（Chrome）**：開網站 → 右上 ⋮ → 「安裝應用程式 / 加到主畫面」。
- **電腦（Chrome/Edge）**：網址列右側的安裝圖示 → 安裝。

（含 manifest、service worker、各尺寸圖示；尊重手機瀏海/安全區域。）

## 運動消耗自動計算

運動頁可從下拉選預設項目（重訓/腳踏車/爬坡/慢走/快走/瑜珈/皮拉提斯/飛輪），
依 `kcal = METs × 體重 × 時數` 自動帶入消耗；選「其他」並輸入自訂項目時，用
Gemini 估該運動的 METs 再套同一公式。

## 開發階段（依序進行，每階段完成停下確認）

- [x] **Phase 0** — 專案骨架
- [x] **Phase 1** — 設計系統 + 元件庫（`/styleguide` 活文件）— Sage 編輯風
- [x] **Phase 2** — 資料層 + 自訂帳號密碼認證（後改為非 Supabase Auth）
- [x] **Phase 3** — 功能畫面（儀表 / 體重 / 飲食 / 運動 / 設定）+ 歷史日期導覽
- [x] **Phase 3.5** — Gemini 2.5 Flash 拍照/文字成分估算
- [x] **Phase 4** — 部署上線（Vercel + GitHub Actions CD）→ https://dietlife.vercel.app
