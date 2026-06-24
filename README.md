# DietLife 飲控生活

雲端同步的飲食控制與體重追蹤 app，**手機優先**。本專案為既有 `index.html` 原型的正式重構版。

> **唯一真實來源（Source of Truth）**
> - 視覺、資料模型、計算邏輯、功能行為 → 交接規格書
> - 技術架構 → 重構 prompt（本 README 的架構章節即其落地）

---

## 技術棧（鎖定，不得替換）

| 層面     | 選用                                                       |
| -------- | ---------------------------------------------------------- |
| 框架     | Next.js 16（App Router）+ TypeScript（strict）             |
| 樣式     | Tailwind CSS v4 + CSS 變數做 design token                  |
| 後端/DB  | Supabase（Postgres + Auth + Row Level Security）           |
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

## 開發階段（依序進行，每階段完成停下確認）

- [x] **Phase 0** — 專案骨架
- [ ] **Phase 1** — 設計系統 + 元件庫（`/styleguide` 活文件）
- [ ] **Phase 2** — 資料層（Supabase schema + RLS + Auth + typed data access）
- [ ] **Phase 3** — 功能畫面（儀表 / 體重 / 飲食 / 運動 / 設定）
- [ ] **Phase 3.5** — Gemini 2.5 Flash 拍照/文字成分估算
- [ ] **Phase 4** — 部署（Vercel + Supabase）
