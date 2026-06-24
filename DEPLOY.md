# 部署指南（DietLife → Vercel + Supabase）

> 架構回顧（見 `CLAUDE.md`）：GitHub repo 在**開發者**帳號且為 **Public**；Supabase
> 與 Vercel 都在**朋友（產品擁有者）**帳號。開發者 push main → 朋友的 Vercel 自動部署。

---

## 0. 前置（已完成 ✅）
- [x] Public repo：`https://github.com/daupaul/DietLife`
- [x] Supabase 專案（朋友帳號）+ schema/RLS 已套用
- [x] `pnpm build` 本地通過、無錯誤

---

## 1. Supabase Auth 設定（朋友的 Supabase Dashboard）
Authentication → **URL Configuration**：
- **Site URL** 設為正式網址（部署後拿到，例如 `https://dietlife.vercel.app`）。
- **Redirect URLs** 也加上同一個網址。

Authentication → **Providers → Email**：
- 本專案用 **Email + 密碼**登入。為了讓使用者註冊後能直接登入，建議**關閉
  「Confirm email」**（否則要收確認信，且確認連結會指向 Site URL）。
  - 若保留 Email 確認：務必先設好上面的 Site URL，否則確認連結會壞。

> 註：登入是密碼制、不走 OAuth/magic-link，所以不需要額外 callback 路由。

---

## 2. 朋友的 Vercel 匯入 repo（方法 A：協作）
1. 開發者先到 GitHub repo → Settings → Collaborators，邀請朋友的 GitHub 帳號。
2. 朋友用他的 GitHub 登入 **vercel.com** → **Add New… → Project** →
   選 `daupaul/DietLife` → **Import**。
3. Framework 會自動偵測為 **Next.js**（不用改 build 設定，零設定即可）。

---

## 3. 環境變數（Vercel → Project → Settings → Environment Variables）
**在第一次部署前**就要加好這三個（Production + Preview 都勾），值用朋友 Supabase 的：

| Name | 值 | 範圍 | 機密？ |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | All | 否（可公開） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` | All | 否（可公開） |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_…` | All | **是，機密** |

來源：Supabase → Project Settings → **API**（publishable / secret keys）。
本機 `.env.local` 裡也有同樣三個值可對照（`.env.local` 不會進 git）。

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` 是機密：只會在 server 端使用，絕不可設成
> `NEXT_PUBLIC_*`、絕不可寫進程式碼或 commit。

---

## 4. 部署 + 驗收
1. 按 **Deploy**（或 push main 觸發）。等 build 完成拿到網址。
2. 回到 **步驟 1** 把 Supabase 的 Site URL 改成這個正式網址（若部署後才知道）。
3. 驗收清單：
   - [ ] 打開網址 → 自動導到 `/login`
   - [ ] 註冊新帳號 → 能登入（沒卡在收信）
   - [ ] 設定頁填基本資料 → 儀表板算出 BMR/TDEE/剩餘熱量
   - [ ] 飲食/運動/體重 能新增、刪除、看歷史
   - [ ] 飲食頁「智慧估算」：先在設定頁存自己的 Gemini key → 文字/拍照估算
   - [ ] 重新整理資料仍在（Supabase 雲端同步正常）

---

## 5. 持續部署 / Rollback
- 之後開發者 push 到 `main` → Vercel 自動重新部署。
- 出問題：Vercel → Deployments → 選上一個正常版本 → **Promote to Production**（即時 rollback）。

## 6. Migration（schema 有變更時）
- 新增 SQL 檔到 `supabase/migrations/`。
- 套用方式（擇一）：Supabase CLI `supabase db push`（需 DB 密碼），或把 SQL 貼進
  Dashboard **SQL Editor** 執行。每張表都要有 RLS。
